import http from 'http';

console.log('Testing AI Health Endpoint...');
console.log('Waiting 2 seconds for server to be ready...\n');

setTimeout(() => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/ai/health',
    method: 'GET',
    timeout: 5000
  };

  console.log(`Making request to: ${options.method} http://${options.hostname}:${options.port}${options.path}\n`);

  const req = http.request(options, (res) => {
    let data = '';
    
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers, '\n');

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response Body:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the server running on port 5000?');
    }
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('Request timeout');
    req.destroy();
    process.exit(1);
  });

  req.end();
}, 2000);
