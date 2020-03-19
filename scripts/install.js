const unzipper = require('unzipper');
const axios = require('axios');
const chalk = require('chalk');
const path = require('path');
const util = require('util');
const ora = require('ora');
const fs = require('fs-extra');

const downloadUrl = 'https://downloads.apache.org/lucene/solr';
const installPath = `${__dirname}/../`;
const unzippedPath = path.resolve(installPath, 'solr');
const executablePath = path.resolve(unzippedPath, 'bin/solr');
const postPath = path.resolve(unzippedPath, 'bin/post');
const EXECUTABLE_PERMISSIONS = 0o755;

// TODO: add flag for prduction use (i.e. create startup scripts, etc.)
module.exports = async function install( version ) {
  const downloaded = await download(version);
  const unzipped = await unzip(version);
  const renamed = await move(version);

  return Promise.all([
    downloaded,
    unzipped,
    renamed
  ]);
}

function stats( version ) {
  const name = `solr-${version}`;
  const filename = `${name}.zip`;

  return {
    name,
    filename,
    filepath: path.resolve(installPath, filename)
  }
}

async function download( version ) {
  const { filename, filepath } = stats(version);
  const url = `${downloadUrl}/${version}/${filename}`;
  const text = `Downloading ${chalk.magenta(filename)}`;
  let response = Promise.resolve();
  let spinner;
  let writer;

  try {
    // If the file exists, don't download it
    fs.accessSync(filepath, fs.constants.R_OK);

    // Show immediate response
    spinner = ora.promise(response, { text, color: 'green' });
  } catch ( e ) {
    // Open file for writing
    writer = fs.createWriteStream(filepath);

    // Create a promise that will resolve when the file finishes or errors out.
    response = new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Create a progress spinner that updates on progress events
    spinner = ora.promise(response, { text, color: 'green' });
    
    // Initialize the download
    const { data, headers } = await axios.get(url, {
      responseType: 'stream'
    });  
  
    // Show progress
    const totalLength = headers['content-length'];
    let downloaded = 0;
    data.on('data', ( chunk ) => {
      downloaded += chunk.length;
  
      spinner.text = `${text} - ${Math.round((downloaded / totalLength) * 100)}%`;
    });
  
    // Write data to the file
    data.pipe(writer);
  }

  return response;
}

async function unzip( version ) {
  const { filename, filepath } = stats(version);
  let response = Promise.resolve();
  let file;

  try {
    file = await unzipper.Open.file( filepath );    
    response = file.extract({ path: unzippedPath });
  
    ora.promise(response, {
      text: `Extracting ${chalk.magenta(filename)}`,
      color: 'green'
    });
  } catch ( e ) {
    console.log(e);
  }

  return response;
}

async function move( version ) {
  const { name } = stats(version);
  const installedPath = path.resolve(unzippedPath, name);
  const movedPath = path.resolve(installPath, name);

  const moved = await fs.move(installedPath, movedPath);
  const removed = await fs.remove(unzippedPath);
  const renamed = await fs.rename(movedPath, unzippedPath);
  const chmoded = await Promise.all([
    fs.chmod(executablePath, EXECUTABLE_PERMISSIONS),
    fs.chmod(postPath, EXECUTABLE_PERMISSIONS)
  ]);

  const response = Promise.all([
    moved,
    removed,
    renamed,
    chmoded
  ]);
  
  ora.promise(response, {
    text: `Installing Solr (${chalk.magenta(version)})`,
    color: 'green'
  });

  return response;
}