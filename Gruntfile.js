/*global module:false*/
module.exports = function(grunt) {

  // Helper methods
  function wrapModules(head, tail) {
    return head.concat(MODULE_LIST).concat(tail);
  }

  // Add modules:
  var MODULE_LIST = grunt.file.expand(['src/**/*.js',
                         '!src/doomWad.intro.js',
                         '!src/doomWad.const.js',
                         '!src/doomWad.core.js',
                         '!src/doomWad.outro.js']);

  var DIST_HEAD_LIST = [
      'src/doomWad.intro.js',
      'src/doomWad.const.js',
      'src/doomWad.core.js'
    ];

  // This is the same as DIST_HEAD_LIST, just without *.const.js (which is just
  // there UglifyJS conditional compilation).
  var DEV_HEAD_LIST = [
      'src/doomWad.intro.js',
      'src/doomWad.core.js'
    ];

  var TAIL_LIST = [
      'src/doomWad.init.js',
      'src/doomWad.outro.js'
    ];

  // Gets inserted at the top of the generated files in dist/.
  var BANNER = [
      '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
      '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n'
    ].join('');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        options: {
          banner: BANNER
        },
        src: wrapModules(DIST_HEAD_LIST, TAIL_LIST),
        dest: 'dist/doomWad.js'
      },
      dev: {
        options: {
          banner: BANNER
        },
        src: wrapModules(DEV_HEAD_LIST, TAIL_LIST),
        dest: 'dist/doomWad.js'
      }
    },
    uglify: {
      dist: {
        files: {'dist/doomWad.min.js': ['dist/doomWad.js']}
      },
      options: {
        banner: BANNER
      }
    },
    jsdoc: {
      basic: {
        src: grunt.file.expand(['src/**/*.js', '!src/doomWad.intro.js', '!src/doomWad.outro.js']),
      }
    },
    jasmine: {
      src: grunt.file.expand(['vendor/jquery.min.js',
                              'vendor/d3.min.js',
                              'test/jasmine-jquery/jasmine-jquery.js',
                              'test/mockjax/jquery.mockjax.js',
                              'src/**/*.js', '!src/doomWad.intro.js', '!src/doomWad.outro.js']),
      options: {
        specs: ['test/*Spec.js']
      }
    },
    jshint: {
      all_files: [
        'Gruntfile.js',
        'vendor/jQuery.min.js',
        'src/**/doomWad.!(intro|outro|const)*.js',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.registerTask('default', [
      'jshint',
      'jasmine',
      'jsdoc',
      'build',
    ]);
  grunt.registerTask('build', [
      'concat:dist',
      'uglify:dist',
      'concat:dev'
    ]);
};

