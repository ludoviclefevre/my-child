'use strict';

angular.module('myChildApp')
  .controller('PostEditCtrl', function ($scope,$http,$routeParams,$location) {

        function getPostId(){
    		return $routeParams.id;
    	}

        function getPost(cb){
        	$http.get('/api/posts').then(function(data){

        		console.log(data)
          		var post = _.find(data.data,{_id:getPostId()})
          		console.log(post);
          		cb(post)
        	});	
        }

        $scope.save = function(){
        	$http.put('/api/posts',$scope.post).then(function(){
        		console.log('updated');
        	})
        }

        $scope.delete = function(){
        	$http.delete('/api/posts/' + $scope.post._id).then(function(){
        		console.log('deleted');
        		$location.path('/posts')
        	})	
        }

        //constructeur
        getPost(function(post){
        	$scope.post = post;
        })

  });
