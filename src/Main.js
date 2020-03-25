import React, { Component } from 'react';
import AudioCard from './AudioCard';

const axios = require('axios');
const cheerio = require('cheerio');

var tagArray = [];

class Main extends Component
{
    constructor()
    {
        super();

        this.jsmediatags = require('jsmediatags');
        this.audioCards = [];

        this.timer = "";
        this.state = {
            isNeedtoReRender: false
        };
    }

    openFileDialog(mode)
    {
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
    
    insertTagInfo = (element, mode) => {
        if (mode === true)
        {
            tagArray = [];
        }

        let fileList = element.target.files;
        Array.from(fileList).map( (each) => {

            this.jsmediatags.read(each, {
                onSuccess: function(tag) {
                    tag.tags.file = each;
                    tagArray.push(Object.values(tag.tags));
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
        console.log("Not Yet!!");

        if (this.state.isNeedtoReRender === false)
        {
            return;
        }

        console.log("====Now!!====");

        this.audioCards = tagArray.map( (each, i) => {

            let audioInfo = {
                title: each[0],
                artist: each[1],
                album: each[2],
                year: each[3],
                track: each[4],
                cover: each[5],
                file: each[15]
            };

            return (
                <AudioCard key={ i } audioInfo={ audioInfo }/>
            );

        });

        this.setState({
            isNeedtoReRender: false
        });
    }
    
    componentDidMount()
    {
        this.timer = setInterval( () =>{
            this.reRenderPage();
        }, 500);

        var elems = document.querySelectorAll('.fixed-action-btn');
        var instances = window.M.FloatingActionButton.init(elems, {
            direction: 'top'
        });

        // Youtube crawler
        {
            /*
            const corsAnywhere = "https://cors-anywhere.herokuapp.com/";
            const dist = "https://www.youtube.com/results?search_query=Way+Out+West+-+Lullaby+Horizon";

            let chunk = [];

            axios.get(corsAnywhere + dist)
                .then( (res) => {

                    let $ = cheerio.load(res.data);
                    $('script').each( (i, element) => {
                        chunk.push($(element));
                    });

                    let length = chunk.length;
                    const rawString = $(chunk[length - 2]).contents()[0].data;

                    // console.log(rawString);
                    
                    let splited = rawString.split("window[\"ytInitialData\"] = ");
                    splited = splited[1].split(";\n");

                    // console.log(splited);
                    
                    let youTubeJson = JSON.parse(splited[0]);

                    let contentArray = youTubeJson['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'];
                    console.log(contentArray);

                })
                .catch( (err) => {
                    
                });
            */
        }
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
                        <a className="btn-floating btn-small grey lighten-1">
                            <i className="large material-icons">add</i>
                        </a>
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
                    <a id="play_button" className="btn-floating btn-large waves-effect waves-light red"><i className="large material-icons">play_arrow</i></a>
                </div>
  
                <div id="content" className="col s10">
                    {this.audioCards}
                </div>

                <input type="file" id="new" onChange={(element) => {this.insertTagInfo(element, true)}} multiple hidden/>
                <input type="file" id="append" onChange={(element) => {this.insertTagInfo(element, false)}} multiple hidden/>~``
            </div>
        );  
    }
}

export default Main;