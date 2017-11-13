import React, { Component } from 'react';
import './index.sass';
import Engine from 'engine.js'

export default class Game extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.engine = new Engine({container: this.rendererContainer, pawns: this.props.pawns});
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