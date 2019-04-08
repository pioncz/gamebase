import Room from './room/index.jsx';
import Home from './home/home.jsx';
import Engine from './engine/';
import Admin from './admin/';
import withConnector from 'components/withConnector/index.jsx'

export default {
  Home: withConnector(Home),
  Admin: withConnector(Admin),
  Room: withConnector(Room),
  Engine: withConnector(Engine),
}