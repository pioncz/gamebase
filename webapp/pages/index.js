import Ludo from './ludo/index.jsx';
import Home from './home/home.jsx';
import withConnector from 'components/withConnector/index.jsx'

export default {
  Home,
  Ludo: withConnector(Ludo),
}