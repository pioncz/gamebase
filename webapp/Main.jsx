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
      loginModalVisible: false,
      registrationModalVisible: false,
    };
    
    this.setConnector = this.setConnector.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.sendLoginModal = this.sendLoginModal.bind(this);
    this.toggleRegistrationModal = this.toggleRegistrationModal.bind(this);
    this.sendRegistrationModal = this.sendRegistrationModal.bind(this);
    this.logout = this.logout.bind(this);
  }
  componentWillMount() {
    this.props.fetchCurrentPlayer();
  }
  componentWillReceiveProps(nextProps) {
    const { player } = this.props;
    
    if (nextProps.player.state === 'loggedIn' && player.state !== 'loggedIn') {
      this.setState({
        loginModalVisible: false,
        registrationModalVisible: false,
      });
    }
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
  }
  sendLoginModal(values) {
    this.props.loginPlayer(values);
  }
  logout() {
    this.props.logout();
  }
  render() {
    let { loginModalVisible, registrationModalVisible } = this.state,
      { player } = this.props;

    return (<Router>
      <div className={this.props.inGame?'inGame':''}>
        <Connector ref={this.setConnector}/>
        <Header 
          player={player}
          toggleLoginModal={this.toggleLoginModal}
          toggleRegistrationModal={this.toggleRegistrationModal}
          logout={this.logout}
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
  getCurrentPlayer,
  isInGame,
} = selectors;

const {
  registerPlayer,
  loginPlayer,
  fetchCurrentPlayer,
  logout,
} = actions;

const mapStateToProps = state => ({
  player: getCurrentPlayer(state),
  inGame: isInGame(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    registerPlayer,
    loginPlayer,
    fetchCurrentPlayer,
    logout,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Main);