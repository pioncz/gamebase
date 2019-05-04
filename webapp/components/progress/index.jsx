import React, { Component } from 'react';
import './index.sass';

class Progress extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { value, rotated } = this.props;
    
    return (
      <div className={`progress ${rotated?'progress--rotated':''}`} style={{width: `${value * 100}%`}}></div>
    );
  }
}

export default Progress;