module.exports = {
  apps: [
    {
      name: "tutien-fe",
      script: ".next/standalone/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 83,
        NEXT_PUBLIC_API_URL: "http://localhost:84"
      }
    }
  ]
};
