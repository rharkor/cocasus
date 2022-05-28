class Job {
  constructor(
    name,
    description = '',
    cron = null,
    handler = null,
    enabled = true
  ) {
    this.name = name;
    this.description = description;
    this.cron = cron;
    this.handler = handler;
    this.wantedEnabled = enabled;
    this.enabled = enabled && cron && handler;
  }

  setCron(cron) {
    this.cron = cron;
    if (this.wantedEnabled && cron && this.handler) {
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }

  setHandler(handler) {
    this.handler = handler;
    if (this.wantedEnabled && this.cron && handler) {
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }
}

module.exports = Job;
