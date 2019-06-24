import React, { Component, } from 'react'
import Classnames from 'classnames'
import './index.sass'

const visibilityLength = 3000;
const transitionLength = 200;

class Snackbar extends Component {
  state = {
    innerMessages: [],
    lastId: 0,
  };

  addMessage(text, color) {
    const { innerMessages, lastId,} = this.state;

    this.setState({
      innerMessages: [
        ...innerMessages,
        {
          id: lastId,
          text,
          init: true,
          color,
        },
      ],
      lastId: lastId + 1,
    }, () => {
      setTimeout(() => {
        const { innerMessages, } = this.state;
        const message = innerMessages.find(message => message.id === lastId);

        if (message) {
          this.setState({
            innerMessages: innerMessages.map(innerMessage =>
              innerMessage.id === message.id ?
                {...innerMessage, init: false,} :
                {...innerMessage,}
            ),
          });
        }
      }, 10);
      setTimeout(() => {
        const { innerMessages, } = this.state;
        const message = innerMessages.find(message => message.id === lastId);

        if (message) {
          this.setState({
            innerMessages: innerMessages.map(innerMessage =>
              innerMessage.id === message.id ?
                {...innerMessage, remove: true,} :
                {...innerMessage, }
            ),
          });
        }
      }, visibilityLength);
      setTimeout(() => {
        const { innerMessages, } = this.state;
        const message = innerMessages.find(message => message.id === lastId);

        if (message) {
          this.setState({
            innerMessages: innerMessages.filter(innerMessage =>
              innerMessage.id !== message.id
            ),
          });
        }
      }, visibilityLength + transitionLength + 100);
    });
  }

  render() {
    const { messages, } = this.props;
    const { innerMessages,} = this.state;

    return (
      <div className="snackbar">
        <div className="snackbar-wrapper">
          {innerMessages.map(({id, text, init, remove, color, }) => {
            let style = {
              borderLeft: '4px solid ' + color,
              borderRight: '4px solid ' + color,
            };
            return (<div
              className={Classnames(
                'snackbar-body',
                init ? '' : 'snackbar-body--visible',
                remove ? 'snackbar-body--remove' : '',
              )}
              style={color ? style : {}}
              key={id}
            >
              {text}
            </div>)
          })}
        </div>
      </div>
    );
  }
}
export default Snackbar;