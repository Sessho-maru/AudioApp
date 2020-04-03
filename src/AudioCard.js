import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function AudioCard(props)
{
    let _play = (event) => {
        event.preventDefault();
        props.audioSlot.src = URL.createObjectURL(props.audioInfoParams.audioInfo.file);
        props.changePlayState();
    }

    return (
        <div className="col s2">
            <div className="card hoverable small">
                <Link to={ props.audioInfoParams }>
                    <div className="card-image">
                        <img src={props.audioInfoParams.albumArtUrl} />
                    </div>
                    <div className="card-content">
                        <p>{props.audioInfoParams.audioInfo.title}</p>
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