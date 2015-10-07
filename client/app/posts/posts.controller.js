(function () {
  'use strict';

  angular.module('myChildApp')
    .controller('PostsCtrl', function ($scope, $http, $location) {

      function displayPosts() {
        console.log('displayPosts');
        $http.get('/api/posts').then(function (data) {
          $scope.posts = data.data;

        });
      }

      $scope.goToPost = function (post) {
        console.log(post._id)
        $location.path('/post/' + post._id);
      };

      $scope.addPost = function () {
        if (!$scope.newPost.title) {
          return;
        }
        $http.post('/api/posts', $scope.newPost).then(function (res) {
          var id = res.data.insertedIds[0];
          $location.path('/postEdit/' + id);
        });
      };

      displayPosts();
    });
})();
