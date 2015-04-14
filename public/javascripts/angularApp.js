angular.module('powwow', ['ui.router'])

.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				contestantsPromise: ['contestants', function(contestants){
					return contestants.getAll();
				}]
			}
		})
		.state('contestants', {
			url: '/contestants/{id}',
			templateUrl: '/contestants.html',
			controller: 'ContestantsCtrl',
			resolve: {
				contestant: ['$stateParams', 'contestants', function($stateParams, contestants) {
					return contestants.get($stateParams.id);
				}]
			}
		});

	$urlRouterProvider.otherwise('home');
}])

.factory('contestants', ['$http', function($http) { // this is where are front end and back end meet!
	var o = {
		contestants:  []
	};
	
	o.get = function(id){
		return $http.get('/contestants/' + id).then(function(res){
			return res.data;
		});
	};
	
	o.getAll = function() {
		return $http.get('/contestants').success(function(data){
			angular.copy(data, o.contestants);
		});
	};
	
	o.create = function(contestant) {
		return $http.post('/contestants', contestant)// tells server to add contestant
		.success(function(data){ // allows us to data bind
			o.contestants.push(data); // tells controller to add contestant
		});
	};
	
	o.upvote = function(contestant) {
		return $http.put('/contestants/' + contestant._id + '/upvote')
		.success(function(data){
			contestant.upvotes += 1;
		});
	};
	
	o.addComment = function(id, comment) {
		return $http.post('/contestants/' + id + '/comments', comment);
	};
	
	o.upvoteComment = function(contestant, comment){
		return $http.put('/contestants/' + contestant._id + '/comments/' + comment._id + '/upvote')
		.success(function(data){
			comment.upvotes += 1;
		});
	};
	
	return o;
}])

.controller('MainCtrl', [
'$scope',
'contestants',
function($scope, contestants){
	
	$scope.test = 'inch by inch';

	$scope.contestants = contestants.contestants;

	$scope.addContestant  = function() {
		if($scope.title === '') {
			return;
		}
		contestants.create({
				title: $scope.title,
				link: $scope.link,
		});
		$scope.title = '';
		$scope.link = '';
	};

	$scope.incrementUpvotes = function(contestant) {
		contestants.upvote(contestant);
	};
}])

.controller('ContestantsCtrl', [
'$scope',
'contestant',
'contestants',
function($scope, contestant, contestants){

	$scope.contestant = contestant;

	$scope.addComment = function() {
		if($scope.body === '') {
			return;
		}
		contestants.addComment(contestant._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment){
			$scope.contestant.comments.push(comment);
		});
		$scope.body = '';
	};
	
	
	$scope.incrementUpvotes = function(comment) {
			contestants.upvoteComment(contestant, comment);
	};

}]);