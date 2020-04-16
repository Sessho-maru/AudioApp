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
        this.audioSlot = "";
        this.playButtonSymbol = "drag_handle";
        this.CUE = {
            CUR: "",
            NEXT: ""
        };

        this.state = {
            isNeedToReRender: false,
            isPlaying: false,
        };
    }

    _pause = () => {
        console.log("PAUSE");
        this.audioSlot.pause();
    }

    _play = () => {
        this.audioSlot.src = URL.createObjectURL(tagArray[this.CUE.NEXT].file);
        this.changePlayState();
    }

    changePlayState = () => {
        console.log("State is going to be change");
        console.log(`Now: ${this.CUE.CUR}, and Next is: ${this.CUE.NEXT}`);

        let setNext = () => {
            clearTimeout(this.timeoutId);
            this.CUE.NEXT = (parseInt(this.CUE.CUR) + 1).toString();
            this.timeoutId = setTimeout( () => {
                if (parseInt(this.CUE.NEXT) === tagArray.length) {
                    this.CUE.NEXT = this.CUE.CUR;
                    this.changePlayState();
                }
                else {
                    this._play();
                }
            }, (tagArray[this.CUE.CUR].duration) * 1000 );
        }
        
        if (this.CUE.CUR !== this.CUE.NEXT)
        {
            this.playButtonSymbol = "pause";
            if (this.CUE.CUR === "")
            {
                document.getElementById(`${this.CUE.NEXT}`).innerHTML = "stop";
                document.getElementById(`${this.CUE.NEXT}_selected`).classList.add("indigo");
                this.CUE.CUR = this.CUE.NEXT;
                setNext();
                this.setState({
                    isPlaying: true,
                    isNeedToReRender: true
                });
                return;
            }

            document.getElementById(`${this.CUE.CUR}`).innerHTML = "play";
            document.getElementById(`${this.CUE.CUR}_selected`).classList.remove("indigo");
            document.getElementById(`${this.CUE.NEXT}`).innerHTML = "stop";
            document.getElementById(`${this.CUE.NEXT}_selected`).classList.add("indigo");
            this.CUE.CUR = this.CUE.NEXT;
            setNext();
            this.setState({
                isNeedToReRender: true
            });
        }
        else
        {
            this.playButtonSymbol = "play_arrow";
            clearTimeout(this.timeoutId);
            this._pause();

            document.getElementById(`${this.CUE.CUR}`).innerHTML = "play";
            document.getElementById(`${this.CUE.CUR}_selected`).classList.remove("indigo");
            this.CUE.CUR = "";
            this.CUE.NEXT = "";
            this.setState({
                isPlaying: false,
                isNeedToReRender: true
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
    
    insertTagInfo = (event, initializing) => {
        if (initializing === true)
        {
            tagArray = [];
            this.audioCards = [];

            numProcessedItem = 0;
            numDurationsReceived = 0;
            this.CUE.CUR = "";
            this.CUE.NEXT = "";
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
            this.setState({
                isNeedtoReRender: true
            });
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
                                                    <AudioCard CUE={ this.CUE } audioInfoParams={ paramsForAudioInfo } _play={ this._play }/>
                                                </div>
            startingIndex = startingIndex + 1;
        }
    }
    
    componentDidMount()
    {
        this.audioSlot = document.getElementById('sound');
        var elems = document.querySelectorAll('.fixed-action-btn');
        var instances = window.M.FloatingActionButton.init(elems, {
            direction: 'top'
        });
        this.playButtonSymbol = "play_arrow";
    }

    componentDidUpdate()
    {
        console.log("componentDidUpdate() has ran");
        console.log("this.state.isPlaying: " + this.state.isPlaying);
        console.log("nowPlaying: " + this.CUE.CUR);
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
                <div id="nav" className="col s2">
                    <h1>Navbar</h1>
                    <h1>Here</h1>
                    <h1>Navbar</h1>
                    <h1>Here</h1>
                    <h1>Navbar</h1>
                    <h1>Here</h1>
    
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
  
                <div id="now_playing" className="col s10">
                    <a id="play_button" className="btn-floating btn-large waves-effect waves-light red"><i className="large material-icons">{this.playButtonSymbol}</i></a>
                    <div id="now_playing_tag">
                        <p id="album">{this.CUE.CUR === "" ? "- - -" : tagArray[this.CUE.CUR].album}</p>
                        <p id="artist_title">{this.CUE.CUR === "" ? "- - -" : `${tagArray[this.CUE.CUR].artist} - ${tagArray[this.CUE.CUR].title}`}</p>
                    </div>
                </div>
  
                <div id="content" className="col s10">
                    <Router>
                        <Route exact path="/" render={ () => { return (this.audioCards); }}/>
                        <Route exact path="/:audioIndex" component={AudioInfo} />
                    </Router>
                </div>

                <audio id="sound" autoPlay hidden></audio>
                <input type="file" id="new" onChange={ (event) => {this.insertTagInfo(event, true)} } multiple hidden/>
                <input type="file" id="append" onChange={ (event) => {this.insertTagInfo(event, false)} } multiple hidden/>
            </div>
        );
    }
}

export default Main;