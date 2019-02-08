class ActionsStream {
  constructor() {
    this.queue = [];
  }
  addAction(callback, timestamp) {
    if (!timestamp) {
      callback();
    } else {
      this.queue.push({
        callback,
        timestamp,
      });
    }
  }
  update(dateNow = Date.now()) {
    for(let i = this.queue.length - 1; i >= 0; i--) {
      let queueEl = this.queue[i];
      if (queueEl.timestamp <= dateNow) {
        queueEl.callback();
        this.queue.splice(i, 1);
      }
    }
  }
}

module.exports=ActionsStream;