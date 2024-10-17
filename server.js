import express from 'express';
import useragent from 'express-useragent';
import routes from './app/routes/index.js';
import redisClient from './app/config/redis.js';

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.static('./public'));

// Middleware to set payload type and limit
app.use(express.json({ limit: process.env.PAYLOAD_SIZE_LIMIT }));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.PAYLOAD_SIZE_LIMIT,
}));
app.use(useragent.express());

redisClient.connect();

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/ping', (req, res) => {
	res.send('pong');
})

// Routes
app.use('/api', routes);

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong',
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
