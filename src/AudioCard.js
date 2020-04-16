import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

let nowPlaying = "";

function AudioCard(props)
{ 
    console.log(props);
    let _play = (event) => {
        event.preventDefault();
        props.audioSlot.src = URL.createObjectURL(props.audioInfoParams.audioInfo.file);
        props.changePlayState(event.target.id);
        nowPlaying = parseInt(event.target.id);
    }

    let loaded = <a id={ props.audioInfoParams.index } href="#" onClick={ (event) => { _play(event) } }>{nowPlaying === props.audioInfoParams.index ? 'stop' : 'play'}</a>;
    let preloader = <div className="progress"><div className="indeterminate"></div></div>;

    return (
        <div className="col s2">
            <div className="card hoverable small">
                <Link to={ props.audioInfoParams }>
                    <div className="card-image">
                        <img src={ props.audioInfoParams.albumArtUrl } />
                    </div>
                    <div className="card-content">
                        <p>{ props.audioInfoParams.audioInfo.title }</p>
                    </div>
                </Link>
                    <div id={ `${props.audioInfoParams.index}_selected` } className={"card-action " + (nowPlaying === props.audioInfoParams.index ? 'indigo' : '')}>
                        { props.isDone === true ? loaded : preloader }
                    </div>
            </div>
        </div>
    );
}

export default AudioCard;