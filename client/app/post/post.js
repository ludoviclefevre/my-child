(function () {
  'use strict';

  angular.module('myChildApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/post/:id', {
          templateUrl: 'app/post/post.html',
          controller: 'PostCtrl'
        });
    });
})();

