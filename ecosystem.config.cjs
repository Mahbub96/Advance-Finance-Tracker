module.exports = {
  apps: [
    {
      name: 'finance-api',
      cwd: './apps/api',
      script: 'node_modules/.bin/tsx',
      args: 'src/main.ts',
      env: {
        NODE_ENV: 'production',
        API_PORT: 5500,
        API_HOST: '0.0.0.0',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
