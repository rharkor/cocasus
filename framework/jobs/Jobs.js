const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

class Jobs {
  constructor(options, path) {
    this.options = options;
    this.path = path;
    this.jobs = [];

    this.registerFileJobs();
    this.registerAllStoredJobs();
  }

  registerFileJobs() {
    if (this.options.enabled) {
      const jobDirectory = this.options.directory;
      const localPath = this.path;
      if (fs.existsSync(path.join(localPath, jobDirectory))) {
        const jobFiles = fs.readdirSync(path.join(localPath, jobDirectory));
        jobFiles.forEach((file) => {
          const job = require(path.join(localPath, jobDirectory, file));
          if (job.enabled) {
            this.registerJob(job);
          }
        });
      }
    }
  }

  registerAllStoredJobs() {
    if (this.options.enabled) {
      Object.keys(this.options.list).forEach((jobName) => {
        const job = this.options.list[jobName];
        if (job.enabled) {
          this.registerJob(job);
        }
      });
    }
  }

  registerJob(job) {
    // Store the job
    this.jobs.push(job);
  }

  startHandling() {
    this.jobs.forEach((job) => {
      // Handle the job
      schedule.scheduleJob(job.cron, job.handler);
    });
  }

  printJobs() {
    // Pretty print all jobs
    console.log('Jobs:');
    this.jobs.forEach((job) => {
      let text = '';
      text += `${job.cron}  `;
      if (job.name) {
        text += `${job.name}  `;
      }
      if (job.description) {
        text += `${job.description}  `;
      }
      text += job.enabled;
      console.log(text);
    });
  }
}

module.exports = Jobs;
