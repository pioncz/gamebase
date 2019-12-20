const WebsocketServer = require('./index');

class IoMock {
  constructor() {
    this.events = {};
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
  }
  use(socket, next) {

  }
}

const ioMock = new IoMock();

const playerServiceMock = {

};

describe('Create websocket-server', () => {
  test('Constructor', () => {
    const websocketServer = new WebsocketServer(
      ioMock,
      playerServiceMock,
    );
    expect(websocketServer).not.toEqual(null); // remove this line, when there are more tests
  });
});