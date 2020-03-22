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

        const corsAnywhere = "https://cors-anywhere.herokuapp.com/";
        const dist = "https://www.youtube.com/results?search_query=Never+Really+Get+There+%28Mixed%29"

        let chunk = [];

        axios.get(corsAnywhere + dist)
            .then((response) => {

                let $ = cheerio.load(response.data);

                $('script').each( (i, element) => {
                    chunk.push($(element));
                    console.log(i);
                });

                let length = chunk.length;
                const chunkWithVideoId = $(chunk[length - 2]).contents()[0].data;
                // console.log(chunkWithVideoId);

                const regexForVideoId = /{"videoId":"([^"&?\/\s]{11})"}/g;
                const matches = [...chunkWithVideoId.matchAll(regexForVideoId)];
                console.log(matches);
                
            })
            .catch( (error) => {
                console.log(error);
            });
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
                {this.audioCards}
                {/* <p>New</p> */}
                <p>
                    <input type="file" onChange={(element) => {this.insertTagInfo(element, true)}} multiple/>
                </p>

                {/* <p>Add</p> */}
                <p>
                    <input type="file" onChange={(element) => {this.insertTagInfo(element, false)}} multiple/>
                </p>
                {/* <button onClick={ this.load }>refresh</button> */}
            </div>
        );  
    }
}

export default Main;