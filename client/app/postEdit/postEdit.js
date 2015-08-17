'use strict';

angular.module('myChildApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/postEdit/:id', {
        templateUrl: 'app/postEdit/postEdit.html',
        controller: 'PostEditCtrl'
      });
  });
