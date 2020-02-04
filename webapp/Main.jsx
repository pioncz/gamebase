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
import { LoginModal, RegistrationModal, FullscreenModal, NameModal, } from 'modals/';
import Utils from 'services/utils';
import i18n from 'services/i18n';

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
      nameModalVisible: !window.localStorage.login,
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
    const { setCurrentPlayerDice, setCurrentPlayerLogin, } = this.props;
    this.setState({
      connectorInstance,
    });
    connectorInstance.socket.on('initialData', initialState => {
      const { player, dices, } = initialState;
      this.props.setCurrentPlayer(player);
      this.props.setCurrentDices(dices);

      const diceId = window.localStorage.diceId;
      const login = window.localStorage.login;
      if (diceId) {
        connectorInstance.socket.emit('selectDice', { diceId, });
        setCurrentPlayerDice(diceId);
      }
      if (login) {
        connectorInstance.socket.emit('selectLogin', { login, });
        setCurrentPlayerLogin(login);
      }
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
  selectDice = (diceId) => {
    const { setCurrentPlayerDice, } = this.props;
    const { connectorInstance, } = this.state;
    window.localStorage.diceId=diceId;
    if (connectorInstance) {
      connectorInstance.socket.emit('selectDice', { diceId, });
    }
    setCurrentPlayerDice(diceId);
  }
  sendNameModal = ({login, diceId}) => {
    const { setCurrentPlayerDice, setCurrentPlayerLogin, } = this.props;
    const { connectorInstance, } = this.state;

    window.localStorage.diceId=diceId;
    window.localStorage.login=login;
    if (connectorInstance) {
      connectorInstance.socket.emit('selectDice', { diceId, });
      connectorInstance.socket.emit('selectLogin', { login, });
    }
    setCurrentPlayerDice(diceId);
    setCurrentPlayerLogin(login);
    this.setState({
      nameModalVisible: false,
    });
  }
  render() {
    const { 
      loginModalVisible, 
      registrationModalVisible, 
      fullscreenModalVisible, 
      nameModalVisible, 
    } = this.state,
      { player, dices,} = this.props;
    const isIos = Utils.isIos;

    return (<Router>
      <div className={this.props.inGame?'inGame':''}>
        <Header
          dices={dices}
          player={player}
          selectDice={this.selectDice}
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
        {player && player.login && nameModalVisible &&
          <NameModal
            dices={dices}
            player={player}
            onSubmit={this.sendNameModal}
          />}
        {!isIos && fullscreenModalVisible &&
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
  getCurrentDices,
} = selectors;

const {
  registerPlayer,
  loginPlayer,
  setCurrentPlayer,
  setCurrentDices,
  logout,
  setCurrentPlayerDice,
  setCurrentPlayerLogin,
} = actions;

const mapStateToProps = state => ({
  player: getCurrentPlayer(state),
  inGame: isInGame(state),
  dices: getCurrentDices(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    registerPlayer,
    loginPlayer,
    setCurrentPlayer,
    setCurrentDices,
    logout,
    setCurrentPlayerDice,
    setCurrentPlayerLogin,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Main);