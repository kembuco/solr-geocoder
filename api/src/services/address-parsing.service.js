const { PythonShell } = require('python-shell');
const python = require('util').promisify(PythonShell.run);

exports.parseAddress = async function parseAddress( address ) {
  const [ response ] = await python(process.env.PARSING_SCRIPT_NAME, {
    mode: 'json',
    args: [ address ],
    pythonOptions: [ '-u' ],
    pythonPath: process.env.PARSING_PYTHON_PATH,
    scriptPath: process.env.PARSING_SCRIPT_PATH
  });

  return response;
}