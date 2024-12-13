module.exports = {
    apps: [
      {
        name: 'webhook-server-github', 
        script: './server.js', 
        instances: 1, 
        autorestart: true,
        watch: true, 
        max_memory_restart: '1024M', 
        env: {
          NODE_ENV: 'development',
          PORT: 3010,
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 4010,
        }
      }
    ]
  };
  