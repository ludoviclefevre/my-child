'use strict';

angular.module('myChildApp')
  .directive('fancybox', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        if (scope.$last) setTimeout(function() {
          $('.fancybox').fancybox({
            theme: 'dark'
          });
        }, 1);
      }
    };
  });