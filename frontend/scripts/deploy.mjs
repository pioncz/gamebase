#!/usr/bin/env zx
import chalk from 'chalk';
const { exec } = require('child_process');

const BUCKET = 's3://luzecki.com/gamebase';
const URL = 'luzecki.com/gamebase';

const getDeployCommand = () =>
  `aws s3 sync . ${BUCKET}`;

const getMetadataCommand = () =>
  `aws s3 cp ${BUCKET}/index.html ${BUCKET}/index.html --cache-control=no-store,no-cache,private`;

const execMaxBuffer = 1024 * 2000;

const execute = (command, cwd) => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd, maxBuffer: execMaxBuffer },
      (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
        }
        if (stderr) {
          reject(stderr);
        }
        resolve(stdout);
      },
    );
  });
};

export const log = (msg, color = 'white') =>
  console.log(chalk[color](msg));


const build = async () => {
  try {
    await execute(`yarn build -l silent`, '.');
  } catch (e) {
    log('❗ Build failed', 'red');
    log(e.indexOf('Done in '));
    log(e);
    process.exit('1');
  }
  log('✔ Build succeed', 'green');
};

const deployToAws = async () => {
  try {
    await execute(
      getDeployCommand(),
      './dist',
    );
  } catch (e) {
    log('❗ Deploy to AWS failed', 'red');
    log(e);
    process.exit('2');
  }
  log('✔ Deployed to aws.', 'green');
};

const updateCacheMetadata = async () => {
  try {
    await execute(getMetadataCommand());
  } catch (e) {
    log('❗ Update cache metadata failed', 'red');
    log(e);
    process.exit('6');
  }
  log('✔ Cache metadata updated.', 'green');
};

const main = async () => {
  log(`\n🚀 Deploying\n`);

  await build();
  await deployToAws();
  await updateCacheMetadata();

  log('✨ Successfully deployed!');
  log(
    `✨ Check it out: http://${URL}`,
    'blue',
  );
};

main();
