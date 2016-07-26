(function (angular) {
    'use strict';
    var thisModule = angular.module('appLocations',
        [
            'pipSampleConfig',
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate',
            'pipCore', 'pipLocations', 'pipLayout', 'pipDropdown',
            'appLocations.Location', 'appLocations.Dialogs'
        ]
    );

    thisModule.controller('AppController',
        function ($scope, $rootScope, $state, pipAppBar, $timeout) {

            $scope.pages = [
                {
                    title: 'LOCATION',
                    state: 'location',
                    url: '/location',
                    controller: 'LocationController',
                    templateUrl: 'location.html'
                },
                {
                    title: 'DIALOG',
                    state: 'dialogs',
                    url: '/dialogs',
                    controller: 'DialogsController',
                    templateUrl: 'dialogs.html'
                }
            ];

            $scope.selected = {};
            $timeout(function () {
                $scope.selected.pageIndex = _.findIndex($scope.pages, {state: $state.current.name});
            });

            $scope.onNavigationSelect = function (stateName) {
                if ($state.current.name !== stateName) {
                    $state.go(stateName);
                }
            };

            $scope.onDropdownSelect = function (obj) {
                if ($state.current.name !== obj.state) {
                    $state.go(obj.state);
                }
            };

            $scope.isEntryPage = function () {
                return $state.current.name === 'signin' || $state.current.name === 'signup' ||
                    $state.current.name === 'recover_password' || $state.current.name === 'post_signup';
            };
        }
    );

})(window.angular);
