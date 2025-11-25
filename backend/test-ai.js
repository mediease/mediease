import http from 'http';

function testAI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/ai/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

testAI();
