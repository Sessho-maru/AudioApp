import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function AudioCard(props)
{
    let _play = (event) => {
        event.preventDefault();
        props.audioSlot.src = URL.createObjectURL(props.audioInfo.file);
        props.changePlayState();
    }

    const { data, type } = props.audioInfo.cover;
    const byteArray = new Uint8Array(data);
    const blob = new Blob([byteArray], { type });
    let albumArtUrl = URL.createObjectURL(blob);

    let audioTag = {
        cover: albumArtUrl,
        album: props.audioInfo.album,
        artist: props.audioInfo.artist,
        title: props.audioInfo.title,
        track: props.audioInfo.track,
        year: props.audioInfo.year,
    };

    props.link.tag = audioTag;

    return (
        <div className="col s2">
            <div className="card hoverable small">
                <Link to={ props.link }>
                    <div className="card-image">
                        <img src={albumArtUrl} />
                    </div>
                    <div className="card-content">
                        <p>{props.audioInfo.title}</p>
                    </div>
                </Link>
                <div className="card-action">
                    <a href="#" onClick={ (event) => { _play(event) } }>Play</a>
                </div>
            </div>
        </div>            
    );
}

export default AudioCard;