(function (angular) {
    'use strict';

    var thisModule = angular.module('appControls',
        [
            'ngMaterial',
            'ui.router', 'ui.utils', 
            'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'LocalStorageModule', 

            'pipServices',
            'pipTheme.Default', 'pipTheme.BootBarn', 'pipTheme', 

            'appLocations.Location', 'appLocations.Dialogs'
        ]
    );

    var content = [
        {
            title: 'Location', state: 'location', url: '/location',
            controller: 'LocationController', templateUrl: 'location/location.html'
        },
        {
            title: 'Location doalog', state: 'dialogs', url: '/dialogs', 
            controller: 'DialogsController', templateUrl: 'dialogs/dialogs.html'
        }
    ];

    // Configure application services before start
    thisModule.config(
        function ($stateProvider, $urlRouterProvider, $mdIconProvider,
                  $compileProvider, $httpProvider) {

            $compileProvider.debugInfoEnabled(false);
            $httpProvider.useApplyAsync(true);

            var contentItem, i;

            $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);

            for (i = 0; i < content.length; i++) {
                contentItem = content[i];
                $stateProvider.state(contentItem.state, contentItem);
            }

            $urlRouterProvider.otherwise('/location');
       
        }
    );

    thisModule.controller('pipSampleController',

        function ($scope, $rootScope, $injector, $state, $mdSidenav, $timeout, $mdTheming, $mdMedia, localStorageService) {

            var pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null,
                appThemesDefault = $injector.has('appThemesDefault') ? $injector.get('appThemesDefault') : null,
                pipTheme = $injector.has('pipTheme') ? $injector.get('pipTheme') : null;


          $scope.isTranslated = !!pipTranslate;
            $scope.isTheme = !!pipTheme;
            $scope.$mdMedia = $mdMedia;

            $rootScope.$theme = localStorageService.get('theme') || 'blue';
            if ($scope.isTheme) {
                $scope.themes = _.keys(_.omit($mdTheming.THEMES, 'default'));
            } else {
                $scope.themes = [];
            }
            

            $scope.languages = ['en', 'ru', 'fr'];
            if (!$rootScope.$language) {
                $rootScope.$language = 'en';
            }


            $scope.content = content;
            $scope.menuOpened = false;

            // Update page after language changed
            $rootScope.$on('languageChanged', function(event) {
                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function(event) {
                $state.reload();
            });

            $scope.onSwitchPage = function (state) {
                $mdSidenav('left').close();
                $state.go(state);
            };

            $scope.onThemeClick = function(theme) {
                if ($scope.isTheme) {
                    setTimeout(function () {
                        pipTheme.use(theme, false, false);
                        $rootScope.$theme = theme;
                        $rootScope.$apply();
                    }, 0);                      
                }
            };
            
            $scope.onLanguageClick = function(language) {
                if ($scope.isTranslated) {
                    setTimeout(function () {
                        // change momentjs local 
                        // changeLocale(language);
                        pipTranslate.use(language);
                        $rootScope.$apply();
                    }, 0);   
                } 
             
            };

            $scope.onToggleMenu = function () {
                $mdSidenav('left').toggle();
            };


            $scope.isActiveState = function (state) {
                return $state.current.name == state;
            };
        
        }
    );

})(window.angular);
