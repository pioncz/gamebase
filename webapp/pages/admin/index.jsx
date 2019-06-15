import React, { Component, } from 'react'
import ReactJson from 'react-json-view'
import './index.sass'
import PropTypes from 'prop-types';
import { withStyles, } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3, }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class Admin  extends Component {
  state = {
    activeTab: 0,
    serverStats: {},
  };
  handleChange = (event, activeTab) => {
    this.setState({ activeTab, });
  };

  constructor(props) {
    super(props);

    this.getStatsInterval = null;
    this.connectorInstance = this.props.connectorInstance;
    this.getStats = this.getStats.bind(this);
    this.handleGetStats = this.handleGetStats.bind(this);
  }
  componentDidMount() {
    this.connectorInstance.socket.on('statsUpdate', this.handleGetStats);
    this.getStats();
    this.getStatsInterval = setInterval(this.getStats, 500);
  }
  componentWillUnmount() {
    // this.connectorInstance.socket.off('statsUpdate', this.handleGetStats);
    clearInterval(this.getStatsInterval);
  }
  getStats() {
    this.connectorInstance.socket.emit('getStats');
  }
  handleGetStats(stats) {
    const newStats = { ...stats,};
    delete newStats.logs;
    this.setState({
      serverStats: newStats,
    });
  }
  render() {
    const { classes, } = this.props;
    const { activeTab, } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={activeTab} onChange={this.handleChange}>
            <Tab label="Server data" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </AppBar>
        {activeTab === 0 && <TabContainer>

          <div className="admin-page">
            <ReactJson src={this.state.serverStats} theme="monokai" collapsed={2} />
          </div>

        </TabContainer>}
        {activeTab === 1 && <TabContainer>Item Two</TabContainer>}
        {activeTab === 2 && <TabContainer>Item Three</TabContainer>}
      </div>
    );
  }
}

Admin.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Admin);