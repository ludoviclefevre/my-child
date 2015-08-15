(function () {
  'use strict';

  angular.module('myChildApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/galleries', {
          templateUrl: 'app/gallery/galleries.html',
          controller: 'GalleriesCtrl'
        });
    });
})();

