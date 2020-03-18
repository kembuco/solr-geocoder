const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora');

const solrPath = path.resolve(__dirname, '..', 'solr/bin/solr');


module.exports = function solr( command, message ) {
  return async function start({ port = 8983 }) {
    let spinner;
  
    const response = new Promise(( resolve, reject ) => {
      const start = spawn(solrPath, [command, `-p ${port}`], { shell: true });
      let success = true;
      let output = '';
    
      start.stdout.on('data', ( data ) => {
        if ( data.indexOf(`Port ${port} is already being used`) == 1 ) {
          success = false;
        }
  
        output += data;
  
        spinner.text = `${message}\n${output}`;
      });  
      start.stderr.on('data', reject);  
      start.on('close', () => {
        if ( success ) {
          spinner.text = message;
  
          resolve();
        } else {
          reject()
        }
      });
    });
  
    spinner = ora.promise(response, { text: message, color: 'green' });
  
    return response.catch(( e )=>{ console.log(e) });
  };
};