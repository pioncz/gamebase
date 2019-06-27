import React, { Component, } from 'react'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'

export default class FullscreenButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullscreen: false,
    };

    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keypress', this.onKeyUp);
  }
  componentWillUnmount() {
    document.removeEventListener('keypress', this.onKeyUp);
  }
  onKeyUp(e) {
    if (e.key && e.key.toUpperCase() === 'F') {
      this.toggleFullscreen();
    }
  }
  toggleFullscreen() {
    const { fullscreen, } = this.state;
    const { onToggle, } = this.props;

    if (fullscreen) {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if(document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if(document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if(document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if(document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }

    this.setState({
      fullscreen: !fullscreen,
    });

    if(onToggle){
      onToggle();
    }
  }
  render() {
    const { fullscreen, } = this.state;

    return <div className="nav-icon nav-icon--fullscreen" onClick={this.toggleFullscreen}>
      {fullscreen && <FullscreenExitIcon/>}
      {!fullscreen && <FullscreenIcon />}
    </div>

  }
}