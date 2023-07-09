module.exports = {
  apps : [{
    script: 'dist/index.js',
    watch: true,
    ignore_watch: ['node_modules', 'ecosystem.config.js']
  }]
};
