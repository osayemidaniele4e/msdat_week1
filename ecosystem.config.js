module.exports = {
  apps: [
    {
      name: 'msdat',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
