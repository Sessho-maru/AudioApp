import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function AudioCard(props)
{
    let loaded = <a id={ props.audioInfoParams.index } href="#" onClick={ (event) => { props.CUE.NEXT = event.target.id; props._play(); } }>{parseInt(props.CUE.CUR) === props.audioInfoParams.index ? 'stop' : 'play'}</a>;
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
                    <div id={ `${props.audioInfoParams.index}_selected` } className={"card-action " + (parseInt(props.CUE.CUR) === props.audioInfoParams.index ? 'indigo' : '')}>
                        { props.isDone === true ? loaded : preloader }
                    </div>
            </div>
        </div>
    );
}

export default AudioCard;