const defaultConfig = {
  NODE_ENV: "development",
  API_PORT: 3000,
  MONGODB_URI: "mongodb://localhost:27017/simple-user-api-mongodb",
  JWT_SECRET: "your-secret-key",
  LOG_LEVEL: "info",
};

const config = {
  NODE_ENV: process.env["NODE_ENV"] || defaultConfig.NODE_ENV,
  API_PORT: process.env["API_PORT"]
    ? parseInt(process.env["API_PORT"], 10)
    : defaultConfig.API_PORT,
  MONGODB_URI: process.env["MONGODB_URI"] || defaultConfig.MONGODB_URI,
  JWT_SECRET: process.env["JWT_SECRET"] || defaultConfig.JWT_SECRET,
  LOG_LEVEL: process.env["LOG_LEVEL"] || defaultConfig.LOG_LEVEL,
};

export default config;
