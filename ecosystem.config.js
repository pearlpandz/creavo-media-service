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
        UPLOAD_BASE_PATH: "/var/www/dev/backend/media-service/shared/uploads",
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
        UPLOAD_BASE_PATH: "/var/www/prod/backend/media-service/shared/uploads",
      },
    },
  ],
};
