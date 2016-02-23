var appControllers = angular.module('appControllers', []);

appControllers.controller('indexCtrl', ['$rootScope', '$scope', '$http',
	function($rootScope, $scope, $http) {
		$rootScope.title = 'Index';
	}
]);
