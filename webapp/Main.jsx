import React, { Component } from 'react'
import Pages from "./pages";
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Header from 'components/header/index.jsx'
import Connector from 'components/connector/index.jsx'
import PropTypes from 'prop-types'
import Greeter from 'test'

class Main extends Component {
  constructor(props) {
    super(props);
    
    let greeter = new Greeter('test');
    console.log(greeter.greet());
  
    this.state = {
      connectorInstance: null,
    };
    
    this.setConnector = this.setConnector.bind(this);
  }
  getChildContext() {
    return {connectorInstance: this.state.connectorInstance};
  }
  setConnector(element) {
    this.setState({
      connectorInstance: element,
    })
  }
  render() {
    return (<Router>
      <div>
        <Header/>
        <div className="main">
          <Route exact path="/" component={Pages.Ludo}/>
          <Route path="/ludo" component={Pages.Ludo}/>
        </div>
        <Connector ref={this.setConnector}/>
      </div>
    </Router>);
  }
}

Main.childContextTypes = {
  connectorInstance: PropTypes.object
};

export default Main;