import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Ludo from './containers/index.jsx'
import { selectors as ludoSelectors, actions as ludoActions } from 'shared/redux/ludo'

const {
} = ludoActions;

const {
  getPawns
} = ludoSelectors;

const mapStateToProps = state => ({
  pawns: getPawns(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
//    fetchPresentation,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Ludo);