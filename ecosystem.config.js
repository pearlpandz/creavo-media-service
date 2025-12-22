module.exports = {
  apps: [
    {
      name: "media-service-dev",
      script: "server.js",
      cwd: "/var/www/dev/backend/media-service",
      env: {
        NODE_ENV: "development",
        PORT: 4005,
        ENV: "dev",
        DEPLOY_BASE: "/var/www/dev/backend/media-service",
      },
    },
    {
      name: "media-service-prod",
      script: "server.js",
      cwd: "/var/www/prod/backend/media-service",
      env: {
        NODE_ENV: "production",
        PORT: 4007,
        ENV: "prod",
        DEPLOY_BASE: "/var/www/prod/backend/media-service",
      },
    },
  ],
};
