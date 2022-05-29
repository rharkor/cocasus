const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const { table } = require('table');

const colors = require('../../utils/method').colors;

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
          job.location = path.join(localPath, jobDirectory, file);
          this.registerJob(job);
        });
      }
    }
  }

  registerAllStoredJobs() {
    if (this.options.enabled) {
      Object.keys(this.options.list).forEach((jobName) => {
        const job = this.options.list[jobName];
        job.location = 'app config (options)';
        this.registerJob(job);
      });
    }
  }

  registerJob(job) {
    // Store the job
    this.jobs.push(job);
  }

  startHandling() {
    this.jobs.forEach((job) => {
      if (job.enabled) {
        // Handle the job
        schedule.scheduleJob(job.cron, job.handler);
      }
    });
  }

  printJobs() {
    // Pretty print all jobs
    const data = [
      [
        colors.info('Cron'),
        colors.info('Name'),
        colors.info('Description'),
        colors.info('Location'),
        colors.info('Enabled'),
      ],
      ...this.jobs.map((job) => {
        return [
          job.cron ? job.cron : '-',
          job.name ? job.name : '-',
          job.description ? job.description : '-',
          job.location ? job.location : '-',
          job.enabled ? colors.success('enabled') : colors.error('disabled'),
        ];
      }),
    ];
    const config = {
      header: {
        alignment: 'center',
        content: 'Jobs',
      },
      columnDefault: {
        paddingLeft: 2,
        paddingRight: 2,
      },
    };
    console.log(table(data, config));
  }
}

module.exports = Jobs;
