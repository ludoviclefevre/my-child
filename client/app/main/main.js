(function () {
  'use strict';

  angular.module('myChildApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'app/main/main.html',
          controller: 'MainCtrl'
        });
    });
})();

