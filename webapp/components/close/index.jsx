import React from 'react';
import './index.sass';

const Close = (props) => {
  return (<div className={"close"} onClick={props.onClick}></div>);
};

export default Close; 