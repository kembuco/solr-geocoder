const { spawn } = require('child_process');
const ora = require('ora');

module.exports = async function runScript({ message, command, args }) {
  let spinner;

  const response = new Promise(( resolve, reject ) => {
    const spawned = spawn(command, args, { shell: true });
    let output = '';

    spawned.on('close', resolve);
    spawned.stderr.on('data', reject);
    spawned.stdout.on('data', ( data ) => {
      output += data;

      spinner.text = `${message}\n${output}`.replace(/^(?:[\t ]*(?:\r?\n|\r))+/gm, '');
    });
  });

  spinner = ora.promise(response, { text: message, color: 'green' });

  return response.catch(( e ) => { console.log(`${e}`) });
}