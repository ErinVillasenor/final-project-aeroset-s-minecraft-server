//credit to Dr. Rob Hess at Oregon State University
const redis = require('redis');

const app = require('express').Router();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

const redisClient = redis.createClient(redisPort, redisHost);

const rateLimitWindowMS = process.env.RATE_WINDOW || 60000;
const rateLimitNumRequests = process.env.RATE_LIMIT || 5;

console.log("== Rate Limiting Window Set to " + (rateLimitWindowMS / 1000) + " seconds.");
console.log("== Rate Limit set to " + rateLimitNumRequests + " per window.");

function getUserTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err) {
        reject(err);
      } else {
        if (tokenBucket) {
          tokenBucket.tokens = parseFloat(tokenBucket.tokens);
        } else {
          tokenBucket = {
            tokens: rateLimitNumRequests,
            last: Date.now()
          };
        }
        resolve(tokenBucket);
      }
    });
  });
}

function saveUserTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function applyRateLimit(req, res, next) {
  try {
    const tokenBucket = await getUserTokenBucket(req.ip);
    const timestamp = Date.now();
    const ellapsedMilliseconds = timestamp - tokenBucket.last;
    const newTokens = ellapsedMilliseconds *
      (rateLimitNumRequests / rateLimitWindowMS);
    tokenBucket.tokens += newTokens;
    tokenBucket.tokens = Math.min(
      tokenBucket.tokens,
      rateLimitNumRequests
    );
    tokenBucket.last = timestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      /* Save the token bucket back to Redis. */
      await saveUserTokenBucket(req.ip, tokenBucket);
      next();
    } else {
      /* Save the token bucket back to Redis. */
      await saveUserTokenBucket(req.ip, tokenBucket);
      res.status(429).send({
        error: "Too many requests per minute",
        token: tokenBucket
      });
    }
  } catch (err) {
    console.error(err);
    next();
  }
}

app.use(applyRateLimit);

app.get('/date', (req, res) => {
  res.status(200).send({
    timestamp: new Date().toString()
  });
});

module.exports = app;