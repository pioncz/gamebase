import React, { Component, } from 'react'
import Pages from "./pages";
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import Header from 'components/header/index.jsx'
import Connector from 'components/connector/index.jsx'
import PropTypes from 'prop-types'
import { bindActionCreators, } from 'redux'
import { connect, } from 'react-redux'
import { selectors, actions, } from 'shared/redux/api'
import { LoginModal, RegistrationModal, FullscreenModal, } from 'modals/';

class Main extends Component {
  constructor(props) {
    super(props);

    let fullscreenmModalCounter = parseInt(localStorage.getItem('fullscreenModalCounter'), 10);

    if( isNaN(fullscreenmModalCounter) ){
      fullscreenmModalCounter = 0;
    }

    let fullscreenModalVisible = true;
    if ( fullscreenmModalCounter >= 2 ) {
      fullscreenModalVisible = false;
    } else {
      fullscreenmModalCounter++;
      localStorage.setItem('fullscreenModalCounter', fullscreenmModalCounter);
    }

    this.state = {
      connectorInstance: null,
      loginModalVisible: false,
      registrationModalVisible: false,
      fullscreenModalVisible,
    };

    this.setConnector = this.setConnector.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.sendLoginModal = this.sendLoginModal.bind(this);
    this.toggleRegistrationModal = this.toggleRegistrationModal.bind(this);
    this.sendRegistrationModal = this.sendRegistrationModal.bind(this);
    this.logout = this.logout.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { player, } = this.props;

    if (nextProps.player.state === 'loggedIn' && player.state !== 'loggedIn') {
      this.setState({
        loginModalVisible: false,
        registrationModalVisible: false,
      });
    }
  }
  getChildContext() {
    return {connectorInstance: this.state.connectorInstance,};
  }
  setConnector(connectorInstance) {
    this.setState({
      connectorInstance,
    });
    connectorInstance.socket.on('playerUpdate', (player) => {
      console.log('playerUpdate', player);
      this.props.setCurrentPlayer(player);
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
  toggleFullscreenModal = () => {
    this.setState({
      fullscreenModalVisible: !this.state.fullscreenModalVisible,
    });
  };
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
    let { loginModalVisible, registrationModalVisible, fullscreenModalVisible,} = this.state,
      { player, } = this.props;

    return (<Router>
      <div className={this.props.inGame?'inGame':''}>
        <Header
          player={player}
          toggleLoginModal={this.toggleLoginModal}
          toggleRegistrationModal={this.toggleRegistrationModal}
          logout={this.logout}
        />
        <div className="main">
          <Switch>
            <Route exact path="/" component={Pages.Home}/>
            <Route path="/room/:roomId" component={Pages.Room}/>
            <Route path="/engine" component={Pages.Engine}/>
            <Route path="/admin" component={Pages.Admin}/>
            <Route path="/" component={Pages.Home}/>
          </Switch>
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

        {fullscreenModalVisible &&
         <FullscreenModal
           onToggle={ this.toggleFullscreenModal}
           onClose={this.toggleFullscreenModal}
         />}

        <Connector ref={this.setConnector}/>
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
  setCurrentPlayer,
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
    setCurrentPlayer,
    logout,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Main);