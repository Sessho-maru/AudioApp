import React, { Component } from 'react';
import TagInfo from './TagInfo'
import YTInfo from './YTInfo';

const axios = require('axios');
const cheerio = require('cheerio');

class AudioInfo extends Component
{
    constructor()
    {
        super();
        this.contentArray = [];
        this.YTInfos = [];
        this.preloader = "";
        this.state = { 
            isntFetchable: false, 
            isLoaded: false 
        };
    }

    componentDidMount()
    {
        if (this.props.location.audioInfo.title === 'untitled' || this.props.location.audioInfo.artist === "")
        {
            this.preloader = <div id="preloader">
                                <h2>To fecth Youtube Search page, Title and Artistname is required</h2>
                             </div>
            this.setState({ isntFetchable: true });
            return;
        }

        const corsAnywhere = "https://cors-anywhere.herokuapp.com/";
        const dist = `https://www.youtube.com/results?search_query=${this.props.location.audioInfo.artist} - ${this.props.location.audioInfo.title}`;
        let chunk = [];

        axios.get(corsAnywhere + dist)
            .then( (res) => {

                // need to be seperated as a function
                let $ = cheerio.load(res.data);
                $('script').each( (i, element) => {
                    chunk.push($(element));
                });

                let length = chunk.length;
                const rawString = $(chunk[length - 2]).contents()[0].data;

                let splited = rawString.split("window[\"ytInitialData\"] = ");
                splited = splited[1].split(";\n");

                let youTubeJson = JSON.parse(splited[0]);
                this.contentArray = youTubeJson['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'];

                this.contentArray = this.contentArray.filter( (each) => each['videoRenderer'] != undefined );
                console.log(this.contentArray);
                //

                // need to be seperated as a function
                this.YTInfos = this.contentArray.map( (each, i) => {

                    let youtubeInfo = {
                        videoId: "",
                        thumbnailUrl: "",
                        title: "",
                        owner: "",
                        length: ""
                    };

                    console.log(i);
        
                    // need to be seperated as a function
                    if (each['videoRenderer']['badges'] != undefined)
                    {
                        if (each['videoRenderer']['badges'][0]['metadataBadgeRenderer'].label == "LIVE NOW")
                        {
                            youtubeInfo.length = "LIVE NOW";
                            console.log(youtubeInfo.length);
                        }
                        else
                        {
                            youtubeInfo.length = each['videoRenderer']['lengthText']['simpleText'];
                            console.log(youtubeInfo.length);
                        }
                    }
                    else
                    {
                        if (each['videoRenderer']['lengthText'] != undefined)
                        {
                            youtubeInfo.length = each['videoRenderer']['lengthText']['simpleText'];
                            console.log(youtubeInfo.length);
                        }
                        else
                        {
                            youtubeInfo.length = "LIVE NOW";
                            console.log(youtubeInfo.length);
                        }
                    }
                    //
        
                    youtubeInfo.videoId = each['videoRenderer'].videoId;
                    youtubeInfo.thumbnailUrl = each['videoRenderer']['thumbnail']['thumbnails'][0].url;
                    youtubeInfo.title = each['videoRenderer']['title']['runs'][0].text;
                    youtubeInfo.owner = each['videoRenderer']['longBylineText']['runs'][0].text;
        
                    return (
                        <YTInfo key={i} YTInfoObj={youtubeInfo} />
                    );
                //

                });

                console.log("Packed Component into Array", this.YTInfos);
                this.setState({ isLoaded: true });

            })
            .catch( (err) => {
                console.log("something goes wrong");
            });

    }

    render()
    {
        console.log(this.props.location);
        if (this.state.isntFetchable === false)
        {
            this.preloader = <div id="preloader">
                            <div className="preloader-wrapper big active">
                                <div className="spinner-layer spinner-red-only">
                                    <div className="circle-clipper left">
                                        <div className="circle"></div>
                                    </div>
                                    <div className="gap-patch">
                                        <div className="circle"></div>
                                    </div>
                                    <div className="circle-clipper right">
                                        <div className="circle"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
        }
        

        return (
            <div className="row">
                <div className="container">
                    <div className="col s7">
                        <TagInfo tagInfo={ this.props.location.audioInfo }/>
                    </div>
                    <div className="col s5">
                        <div id="YTcontent">
                            { this.state.isLoaded === false ? this.preloader : this.YTInfos }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default AudioInfo;