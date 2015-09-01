(function() {
  'use strict';

  angular.module('myChildApp')
    .controller('PostCtrl', function($routeParams, $http, $scope, $location) {

      $scope.s3Medias = [];

      function getPostId() {
        return $routeParams.id;
      }

      function getPost(cb) {
        $http.get('/api/posts').then(function(data) {

          console.log(data)
          var post = _.find(data.data, {
            _id: getPostId()
          })
          console.log(post);

          if (post.medias) {

            _.forEach(post.medias, function(m) {
              $http.post('/api/getTempUrlRead', {
                _id: getPostId(),
                file: m.fileId
              }).then(function(data) {
                console.log(data.data);
                $scope.s3Medias.push({
                  url: data.data.url,
                  thumbUrl: data.data.url,
                  fileId: m.fileId
                });
              });
            })

          }

          cb(post)
        });
      }

      $scope.goToList = function() {
        $location.path('/posts/');
      }

      $scope.editPost = function() {
        $location.path('/postEdit/' + getPostId())
      }

      //constructeur
      getPost(function(post) {
        $scope.post = post;
      })

    });
})();
