'use strict';

angular.module('myChildApp')
  .controller('PostEditCtrl', function($scope, $http, $routeParams, $location, Upload) {

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
              file: m
            }).then(function(data) {
              console.log(data.data);
              $scope.s3Medias.push(data.data);
            });
          })

        }

        cb(post)
      });
    }

    $scope.save = function() {
      $http.put('/api/posts', $scope.post).then(function() {
        console.log('updated');
      })
    }

    $scope.delete = function() {
      $http.delete('/api/posts/' + $scope.post._id).then(function() {
        console.log('deleted');
        $location.path('/posts')
      })
    }

    //constructeur 
    getPost(function(post) {
      $scope.post = post;
    })

    $scope.$watch('files', function() {
      $scope.upload($scope.files);
    });
    $scope.$watch('file', function() {
      if ($scope.file != null) {
        $scope.upload([$scope.file]);
      }
    });
    $scope.log = '';



    $scope.upload = function(files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var fileId = null;
          $http.post('/api/getTempUrl', {
            postId: getPostId(),
            name: file.name,
            size: file.size,
            type: file.type
          }).
          then(function(res) {
            console.log('url:', res.data.url);
            fileId = res.data.fileId;
            $.ajax({
              url: res.data.url,
              type: 'PUT',
              data: file,
              processData: false,
              contentType: file.type,
            }).success(function(res) {

              if (!$scope.post.medias) {
                $scope.post.medias = [];
              }
              $scope.post.medias.push(fileId);
              $scope.save();
              console.log('Done');

            });
          });
        }
      };
    }
  });