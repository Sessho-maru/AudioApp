import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import AudioCard from './AudioCard';
import AudioInfo from './Audioinfo';

var tagArray = [];
var numProcessedItem = 0;
var numDurationsReceived = 0;

class Main extends Component
{
    constructor()
    {
        super();
        this.jsmediatags = require('jsmediatags');

        this.audioCards = [];
        this.timeoutId = "";
        this.audio = null;
        this.pausedAt = 0;
        this.CUE = {
            CUR: "",
            NEXT: ""
        };

        this.state = {
            isNeedToReRender: false,
            isPlaying: false,
        };
    }

    queueNextAudio = (pausedAt = 0) => {
        clearTimeout(this.timeoutId);
        this.CUE.NEXT = (parseInt(this.CUE.CUR) + 1).toString();
        this.timeoutId = setTimeout( () => {
            if (parseInt(this.CUE.NEXT) === tagArray.length) {
                this.CUE.NEXT = this.CUE.CUR;
                this._playAndChangeStateAndAlterLabel();
            }
            else {
                this._playAndChangeStateAndAlterLabel();
            }
        }, (tagArray[this.CUE.CUR].duration - pausedAt) * 1000 );
    }

    _pauseAndChangeState = () => {
        if (this.state.isPlaying === true)
        {
            console.log("PAUSE");

            clearTimeout(this.timeoutId);
            this.pausedAt = this.audio.currentTime;
            this.audio.pause();

            this.setState({
                isPlaying: false
            });
        }
        else
        {
            if (this.audio !== null)
            {
                console.log("PLAY");
                this.audio.play();

                this.queueNextAudio(this.pausedAt);
                this.setState({
                    isPlaying: true
                });
            }
        }
    }

    _stop = () => {
        console.log("STOP");
        clearTimeout(this.timeoutId);
        this.audio.pause();
        this.audio = null;
    }

    _playAndChangeStateAndAlterLabel = () => {
        console.log("PLAY");

        let mode = "";
        let alterPlayingLabel = (mode) => {
            switch (mode) {
                case 'play':
                    document.getElementById(`${this.CUE.CUR}`).innerHTML = "stop";
                    document.getElementById(`${this.CUE.CUR}_selected`).classList.add("indigo");
                    break;
                case 'stop':
                    document.getElementById(`${this.CUE.CUR}`).innerHTML = "play";
                    document.getElementById(`${this.CUE.CUR}_selected`).classList.remove("indigo");
                    break;
                case 'change':
                    document.getElementById(`${this.CUE.CUR}`).innerHTML = "play";
                    document.getElementById(`${this.CUE.CUR}_selected`).classList.remove("indigo");
                    document.getElementById(`${this.CUE.NEXT}`).innerHTML = "stop";
                    document.getElementById(`${this.CUE.NEXT}_selected`).classList.add("indigo");
                    break;
            }
        }
        
        switch (true) {
            case this.CUE.CUR === "":
                mode = 'play';

                this.audio = new Audio(URL.createObjectURL(tagArray[this.CUE.NEXT].file));
                this.audio.play();

                this.CUE.CUR = this.CUE.NEXT;
                this.queueNextAudio();
                alterPlayingLabel(mode);

                this.pausedAt = 0;
                this.setState({
                    isPlaying: true
                });
                break;

            case this.CUE.CUR === this.CUE.NEXT:
                mode = 'stop';

                this._stop();

                alterPlayingLabel(mode);
                this.CUE.CUR = "";
                this.CUE.NEXT = "";

                this.pausedAt = 0;
                this.setState({
                    isPlaying: false
                });
                break;

            default:
                mode = 'change';

                this.audio.src = URL.createObjectURL(tagArray[this.CUE.NEXT].file);
                this.audio.play();
                
                alterPlayingLabel(mode);
                this.CUE.CUR = this.CUE.NEXT;
                this.queueNextAudio();

                this.pausedAt = 0;
                this.setState({
                    isPlaying: true
                });
        }
    }

    openFileDialog = (clearTagArray) => {
        if (clearTagArray === true)
        {
            let newFileDialog = document.getElementById('new');
            newFileDialog.click();
        }

        if (clearTagArray === false)
        {
            let appendFileDialog = document.getElementById('append');
            appendFileDialog.click();
        }
    }
    
    insertTagInfoAndChangeState = (event, initializing) => {
        if (initializing === true)
        {
            if (numProcessedItem > 0)
            {
                tagArray = [];
                this.audioCards = [];

                if (this.state.isPlaying === true || this.pausedAt !== 0)
                {
                    this._stop();
                    document.getElementById(`${this.CUE.CUR}`).innerHTML = "play";
                    document.getElementById(`${this.CUE.CUR}_selected`).classList.remove("indigo");
                }

                numProcessedItem = 0;
                numDurationsReceived = 0;
                this.CUE.CUR = "";
                this.CUE.NEXT = "";

                if (event.target.files.length === 0)
                {
                    this.setState({
                        isPlaying: false,
                        isNeedtoReRender: true
                    });
                    return;
                }
            }            
        }

        let checker = (tag, fileName) => {
            if (typeof(tag) === "undefined") { alert(`No any given Tag data!\n:${fileName}`); return; }
            if (tag.tags.title === undefined) { alert(`No given {Title}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artist} is required`); tag.tags.title = "untitled"; }
            if (tag.tags.artist === undefined) { alert(`No given {Artistname}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artistname} is required`); tag.tags.artist = ""; }
            if (tag.tags.picture === undefined) { alert(`No given Albumart data!\n:${fileName}`); }
        }

        let getDuration = (file, index) => {
            let fr = new FileReader();
            fr.readAsArrayBuffer(file);
            fr.onload = (readEvent) => {
                var audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContext.decodeAudioData(readEvent.target.result, (buffer) => {
                    tagArray[index].duration = buffer.duration;
                    console.log(`duration: ${buffer.duration} of ${index} is inserted`);

                    this.audioCards[index] =    <div key={index} className="container">
                                                    { React.cloneElement(this.audioCards[index].props.children, { isDone: true }) }
                                                </div>
                    numDurationsReceived = numDurationsReceived + 1;
                    if (numDurationsReceived === tagArray.length)
                    {
                        console.log("processing was completed");
                        this.setState({
                            isNeedToReRender: true
                        });
                    }
                });
            };
        }

        let triggerRerender = (numAdded) => {
            this.reRenderPage(numAdded);
            if (initializing === true)
            {   
                this.setState({
                    isPlaying: false,
                    isNeedtoReRender: true
                });
            }
            else
            {
                this.setState({
                    isNeedtoReRender: true
                });
            }
        }

        let fileList = event.target.files;
        let numAdded = fileList.length;
        tagArray.length = numProcessedItem + numAdded;

        Array.from(fileList).map( (each) => {
            console.log("insertTagInfo->map() has ran");

            this.jsmediatags.read(each, {
                onSuccess: function(tag) {
                    console.log("jsmediaTags.read() has been run");
                    
                    checker(tag, each.name);
                    tag.tags.file = each;
                    tagArray[numProcessedItem] = tag.tags;
                    getDuration(each, numProcessedItem);

                    numProcessedItem = numProcessedItem + 1;
                    if (numProcessedItem === tagArray.length) { triggerRerender(numAdded); }
                },
                onError: function(error) {
                    console.log("jsmediaTags.read() has been run, but failed");
                    checker(undefined, each.name);
                    numProcessedItem = numProcessedItem + 1;
                }
            });

        });
    }

    reRenderPage = (numBeGoingToRender) => {
        console.log("reRenderPage() is going to run!!");

        let startingIndex = 0;
        if (numProcessedItem === 0)
        {
            startingIndex = 0;
        }
        else
        {
            startingIndex = numProcessedItem - numBeGoingToRender;
        }

        for (let i = 0; i < numBeGoingToRender; i++)
        {
            let paramsForAudioInfo = {
                pathname: `/${startingIndex}`,
                audioInfo: {
                    title: tagArray[startingIndex].title,
                    artist: tagArray[startingIndex].artist,
                    album: tagArray[startingIndex].album,
                    year: tagArray[startingIndex].year,
                    track: tagArray[startingIndex].track,
                    coverData: tagArray[startingIndex].picture,
                },
                isHaveArt: true,
                albumArtUrl: "",
                index: startingIndex
            };

            if (paramsForAudioInfo.audioInfo.coverData === undefined) 
            {
                paramsForAudioInfo.isHaveArt = false;
                paramsForAudioInfo.albumArtUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1200px-No_image_available.svg.png";
            }
            else
            {
                const { data, type } = paramsForAudioInfo.audioInfo.coverData;
                const byteArray = new Uint8Array(data);
                const blob = new Blob([byteArray], { type });
                paramsForAudioInfo.albumArtUrl = URL.createObjectURL(blob);
            }

            this.audioCards[startingIndex] =    <div key={startingIndex} className="container">
                                                    <AudioCard CUE={ this.CUE } audioInfoParams={ paramsForAudioInfo } _play={ this._playAndChangeStateAndAlterLabel }/>
                                                </div>
            startingIndex = startingIndex + 1;
        }
    }
    
    componentDidMount()
    {
        var elems = document.querySelectorAll('.fixed-action-btn');
        var instances = window.M.FloatingActionButton.init(elems, {
            direction: 'top'
        });
    }

    componentDidUpdate()
    {
        console.log("componentDidUpdate() has ran");
        console.log("this.state.isPlaying: " + this.state.isPlaying);
        if (this.state.isPlaying === true) { console.log(`nowPlaying: ${this.CUE.CUR}, duration: ${tagArray[this.CUE.CUR].duration - this.pausedAt}`); }
        console.log(`numProcessedItem: ${numProcessedItem}, tagArray.length: ${tagArray.length}`);
        console.log(`numDurationsReceived: ${numDurationsReceived}, tagArray.length: ${tagArray.length}`);
        console.log("tagArray: ", tagArray);
        console.log("============================");
    }

    componentWillUnmount()
    {
        clearTimeout(this.timeoutId);
    }

    render()
    {
        console.log("render() has ran");
        
        return (
            <div className="row">
                <div id="nav" className="col xl2 l2 m2 s2">
    
                    <div className="fixed-action-btn">
                        <a className="btn-floating btn-small grey lighten-1"><i className="large material-icons">add</i></a>
                        <ul>
                            <li>
                                <a onClick={ () => {this.openFileDialog(true)} } className="btn-floating green"><i className="material-icons">playlist_add</i></a>
                            </li>
                            <li>
                                <a onClick={ () => {this.openFileDialog(false)} } className="btn-floating blue"><i className="material-icons">queue</i></a>
                            </li>
                        </ul>
                    </div>
                </div>
  
                <div id="now_playing" className="col xl10 l10 m10 s10">
                    <a id="play_button" className="btn-floating btn-large waves-effect waves-light red">
                        <i className="large material-icons" onClick={ () => { this._pauseAndChangeState() }}>{ this.state.isPlaying === true ? "pause" : "play_arrow" }</i>
                    </a>
                    <div id="now_playing_tag">
                        <label id="album">{this.CUE.CUR === "" ? "- - -" : tagArray[this.CUE.CUR].album}</label>
                        <label id="artist_title">{this.CUE.CUR === "" ? "- - -" : `${tagArray[this.CUE.CUR].artist} - ${tagArray[this.CUE.CUR].title}`}</label>
                    </div>
                </div>
  
                <div id="content" className="col xl10 l10 m10 s10">
                    <Router>
                        <Route exact path="/" render={ () => { return (this.audioCards); }}/>
                        <Route exact path="/:audioIndex" component={AudioInfo} />
                    </Router>
                </div>

                <input type="file" id="new" onChange={ (event) => {this.insertTagInfoAndChangeState(event, true)} } multiple hidden/>
                <input type="file" id="append" onChange={ (event) => {this.insertTagInfoAndChangeState(event, false)} } multiple hidden/>
            </div>
        );
    }
}

export default Main;