const Job = require('../vendor/jobs/Job');

/*
CRON

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
*/

const job = new Job('testJob', 'This is an example job');

job.setCron('*/1 * * * * *');

job.setHandler(() => {
  console.log('test');
});

job.enabled = false;

module.exports = job;
