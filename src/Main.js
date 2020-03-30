import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import AudioCard from './AudioCard';
import AudioInfo from './Audioinfo';

var tagArray = [];

class Main extends Component
{
    constructor()
    {
        super();

        this.jsmediatags = require('jsmediatags');
        this.audioCards = [];

        this.timer = "";
        this.audioSlot = "";
        this.state = {
            isNeedtoReRender: false,
            isPlaying: false
        };
    }

    changePlayState = () => {
        console.log("State has been changed");
        this.setState({
            isPlaying: true
        });
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

        let fileList = event.target.files;    
        Array.from(fileList).map( (each) => {
            console.log("insertTagInfo->map() has ran");

            this.jsmediatags.read(each, {
                onSuccess: function(tag) {
                    tag.tags.file = each;
                    tagArray.push(tag.tags);
                },
                onError: function(error) {
                    console.log(':(', error.type, error.info);
                }
            });

        });

        this.setState({
            isNeedtoReRender: true
        });
    }

    reRenderPage = () => {
        if (this.state.isNeedtoReRender === false)
        {
            console.log("Not Yet!!");
            return;
        }
        console.log("====reRenderPage() is going to run!!====");

        this.audioCards = tagArray.map( (each, i) => {

            console.log(each);

            let audioInfo = {
                title: each.title,
                artist: each.artist,
                album: each.album,
                year: each.year,
                track: each.track,
                cover: each.picture,
                file: each.file
            };

            let passParams = {
                pathname: `/${i}`,
                searchPhrase: audioInfo.artist + " - " + audioInfo.title
            };

            return (
                <div className="container">
                    <AudioCard key={i} audioInfo={ audioInfo } audioSlot={ this.audioSlot } changePlayState={ this.changePlayState } link={ passParams }/>
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
            this.reRenderPage();
        }, 500);

        console.log("componentDidUpdate() has ran");
        console.log("this.state.isNeedtoReRender: " + this.state.isNeedtoReRender);
        console.log("this.state.isPlaying: " + this.state.isPlaying);
        console.log("this.tagArray: ", tagArray);
    }

    componentWillUnmount()
    {
        clearInterval(this.timer);
    }

    render()
    {
        console.log("render() has ran");
        let playIcon = this.state.isPlaying === true ? "pause" : "drag_handle";
        
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
                    <a id="play_button" className="btn-floating btn-large waves-effect waves-light red"><i className="large material-icons">{playIcon}</i></a>
                    <audio id="sound" autoPlay hidden></audio>
                </div>
  
                <div id="content" className="col s10">
                    <Router>
                        <Route exact path="/" render={ () => { return (this.audioCards); }}/>
                        <Route exact path="/:audioIndex" component={AudioInfo} />
                    </Router>
                </div>

                <input type="file" id="new" onChange={ (event) => {this.insertTagInfo(event, true)} } multiple hidden/>
                <input type="file" id="append" onChange={ (event) => {this.insertTagInfo(event, false)} } multiple hidden/>
            </div>
        );  
    }
}

export default Main;