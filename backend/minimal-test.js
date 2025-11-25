import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  console.log('Request received');
  res.json({ success: true, message: 'test' });
});

const PORT = 5001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
