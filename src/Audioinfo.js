import React, { Component } from 'react';
import TagInfo from './TagInfo'
import YTInfo from './YTInfo';

const axios = require('axios');
const cheerio = require('cheerio');
const OFFSET_INDEX_CONTAIN_YTINITIALDATA = 3;

let receivedParam = {};

class AudioInfo extends Component
{
    constructor()
    {
        super();
        this.contentArray = [];
        this.YTInfos = [];
        this.chunk = [];
        this.preloader = "";
        this.numTry = 0;

        this.state = { 
            isntFetchable: false, 
            isLoaded: false 
        };
    }

    getYoutubeData = (url) => {
        // 1. Send axios request to Youtube
        axios.get(url)
            .then( (res) => {
                /* console.log(res.data); */

        // 2. Receive a Raw string data from axios.res object
                let $ = cheerio.load(res.data);

                $('script').each( (i, element) => {
                    this.chunk.push($(element));
                });

                let length = this.chunk.length;
                const rawString = $(this.chunk[length - OFFSET_INDEX_CONTAIN_YTINITIALDATA]).contents()[0].data;
                /* console.log(rawString); */

        // 3. Find the Object that has youtube.videoRenderer Object
                let splited = rawString.split("window[\"ytInitialData\"] = ");
                splited = splited[1].split(";\n");
                /* console.log(splited); */

                let youTubeJson = JSON.parse(splited[0]);
                this.contentArray = youTubeJson['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'];
                /* console.log(contentArray); */

        // 4. Filter the objects doesn't have youtube.videoRenderer Object inside
                this.contentArray = this.contentArray.filter( (each) => each['videoRenderer'] !== undefined );
                /* console.log(this.contentArray); */

        // 5. Convert each youtube.videoRenderer Object into YTInfos Component Array to render
                this.YTInfos = this.contentArray.map( (each, i) => {

                    let youtubeInfo = {
                        videoId: "",
                        thumbnailUrl: "",
                        title: "",
                        owner: "",
                        length: ""
                    };

            // Check Video length, because some video doesn't have length data and it causes an error
                    if (each['videoRenderer']['badges'] !== undefined)
                    {
                        if (each['videoRenderer']['badges'][0]['metadataBadgeRenderer'].label === "LIVE NOW")
                        {
                            youtubeInfo.length = "LIVE NOW";
                        }
                        else
                        {
                            youtubeInfo.length = each['videoRenderer']['lengthText']['simpleText'];
                        }
                    }
                    else
                    {
                        if (each['videoRenderer']['lengthText'] !== undefined)
                        {
                            youtubeInfo.length = each['videoRenderer']['lengthText']['simpleText'];
                        }
                        else
                        {
                            youtubeInfo.length = "LIVE NOW";
                        }
                    }
                    console.log(`${i}, ${youtubeInfo.length}`);

                    youtubeInfo.videoId = each['videoRenderer'].videoId;
                    youtubeInfo.thumbnailUrl = each['videoRenderer']['thumbnail']['thumbnails'][0].url;
                    youtubeInfo.title = each['videoRenderer']['title']['runs'][0].text;
                    youtubeInfo.owner = each['videoRenderer']['longBylineText']['runs'][0].text;
        
                    return (
                        <YTInfo key={i} YTInfoObj={youtubeInfo} />
                    );
                });

                console.log("Packed Component Array", this.YTInfos);
                if (this.numTry > 0) {this.numTry = 0;}
                this.setState({ isLoaded: true });

            })
            .catch( (err) => {
                console.log("something goes wrong");
                this.numTry = this.numTry + 1;
                console.log(this.numTry);
                if (this.numTry < 3) { this.getYoutubeData(url); }
            });
    }

    UNSAFE_componentWillMount()
    {
        if (this.props.location.audioInfo !== undefined)
        {
            receivedParam = this.props.location;
        }
        console.log(receivedParam);
    }

    componentDidMount()
    {
        if (receivedParam.audioInfo.title === 'untitled' || receivedParam.audioInfo.artist === "")
        {
            this.preloader = <div id="preloader">
                                <h2>To fecth Youtube Search page, Title and Artistname is required</h2>
                             </div>
            this.setState({ isntFetchable: true });
            return;
        }

        const corsAnywhere = "https://cors-anywhere.herokuapp.com/";
        console.log(`search term: ${receivedParam.audioInfo.artist} - ${receivedParam.audioInfo.title}`);
        const dist = `https://www.youtube.com/results?search_query=${receivedParam.audioInfo.artist} - ${receivedParam.audioInfo.title}`;

        this.getYoutubeData(corsAnywhere + dist);
    }

    render()
    {
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
                    <div className="col xl7 l5 m3 s1">
                        <TagInfo albumArt={ receivedParam.albumArtUrl }/>
                    </div>
                    <div className="col xl5 l7 m9 s11">
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