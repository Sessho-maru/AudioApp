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
        // this.durations = [];

        this.timer = "";
        this.audioSlot = "";
        this.playSymbol = "drag_handle";

        this.state = {
            isNeedtoReRender: false,
            isPlaying: false,
            nowPlayingIndex: ""
        };
    }

    _pause = () =>{
        console.log("PAUSE");
        this.audioSlot.pause();
    }

    changePlayState = (songIndex) => {
        console.log("State is going to be change");
        console.log(`CUR: ${this.state.nowPlayingIndex}, NEXT: ${songIndex}`);
        
        if (this.state.nowPlayingIndex !== songIndex)
        {
            this.playSymbol = "pause";

            if (this.state.nowPlayingIndex === "")
            {
                this.setState({
                    isPlaying: true,
                    nowPlayingIndex: songIndex
                });
            }

            this.setState({
                nowPlayingIndex: songIndex
            });
        }
        else
        {
            this.playSymbol = "play_arrow";
            this._pause();

            this.setState({
                isPlaying: false,
                nowPlayingIndex: ""
            });
        }
    }

    openFileDialog = (mode) => {
        if (mode === true)
        {
            let newFileDialog = document.getElementById('new');
            newFileDialog.click();
        }

        if(mode === false)
        {
            let appendFileDialog = document.getElementById('append');
            appendFileDialog.click();
        }
    }
    
    insertTagInfo = (event, mode) => {
        if (mode === true)
        {
            tagArray = [];
        }

        let checker = (tag, fileName) => {
            if (typeof(tag) === "undefined") { alert(`No any given Tag data!\n:${fileName}`); return; }
            if (tag.tags.title === undefined) { alert(`No given {Title}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artist} is required`); tag.tags.title = "untitled"; }
            if (tag.tags.artist === undefined) { alert(`No given {Artistname}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artistname} is required`); tag.tags.artist = ""; }
            if (tag.tags.picture === undefined) { alert(`No given Album Cover data!\n:${fileName}`); }
        }

        let fileList = event.target.files;
        tagArray.length = processedItemNum + fileList.length;

        Array.from(fileList).map( (each) => {
            console.log("insertTagInfo->map() has ran");

            this.jsmediatags.read(each, {
                onSuccess: function(tag) {
                    checker(tag, each.name);
                    tag.tags.file = each;
                    tagArray[processedItemNum] = tag.tags;
                    processedItemNum = processedItemNum + 1;
                },
                onError: function(error) {
                    checker(undefined, each.name);
                    processedItemNum = processedItemNum + 1;
                }
            });

        });

        this.setState({
            isNeedtoReRender: true
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
                albumArtUrl: ""
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

        this.setState({
            isNeedtoReRender: false
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
        clearInterval(this.timer);
        this.timer = setInterval( () =>{
            if (processedItemNum === tagArray.length && this.state.isNeedtoReRender === true)
            {
                this.reRenderPage();
            }
        }, 500);

        console.log("componentDidUpdate() has ran");
        console.log("this.state.isNeedtoReRender: " + this.state.isNeedtoReRender);
        console.log("this.state.isPlaying: " + this.state.isPlaying);
        console.log("this.state.nowPlayingIndex: " + this.state.nowPlayingIndex);
        console.log("this.tagArray: ", tagArray);
        console.log(`processedItemNum: ${processedItemNum}, tagArray.length: ${tagArray.length}`);
        console.log("============================");

        // let reader = new FileReader();
        // tagArray.map( (each) => {
        //     reader.readAsArrayBuffer(each.file);
        //     reader.onload = (readEvent) => {
        //         var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        //         audioContext.decodeAudioData(readEvent.target.result, function(buffer) {
        //             console.log(buffer.duration);
        //         });
        //     }
        // });
    }

    componentWillUnmount()
    {
        clearInterval(this.timer);
    }

    render()
    {
        console.log("render() has ran");
        
        return (
            <div className="row">
                <div className="col s2">
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
                    <a id="play_button" className="btn-floating btn-large waves-effect waves-light red"><i className="large material-icons">{this.playSymbol}</i></a>
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