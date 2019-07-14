const BotsManager = require('./bots-manager');

describe('Create bots manager', () => {
  test('Manager created with 5 bots', () => {
    const botsManager = new BotsManager({
      totalBots: 5,
      roomQueueTimeout: 1000,
      randomDelays: [100, 1000,],
    });

    expect(botsManager.bots.length).toBe(5);
  });
});