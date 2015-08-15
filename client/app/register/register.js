(function () {
  'use strict';

  angular.module('myChildApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/register', {
          templateUrl: 'app/register/register.html',
          controller: 'RegisterCtrl'
        });
    });
})();

