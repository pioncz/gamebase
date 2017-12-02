import React, { Component } from 'react';
import './index.sass';
import Game from 'game.js'

export default class GameComponent extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.engine = new Game({container: this.rendererContainer, pawns: this.props.pawns});
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
    }
    render() {
        return <div className="game">
            <div ref={(renderer) => { this.rendererContainer = renderer; }} className="renderer"></div>
        </div>;
    }
}