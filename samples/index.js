(function (angular) {
    'use strict';

    var thisModule = angular.module('appControls', [
        'ngMaterial',
        'ui.router', 'ui.utils',
        'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
        'LocalStorageModule',

        'pipServices', 'pipLayout',
        'pipTheme.Default', 'pipTheme.BootBarn', 'pipTheme',

        'pipLocations',
        'appLocations.Location', 'appLocations.Dialogs'
    ]);

    var content = [{
            title: 'Location',
            state: 'location',
            url: '/location',
            controller: 'LocationController',
            templateUrl: 'location/locationSample.html'
        },
        {
            title: 'Location Map',
            state: 'location_map',
            url: '/location_map',
            controller: 'LocationMapController',
            templateUrl: 'location_map/locationMap.html'
        },
        {
            title: 'Location Edit',
            state: 'location_edit',
            url: '/location_edit',
            controller: 'LocationEditController',
            templateUrl: 'location_edit/locationEditSample.html'
        },
        {
            title: 'Location Ip',
            state: 'location_ip',
            url: '/location_ip',
            controller: 'LocationIpController',
            templateUrl: 'location_ip/locationIp.html'
        },
        {
            title: 'Location dialog',
            state: 'dialogs',
            url: '/dialogs',
            controller: 'DialogsController',
            templateUrl: 'dialogs/dialogs.html'
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

            if (pipTranslate) {
                pipTranslate.setTranslations('en', {
                    OPEN_LOCATION: 'Open location edit dialog',
                    CODE: 'Code',
                    DIALOG: 'Dialog',
                    LOCATION: 'Location',
                    SAMPLES: 'Samples',
                    BY_IP: ' by ip'
                });
                pipTranslate.setTranslations('ru', {
                    OPEN_LOCATION: 'Открыть диалог изменения местонахождения',
                    CODE: 'Пример кода',
                    DIALOG: 'Диалог',
                    LOCATION: 'Местонахождение',
                    SAMPLE: 'Пример',
                    BY_IP: ' по ip'
                });
            }

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
            $rootScope.$on('languageChanged', function (event) {
                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function (event) {
                $state.reload();
            });

            $scope.onSwitchPage = function (state) {
                $mdSidenav('left').close();
                $state.go(state);
            };

            $scope.onThemeClick = function (theme) {
                if ($scope.isTheme) {
                    setTimeout(function () {
                        pipTheme.use(theme, false, false);
                        $rootScope.$theme = theme;
                        $rootScope.$apply();
                    }, 0);
                }
            };

            $scope.onLanguageClick = function (language) {
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