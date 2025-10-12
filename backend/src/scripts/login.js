'use strict';

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { login, ROLES } = require('../auth/login');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const [key, value] = argv[i].split('=');
    if (key && value) {
      args[key.replace(/^--/, '')] = value;
    }
  }
  return args;
}

(async () => {
  const args = parseArgs(process.argv);
  const email = args.email || '';
  const password = args.password || '';
  const role = args.role || '';

  try {
    const result = await login({ email, password, role });
    // eslint-disable-next-line no-console
    console.log('Token:', result.token);
    // eslint-disable-next-line no-console
    console.log('User:', JSON.stringify(result.user));
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login failed:', err.message);
    process.exit(1);
  }
})();



