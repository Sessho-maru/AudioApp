import React from 'react';
import crawler from './crawler';

function AudioCard(props)
{
    console.log(props.audioInfo);

    let blob = {};
    let albumArtUrl = "";

    {
        const { data, type } = props.audioInfo.cover;
        const byteArray = new Uint8Array(data);
        blob = new Blob([byteArray], { type });
    }

    albumArtUrl = URL.createObjectURL(blob);

    function _play(event) 
    {
        event.preventDefault();
        var sound = document.getElementById('sound');
        sound.src = URL.createObjectURL(props.audioInfo.file);
        sound.onend = function(e) {
            URL.revokeObjectURL(this.src);
        }
    }

    return (
        <div className="container">
            <div className="col s2">
                <div className="card hoverable small">
                    <div className="card-image">
                        <img src={albumArtUrl} />
                    </div>
                    <div className="card-content">
                        <p>{props.audioInfo.title}</p>
                    </div>
                    <div className="card-action">
                        <a href="#" onClick={ _play }>Play</a>
                    </div>
                </div>

                <audio id="sound" autoPlay hidden></audio>
            </div>
        </div>
    );
}

export default AudioCard;