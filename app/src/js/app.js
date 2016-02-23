var app = angular.module('app', [
  'ngRoute',
  'appControllers'
]);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index.html',
        controller: 'indexCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
