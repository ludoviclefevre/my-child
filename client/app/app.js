(function() {
  'use strict';

  angular.module('myChildApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'ngFileUpload'
  ])
    .config(function($routeProvider, $locationProvider) {
      $routeProvider
        .otherwise({
          redirectTo: '/'
        });

      $locationProvider.html5Mode(true);
    });
})();