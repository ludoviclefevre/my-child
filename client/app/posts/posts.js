(function () {
  'use strict';

  angular.module('myChildApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/posts/', {
          templateUrl: 'app/posts/posts.html',
          controller: 'PostsCtrl'
        });
    });
})();

