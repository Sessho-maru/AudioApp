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
        this.state = { isLoaded: false };
    }

    arrangeObject = (after, before) => {


        
    }

    componentDidMount()
    {
        console.log(this.props.location);

        const corsAnywhere = "https://cors-anywhere.herokuapp.com/";
        const dist = `https://www.youtube.com/results?search_query=${this.props.location.searchPhrase}`;
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

                    let info = {
                        videoId: "",
                        thumbnailUrl: "",
                        title: "",
                        owner: "",
                        length: ""
                    };

                    console.log(i);
        
                    if (each['videoRenderer']['badges'] != undefined)
                    {
                        if (each['videoRenderer']['badges'][0]['metadataBadgeRenderer'].label == "LIVE NOW")
                        {
                            info.length = "LIVE NOW";
                            console.log(info.length);
                        }
                        else
                        {
                            info.length = each['videoRenderer']['lengthText']['simpleText'];
                            console.log(info.length);
                        }
                    }
                    else
                    {
                        if (each['videoRenderer']['lengthText'] != undefined)
                        {
                            info.length = each['videoRenderer']['lengthText']['simpleText'];
                            console.log(info.length);
                        }
                        else
                        {
                            info.length = "LIVE NOW";
                            console.log(info.length);
                        }
                    }
        
                    info.videoId = each['videoRenderer'].videoId;
                    info.thumbnailUrl = each['videoRenderer']['thumbnail']['thumbnails'][0].url;
                    info.title = each['videoRenderer']['title']['runs'][0].text;
                    info.owner = each['videoRenderer']['longBylineText']['runs'][0].text;
        
                    return (
                        <YTInfo key={i} videoId={info.videoId} thumbnailUrl={info.thumbnailUrl} title={info.title} owner={info.owner} length={info.length}/>
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
        return(
            <div className="row">
                <div className="container">
                    <div className="col s7">
                        <TagInfo tagInfo={ this.props.location.tag }/>
                    </div>
                    <div className="col s5">
                        <div id="YTcontent">
                            {this.YTInfos}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default AudioInfo;