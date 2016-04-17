module.exports = function(grunt) {
  'use strict';

  function getUserHome() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  grunt.loadNpmTasks('grunt-env');

  grunt.loadNpmTasks('grunt-nodemon');

  // Project configuration.
  grunt.initConfig({
    env: {
      dev : {
        src : getUserHome() + "/.csvtoapi/dev.json"
      },
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          cwd: __dirname,
          ignore: ['node_modules/**'],
          ext: 'js',
          delay: 500
        }
      },
    }
  });

  grunt.registerTask('development', ['env:dev', 'nodemon:dev']);
};
