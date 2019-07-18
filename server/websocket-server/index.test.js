const WebsocketServer = require('./index');

const ioMock = {
  use: () => {},
  on: () => {},
};

describe('Create websocket-server', () => {
  test('Constructor', () => {
    const websocketServer = new WebsocketServer(
      ioMock
    );
    expect(websocketServer).not.toEqual(null); // remove this line, when there are more tests
  });
});