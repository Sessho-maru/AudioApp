import React from 'react';

function TagInfo(props)
{
    return (
        <div id="imgDiv">
            <img id="showImg" src={props.tagInfo.cover} />
            {/* <h1>{props.tagInfo.title}</h1>
            <h1>{props.tagInfo.album}</h1>
            <h1>{props.tagInfo.artist}</h1> */}
        </div>
    );
}

export default TagInfo;