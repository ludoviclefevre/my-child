'use strict';

angular.module('myChildApp')
  .controller('PostEditCtrl', function($scope, $http, $routeParams, $location, Upload) {

    $scope.s3Medias = [];
    $scope.uploadStatus = {}
    $scope.uploadStatus.fileCount = 0;
    $scope.uploadStatus.uploads = []

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


        var post = _.find(data.data, {
          _id: getPostId()
        })


        $scope.s3Medias.length = 0;
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

    function refreshPost() {
      getPost(function(post) {
        $scope.post = post;
        if (!$scope.post.medias) {
          $scope.post.medias = [];
        }
        console.log(post)
      })
    }

    //constructeur 
    refreshPost()

    $scope.$watch('files', function() {
      $scope.upload($scope.files);
    });
    $scope.$watch('file', function() {
      if ($scope.file != null) {
        $scope.upload([$scope.file]);
      }
    });


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


    function uploadOneFile(fileInfo, currentUploadInfo, cb) {

      console.log('upload 1 file')
      $.ajax({
        url: fileInfo.url,
        type: 'PUT',
        data: fileInfo.file,
        processData: false,
        contentType: fileInfo.file.type,
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
                currentUploadInfo.progress = percent;
                $scope.$apply();
              }
            }, false);
          }

          return xhrobj;
        },
      }).success(function(res) {
        cb();
      });
    }

    var uploadIndex;

    function uploadThread(fileInfos, index, cb) {
      console.log('uploadThread,uploadIndex:', uploadIndex)
      if (uploadIndex >= fileInfos.length) {
        console.log('uploadThread,uploadIndex.exiting:', uploadIndex)
        cb();
        return;
      }
      var fileInfo = fileInfos[uploadIndex]
      uploadIndex++;
      var currentUploadInfo = {
        fileInfo: fileInfo,
        progress: 0
      };
      $scope.uploadStatus.uploads.push(currentUploadInfo);

      uploadOneFile(fileInfo, currentUploadInfo, function() {
        _.remove($scope.uploadStatus.uploads, {
          progress: 100
        });
        $scope.post.medias.push({
          fileId: fileInfo.fileId
        });
        $scope.uploadStatus.uploadedCount++;
        uploadThread(fileInfos, uploadIndex + 1, cb);
      })
    }

    function launchUploadThread(fileInfos, cb) {
      var nbFinishedThread = 0;
      uploadIndex = 0;
      var NB_THREAD = 2;

      for (var i = 0; i < NB_THREAD; i++) {
        uploadThread(fileInfos, uploadIndex, function() {
          uploadIndex++;
          nbFinishedThread++;
          if (nbFinishedThread >= NB_THREAD) {
            cb();
          }
        });
      }
    }

    $scope.upload = function(files) {
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

        var fileInfos = res.data;
        _.forEach(fileInfos, function(fileInfo) {
          fileInfo.file = _.find(files, {
            name: fileInfo.filename
          });
        })

        console.log('fileInfos', fileInfos)

        $scope.uploadStatus.fileCount = files.length;
        $scope.uploadStatus.uploadedCount = 0;

        launchUploadThread(fileInfos, function() {
          $scope.save();
          $scope.uploadStatus.fileCount = 0;
          console.log('done all files');
          refreshPost()
        })

      });
    }


  });