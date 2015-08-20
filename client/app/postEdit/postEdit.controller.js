'use strict';

angular.module('myChildApp')
  .controller('PostEditCtrl', function($scope, $http, $routeParams, $location, Upload) {

    $scope.s3Medias = [];

    $scope.goToList = function() {
      $location.path('/posts/');
    }

    $scope.goToPost = function() {
      $location.path('/post/' + getPostId());
    }

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
                url: data.data,
                fileId: m.fileId
              });
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
      console.log(post)
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

    $scope.deleteMedia = function(media) {
      console.log($scope.post.medias);
      console.log(media)
      var toDel = _.find($scope.post.medias, {
        fileId: media.fileId
      })
      console.log(toDel);
      _.remove($scope.post.medias, {
        fileId: media.fileId
      });
      console.log($scope.post.medias)
      $scope.save();
    }

    $scope.upload = function(files) {
      //$scope.uploadOld(files)
      $scope.uploadOptim(files)

    }

    $scope.uploadOptim = function(files) {
      if (!files || files.length == 0) {
        return;
      }

      var filenameArr = []
      _.forEach(files, function(file) {
        filenameArr.push(file.name);
      })

      console.log('type:', filenameArr[0].type)


      $http.post('/api/getTempUrlWriteOptim', {
        postId: getPostId(),
        filenameArr: filenameArr,
        type: files[0].type
      }).then(function(res) {
        console.log(res);
        var uploadCount = res.data.length;
        _.forEach(res.data, function(fileInfo) {

          var file = _.find(files, {
            name: fileInfo.filename
          });

          console.log(fileInfo.url);
          console.log('uploading..');
          $.ajax({
            url: fileInfo.url,
            type: 'PUT',
            data: file,
            processData: false,
            contentType: file.type,
            xhr: function() {
              var xhrobj = $.ajaxSettings.xhr();
              if (xhrobj.upload) {
                xhrobj.upload.addEventListener('progress', function(event) {
                  var percent = 0;
                  var position = event.loaded || event.position;
                  var total = event.total || e.totalSize;
                  if (event.lengthComputable) {
                    percent = Math.ceil(position / total * 100);
                    console.log('prog:', percent)
                  }

                  //widget.settings.onUploadProgress.call(widget.element, widget.queuePos, percent);
                }, false);
              }

              return xhrobj;
            },
          }).success(function(res) {
            console.log('done 1 file');
            uploadCount--;
            if (!$scope.post.medias) {
              $scope.post.medias = [];
            }
            $scope.post.medias.push({
              fileId: fileInfo.fileId
            });
            if (uploadCount == 0) {
              $scope.save();
              console.log('done all files');
            }
          });
        })
      });
    }

    $scope.uploadOld = function(files) {



      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var fileId = null;
          $http.post('/api/getTempUrlWrite', {
            postId: getPostId(),
            name: file.name,
            size: file.size,
            type: file.type
          }).
          then(function(res) {
            console.log(res.data.url);
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
              $scope.post.medias.push({
                fileId: fileId
              });
              $scope.save();
              console.log('Done');

            });
          });
        }
      };
    }
  });