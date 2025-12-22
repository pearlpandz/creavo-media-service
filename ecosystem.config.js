module.exports = {
  apps: [
    {
      name: "media-service-dev",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 4005,
      },
    },
    {
      name: "media-service-prod",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4007,
      },
    },
  ],
};
