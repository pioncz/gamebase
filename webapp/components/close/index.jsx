import React from 'react';
import './index.sass';

const Close = (props) => {
  return (<button className={"close"} onClick={props.onClick} />);
};

export default Close;