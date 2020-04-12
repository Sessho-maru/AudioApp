import React from 'react';

function TagInfo(props)
{
    return (
        <div id="imgDiv">
            <img id="showImg" src={props.albumArt} />
        </div>
    );
}

export default TagInfo;