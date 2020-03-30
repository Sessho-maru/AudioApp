import React from 'react';

function YTInfo(props)
{
    return (
        <div className="col s12">
            <div className="card-panel grey hoverable lighten-5 z-depth-1">
                <div className="row valign-wrapper">
                    <div className="col s6">
                        <img src={props.thumbnailUrl} className="responsive-img" width="237" height="132"/>
                    </div>
                    <div className="col s6">
                        <h5 onClick={ () => { window.open(`https://www.youtube.com/watch?v=${props.videoId}`,'_blank'); } }>{props.title}</h5>
                        <h6>{`${props.owner} | ${props.length}`}</h6>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YTInfo;