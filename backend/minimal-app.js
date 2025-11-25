import express from 'express';

console.log('Starting minimal app...');

const app = express();

app.get('/test', (req, res) => {
  res.json({ success: true });
});

const server = app.listen(5001, () => {
  console.log('Minimal app running on port 5001');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
