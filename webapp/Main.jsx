import React, { Component } from 'react'
import Pages from "./pages";
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'
import Header from 'components/header/index.jsx'
import Connector from 'components/connector/index.jsx'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { selectors, actions } from 'shared/redux/api'
import { LoginModal, RegistrationModal } from 'modals/';

class Main extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      connectorInstance: null,
      player: null,
      loginModalVisible: true,
      registrationModalVisible: false,
    };
    
    this.setConnector = this.setConnector.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.sendLoginModal = this.sendLoginModal.bind(this);
    this.toggleRegistrationModal = this.toggleRegistrationModal.bind(this);
    this.sendRegistrationModal = this.sendRegistrationModal.bind(this);
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
  toggleLoginModal() {
    this.setState({
      loginModalVisible: !this.state.loginModalVisible,
    });
  }
  toggleRegistrationModal() {
    this.setState({
      registrationModalVisible: !this.state.registrationModalVisible,
    });
  }
  sendRegistrationModal(values) {
    this.props.registerPlayer(values);
  };
  sendLoginModal(values) {
    this.props.loginPlayer(values);
  };
  render() {
    let { player, loginModalVisible, registrationModalVisible } = this.state,
      { profile } = this.props;
    
    return (<Router>
      <div className={this.props.inGame?'inGame':''}>
        <Connector ref={this.setConnector}/>
        <Header 
          player={player} 
          profile={profile}
          toggleLoginModal={this.toggleLoginModal}
          toggleRegistrationModal={this.toggleRegistrationModal}
        />
        <div className="main">
          <Route exact path="/" component={Pages.Home}/>
          <Route path="/ludo" component={Pages.Ludo}/>
          <Route path="/engine" component={Pages.Engine}/>
          <Route path="/admin" component={Pages.Admin}/>
        </div>
        {loginModalVisible && 
          <LoginModal
            onClose={this.toggleLoginModal}
            onSubmit={this.sendLoginModal}
          />}
        {registrationModalVisible && 
          <RegistrationModal
            onClose={this.toggleRegistrationModal}
            onSubmit={this.sendRegistrationModal}
          />}
      </div>
    </Router>);
  }
}

Main.childContextTypes = {
  connectorInstance: PropTypes.object,
};

const {
  getCurrentProfile,
  isInGame,
} = selectors;

const {
  registerPlayer,
  loginPlayer,
} = actions;

const mapStateToProps = state => ({
  profile: getCurrentProfile(state),
  inGame: isInGame(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    registerPlayer,
    loginPlayer,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Main);