/* global angular */

(function () {
    'use strict';

    var content = [
        { title: 'Location', state: 'location', url: '/location', controller: 'LocationController', templateUrl: 'location.html' },
        { title: 'Dialogs', state: 'dialogs', url: '/dialogs', controller: 'DialogsController', templateUrl: 'dialogs.html' }
    ];

    var thisModule = angular.module('appLocations', 
        [
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate', 
			'pipCore', 'pipLocations',
            'appLocations.Location', 'appLocations.Dialogs'
        ]
    );

    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider, $mdIconProvider) {
            $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);

//             $mdThemingProvider.theme('blue')
//                 .primaryPalette('blue')
//                 .accentPalette('green');
// 
//             $mdThemingProvider.theme('pink')
//                 .primaryPalette('pink')
//                 .accentPalette('orange');
// 
//             $mdThemingProvider.theme('green')
//                 .primaryPalette('green')
//                 .accentPalette('purple');
// 
//             $mdThemingProvider.theme('grey')
//                 .primaryPalette('grey')
//                 .accentPalette('yellow');
// 
//             $mdThemingProvider.setDefaultTheme('blue');

            // String translations
            pipTranslateProvider.translations('en', {
                'APPLICATION_TITLE': 'WebUI Sampler',

                'blue': 'Blue Theme',
                'green': 'Green Theme',
                'pink': 'Pink Theme',
                'grey': 'Grey Theme'
            });

            pipTranslateProvider.translations('ru', {
                'APPLICATION_TITLE': 'WebUI Демонстратор',

                'blue': 'Голубая тема',
                'green': 'Зеленая тема',
                'pink': 'Розовая тема',
                'grey': 'Серая тема'
            });

            for (var i = 0; i < content.length; i++) {
                var contentItem = content[i];
                $stateProvider.state(contentItem.state, contentItem);
            }
                
            $urlRouterProvider.otherwise('/location');
        } 
    );

    thisModule.controller('AppController', 
        function ($scope, $rootScope, $state, $mdSidenav, pipTranslate, $mdTheming, pipTheme, $mdMedia, localStorageService) {
            $scope.languages = ['en', 'ru'];
            $scope.themes = _.keys(_.omit($mdTheming.THEMES, 'default'));
            $rootScope.$theme = localStorageService.get('theme');

            $scope.content = content;
            $scope.menuOpened = false;

            $scope.onLanguageClick = function(language) {
                pipTranslate.use(language);
            };

            $scope.onThemeClick = function(theme) {
                $rootScope.$theme = theme;
                pipTheme.setCurrentTheme(theme);
            };
                        
            $scope.onSwitchPage = function(state) {
                $mdSidenav('left').close();
                $state.go(state);
            };
            
            $scope.onToggleMenu = function() {
                $mdSidenav('left').toggle();
            };
                        
            $scope.isActiveState = function(state) {
                return $state.current.name == state;  
            };

            $scope.isPadding = function () {
                if (!$rootScope.$state) return true;

                return !($rootScope.$state.name == 'tabs' || ($rootScope.$state.name == 'dropdown' && $mdMedia('xs')))
            }
        }
    );

})();
