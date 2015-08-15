(function () {
  'use strict';

  angular.module('myChildApp')
    .controller('MainCtrl', function ($scope, $http) {
      $scope.awesomeThings = [];

      $http.get('/api/things').success(function (awesomeThings) {
        $scope.awesomeThings = awesomeThings;
      });

    });
})();
