const ActionsStream = require('./index');
const actionsStream = new ActionsStream();
const InitialDate = 1000;
let testFlag;

describe('Actions call order', () => {
  beforeEach(() => {
    testFlag = false;
  });
  test('Single now action', () => {
    const initialQueueLength = actionsStream.queue.length;
    actionsStream.addAction(() => {
      testFlag = true;
    }, 0);

    expect(actionsStream.queue.length).toBe(initialQueueLength);
    expect(testFlag).toBe(true);
  });
  test('Single delayed action - call and delete', () => {
    const initialQueueLength = actionsStream.queue.length;
    actionsStream.addAction(() => {
      testFlag = true;
    }, InitialDate + 1);
    expect(testFlag).toBe(false);
    expect(actionsStream.queue.length).toBe(initialQueueLength + 1);
    actionsStream.update(InitialDate + 1);
    expect(testFlag).toBe(true);
    expect(actionsStream.queue.length).toBe(initialQueueLength);
  });
  test('Single delayed action - multiple updates', () => {
    const initialQueueLength = actionsStream.queue.length;

    actionsStream.addAction(() => {
      testFlag = true;
    }, InitialDate + 2);

    expect(testFlag).toBe(false);
    expect(actionsStream.queue.length).toBe(initialQueueLength + 1);
    actionsStream.update(InitialDate + 1);
    expect(testFlag).toBe(false);
    expect(actionsStream.queue.length).toBe(initialQueueLength + 1);
    actionsStream.update(InitialDate + 2);
    expect(testFlag).toBe(true);
    expect(actionsStream.queue.length).toBe(initialQueueLength);
  });
  test('Two cross-running actions', () => {
    const initialQueueLength = actionsStream.queue.length;
    let testFlag2 = false;

    actionsStream.addAction(() => {
      testFlag = true;
    }, InitialDate + 2);
    actionsStream.addAction(() => {
      testFlag2 = true;
    }, InitialDate + 1);
    expect(testFlag).toBe(false);
    expect(testFlag2).toBe(false);
    expect(actionsStream.queue.length).toBe(initialQueueLength + 2);
    actionsStream.update(InitialDate + 1);
    expect(testFlag).toBe(false);
    expect(testFlag2).toBe(true);
    expect(actionsStream.queue.length).toBe(initialQueueLength + 1);
    actionsStream.update(InitialDate + 2);
    expect(testFlag).toBe(true);
    expect(testFlag2).toBe(true);
    expect(actionsStream.queue.length).toBe(initialQueueLength);
  });
});
