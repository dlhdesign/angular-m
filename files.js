mFiles = {
  src: [
    'src/common.js',
    'src/http.js',
    'src/regex.js',
    'src/base.js',
    'src/singleton.js',
    'src/collection.js'
  ],
  test: [
    'spec/*-spec.js'
  ],
  angular: function(version) {
    return [
      'lib/angular-' + version + '/angular.js',
      'lib/angular-' + version + '/angular-mocks.js'
    ].concat(['1.2.14', '1.3.0'].indexOf(version) !== -1 ? ['lib/angular-' + version + '/angular-animate.js'] : []);
  }
};

if (exports) {
  exports.files = mFiles;
}