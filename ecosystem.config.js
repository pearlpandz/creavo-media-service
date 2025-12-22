module.exports = {
  apps: [
    {
      name: "media-service-dev",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      out_file: "/var/lib/jenkins/.pm2/logs/dev-media-service-out.log",
      error_file: "/var/lib/jenkins/.pm2/logs/dev-media-service-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
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
      out_file: "/var/lib/jenkins/.pm2/logs/prod-media-service-out.log",
      error_file: "/var/lib/jenkins/.pm2/logs/prod-media-service-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
        PORT: 4007,
        UPLOAD_BASE_PATH: "/var/www/prod/backend/media-service/shared/uploads",
      },
    },
  ],
};
