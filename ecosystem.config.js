module.exports = {
    apps: [
      {
        name: 'webtriage-worker',
        // invoke your existing npm script
        script: 'npm',
        args: 'run run-worker',
        cwd: '/Users/katrina/Projects/webtriage/webtriage.dev', // adjust to your project path
        watch: false,
        autorestart: true,
        restart_delay: 5000,
        env_production: {
          NODE_ENV: 'production'
          // all other env-vars (SUPABASE_URL, etc.) should be set in your host’s ENV,
          // not hard-coded here
        },
      },
    ],
  };
  