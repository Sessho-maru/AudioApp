import React from 'react';

function TagInfo(props)
{
    return (
        <div>
            <img src={props.tagInfo.cover} width="800" height="800" />
            {/* <h1>{props.tagInfo.title}</h1>
            <h1>{props.tagInfo.album}</h1>
            <h1>{props.tagInfo.artist}</h1> */}
        </div>
    );
}

export default TagInfo;