import Ludo from './ludo/index.jsx';
import Home from './home/home.jsx';
import Engine from './engine/';
import Admin from './admin/';
import withConnector from 'components/withConnector/index.jsx'

export default {
  Home,
  Admin,
  Ludo: withConnector(Ludo),
  Engine: withConnector(Engine),
}