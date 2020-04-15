import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import AudioCard from './AudioCard';
import AudioInfo from './Audioinfo';

var tagArray = [];
var processedItemNum = 0;

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
        this.CUE_CUR = "";

        this.state = {
            isNeedToReRender: false,
            isPlaying: false,
        };
    }

    _pause = () =>{
        console.log("PAUSE");
        this.audioSlot.pause();
    }

    changePlayState = (CUE_NEXT) => {
        console.log("State is going to be change");
        console.log(`CUE_CUR: ${this.CUE_CUR}, CUE_NEXT: ${CUE_NEXT}`);
        
        if (this.CUE_CUR !== CUE_NEXT)
        {
            this.playButtonSymbol = "pause";

            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout( () => {
                let after = document.getElementById(`${parseInt(CUE_NEXT) + 1}`);
                if (after !== null) { after.click(); }
            }, (tagArray[CUE_NEXT].duration) * 1000);

            if (this.CUE_CUR === "")
            {
                document.getElementById(`${CUE_NEXT}`).innerHTML = "stop";
                document.getElementById(`${CUE_NEXT}_selected`).classList.add("indigo");
                this.CUE_CUR = CUE_NEXT;
                this.setState({
                    isPlaying: true,
                    isNeedToReRender: true
                });
                return;
            }

            document.getElementById(`${this.CUE_CUR}`).innerHTML = "play";
            document.getElementById(`${this.CUE_CUR}_selected`).classList.remove("indigo");

            document.getElementById(`${CUE_NEXT}`).innerHTML = "stop";
            document.getElementById(`${CUE_NEXT}_selected`).classList.add("indigo");

            this.CUE_CUR = CUE_NEXT;
            this.setState({
                isNeedToReRender: true
            });
        }
        else
        {
            this.playButtonSymbol = "play_arrow";
            clearTimeout(this.timeoutId);
            this._pause();

            document.getElementById(`${this.CUE_CUR}`).innerHTML = "play";
            document.getElementById(`${this.CUE_CUR}_selected`).classList.remove("indigo");
            this.CUE_CUR = "";
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

        if(clearTagArray === false)
        {
            let appendFileDialog = document.getElementById('append');
            appendFileDialog.click();
        }
    }
    
    insertTagInfo = (event, initializing) => {
        if (initializing === true)
        {
            if (this.CUE_CUR !== "")
            {
                document.getElementById(`${this.CUE_CUR}`).innerHTML = "play";
                document.getElementById(`${this.CUE_CUR}_selected`).classList.remove("indigo");

                tagArray = [];
                processedItemNum = 0;
                this.CUE_CUR = "";
            }
        }

        let checker = (tag, fileName) => {
            if (typeof(tag) === "undefined") { alert(`No any given Tag data!\n:${fileName}`); return; }
            if (tag.tags.title === undefined) { alert(`No given {Title}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artist} is required`); tag.tags.title = "untitled"; }
            if (tag.tags.artist === undefined) { alert(`No given {Artistname}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artistname} is required`); tag.tags.artist = ""; }
            if (tag.tags.picture === undefined) { alert(`No given Album Cover data!\n:${fileName}`); }
        }

        let getDuration = (file, index) => {
            let fr = new FileReader();
            fr.readAsArrayBuffer(file);
            fr.onload = (readEvent) => {
                var audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContext.decodeAudioData(readEvent.target.result, (buffer) => {
                    tagArray[index].duration = buffer.duration;
                    console.log(`duration: ${buffer.duration} of ${index} is inserted`);
                    
                });
            };
        }

        let triggerRerender = () => {
            this.reRenderPage();
            this.setState({
                isNeedtoReRender: true
            });
        }

        let fileList = event.target.files;
        tagArray.length = processedItemNum + fileList.length;

        Array.from(fileList).map( (each) => {
            console.log("insertTagInfo->map() has ran");

            this.jsmediatags.read(each, {
                onSuccess: function(tag) {
                    console.log("jsmediaTags.read() has been run");
                    
                    checker(tag, each.name);
                    tag.tags.file = each;
                    tagArray[processedItemNum] = tag.tags;
                    getDuration(each, processedItemNum);

                    processedItemNum = processedItemNum + 1;
                    if (processedItemNum === tagArray.length) { triggerRerender(); }
                },
                onError: function(error) {
                    console.log("jsmediaTags.read() has been run, but failed");
                    checker(undefined, each.name);
                    processedItemNum = processedItemNum + 1;
                }
            });

        });
    }

    reRenderPage = () => {
        console.log("reRenderPage() is going to run!!");

        this.audioCards = tagArray.map( (each, i) => {

            let paramsForAudioInfo = {
                pathname: `/${i}`,
                audioInfo: {
                    title: each.title,
                    artist: each.artist,
                    album: each.album,
                    year: each.year,
                    track: each.track,
                    coverData: each.picture,
                    file: each.file
                },
                isHaveArt: true,
                albumArtUrl: "",
                index: i
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

            return (
                <div key={i} className="container">
                    <AudioCard audioInfoParams={ paramsForAudioInfo } audioSlot={ this.audioSlot } changePlayState={ this.changePlayState } />
                </div>
            );

        });
    }
    
    componentDidMount()
    {
        this.audioSlot = document.getElementById('sound');

        var elems = document.querySelectorAll('.fixed-action-btn');
        var instances = window.M.FloatingActionButton.init(elems, {
            direction: 'top'
        });
    }

    componentDidUpdate()
    {
        console.log("componentDidUpdate() has ran");
        console.log("this.state.isPlaying: " + this.state.isPlaying);
        console.log("this.CUE_CUR: " + this.CUE_CUR);
        console.log(`processedItemNum: ${processedItemNum}, tagArray.length: ${tagArray.length}`);
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
                        <p id="album">{this.CUE_CUR === "" ? "- - -" : tagArray[this.CUE_CUR].album}</p>
                        <p id="artist_title">{this.CUE_CUR === "" ? "- - -" : `${tagArray[this.CUE_CUR].artist} - ${tagArray[this.CUE_CUR].title}`}</p>
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