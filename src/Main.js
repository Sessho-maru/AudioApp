import React, { Component } from 'react';
import AudioCard from './AudioCard';

var jsmediatags = require("jsmediatags");
var tagArray = [];
var audios = [];

class Main extends Component
{
    constructor()
    {
        super();
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

            jsmediatags.read(each, {
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

        audios = tagArray.map( (each, i) => {

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
        }, 500)
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
                {audios}
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