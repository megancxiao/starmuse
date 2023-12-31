var sourceRoot = "./src";
var publicRoot = ".";
var sourceAssets  = sourceRoot;
var publicAssets = publicRoot;

module.exports = {
  include: {
    dest: publicAssets + '/js/',
    opt: {},
    src: [
      sourceAssets + '/js/app.js',
      sourceAssets + '/js/play.js'
    ]
  },
  sass: {
    src: sourceAssets + "/scss/**/*.scss",
    dest: publicAssets + "/css",
    opt: {outputStyle: 'compressed'}
  },
  server: {
    opt: {
      port: process.env.PORT || 7777,
      host: "0.0.0.0"
    }
  },
  uglify: {
    dest: publicAssets + '/js/',
    opt: {},
    src: sourceAssets + "/js/**/*.js",
  }
};
