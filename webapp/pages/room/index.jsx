import { bindActionCreators, } from 'redux'
import { connect, } from 'react-redux'
import Room from './containers/index.jsx'
import { selectors, actions, } from 'shared/redux/api'

const {
  setInGame,
  unsetInGame,
} = actions;

const {
  getCurrentPlayer,
} = selectors;

const mapStateToProps = state => ({
  player: getCurrentPlayer(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    //    fetchPresentation,
    setInGame,
    unsetInGame,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Room);