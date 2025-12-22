module.exports = {
  apps: [
    {
      name: "creavo-media-service",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 4005,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4007,
      },
    },
  ],
};
