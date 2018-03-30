import React, { Component } from 'react'
import Pages from "./pages";
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'
import Header from 'components/header/index.jsx'
import Connector from 'components/connector/index.jsx'
import PropTypes from 'prop-types'
import Greeter from 'test'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { selectors, actions } from 'shared/redux/api'
import Ludo from "./pages/ludo/containers";

class Main extends Component {
  constructor(props) {
    super(props);
    
    let greeter = new Greeter('test');
    console.log(greeter.greet());
  
    this.state = {
      connectorInstance: null,
      player: null,
    };
    
    this.setConnector = this.setConnector.bind(this);
  }
  getChildContext() {
    return {connectorInstance: this.state.connectorInstance};
  }
  setConnector(connectorInstance) {
    this.setState({
      connectorInstance: connectorInstance,
    });
    connectorInstance.socket.on('player', player => {
      this.setState({
        player: player,
      })
    });
  }
  render() {
    let { player } = this.state;
    
    return (<Router>
      <div>
        <Header user={player}/>
        <div className="main">
          <Route exact path="/" component={Pages.Home}/>
          <Route path="/ludo" component={Pages.Ludo}/>
        </div>
        <Connector ref={this.setConnector}/>
      </div>
    </Router>);
  }
}

Main.childContextTypes = {
  connectorInstance: PropTypes.object,
};

const {
  getCurrentUser,
} = selectors;

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state),
});

export default connect(
  mapStateToProps,
  null,
)(Main);