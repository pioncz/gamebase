const Config = require('./config');

const logLevel = Config.server['log-level'];
class Logger {
  constructor(options) {
    if (!options.className) throw new Error('Logger required className');

    this.className = options.className;
    this.onLog = options.onLog;

    this.log = this.log.bind(this);
  }
  log(msg) {
    if (logLevel > 2) {
      const prefix = [`[${this.className}]: `,];
      console.log(Array.isArray(msg) ? [prefix,].concat(msg) : prefix + msg);
      if (this.onLog) {
        this.onLog(msg);
      }
    }
  }
}

module.exports = Logger;