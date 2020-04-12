import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

class AudioCard extends Component
{
    constructor()
    {
        super();

        this.state = {
            isClicked: false
        };
    }

    _play = (event) => {
        event.preventDefault();
        this.props.audioSlot.src = URL.createObjectURL(this.props.audioInfoParams.audioInfo.file);
        this.props.changePlayState(event.target.id);

        console.log("PLAY");
        this.setState( (prevState) => ({
            isClicked: !prevState.isClicked
        }));
    }

    render()
    {
        return (
            <div className="col s2">
                <div className="card hoverable small">
                    <Link to={ this.props.audioInfoParams }>
                        <div className="card-image">
                            <img src={this.props.audioInfoParams.albumArtUrl} />
                        </div>
                        <div className="card-content">
                            <p>{this.props.audioInfoParams.audioInfo.title}</p>
                        </div>
                    </Link>
                    <div className="card-action">
                        <a id={this.props.audioInfoParams.pathname} href="#" onClick={ (event) => { this._play(event) } }>{ this.state.isClicked ? "pause" : "play" }</a>
                    </div>
                </div>
            </div>            
        );
    }
}

export default AudioCard;