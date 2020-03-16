const { PythonShell } = require('python-shell');
const python = require('util').promisify(PythonShell.run);

exports.parseAddress = async function parseAddress( address ) {
  const [ response ] = await python(process.env.PARSING_SCRIPT_NAME, {
    mode: 'json',
    pythonPath: process.env.PARSING_PYTHON_PATH,
    pythonOptions: [ '-u' ],
    scriptPath: process.env.PARSING_SCRIPT_PATH,
    args: [ address ]
  });

  return response;
}