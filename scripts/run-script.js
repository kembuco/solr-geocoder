const { spawn } = require('child_process');
const ora = require('ora');

module.exports = async function runScript({ message, command, args }) {
  const getText = ( text, output ) => `${text}\n${output}`.replace(/^(?:[\t ]*(?:\r?\n|\r))+/gm, '');
  let spinner;

  const response = new Promise(( resolve, reject ) => {
    const post = spawn(command, args, { shell: true });
    let output = '';

    post.stderr.on('data', reject);

    post.stdout.on('data', ( data ) => {
      output += data;

      spinner.text = getText(message, output);
    });

    post.on('close', () => {
      spinner.text = getText(message, output);

      resolve();
    });
  });

  spinner = ora.promise(response, { text: message, color: 'green' });

  return response.catch(( e ) => { console.log(`${e}`) });
}