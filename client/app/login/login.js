(function () {
  'use strict';

  angular.module('myChildApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/login', {
          templateUrl: 'app/login/login.html',
          controller: 'LoginCtrl'
        });
    });
})();

