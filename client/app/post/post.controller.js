(function () {
  'use strict';

  angular.module('myChildApp')
    .controller('PostCtrl', function ($routeParams,$http,$scope,$location) {
       
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
        
        $scope.goToList = function(){
          $location.path('/posts/');
        }

        $scope.editPost = function(){
        	$location.path('/postEdit/' + getPostId())
        }

        //constructeur
        getPost(function(post){
        	$scope.post = post;
        })

    });
})();
