import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/gigflow',
  jwtSecret: process.env.JWT_SECRET || '2e75bac867298e227563729a6be70ddadebdbfb540636ce53c063cbf5e24e087',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  bcryptRounds: 12,
  defaultPageLimit: 10,
};
