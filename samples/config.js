/**
 * @file Global configuration for sample application
 * @copyright Digital Living Software Corp. 2014-2016
 */

(function (angular) {
    'use strict';

    var thisModule = angular.module('pipSampleConfig', ['pipRest.State', 'pipRest', 'pipEntry', 'pipSideNav',
        'pipAppBar']);

    // Configure application services before start
    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider,
                                $mdIconProvider, pipSideNavProvider) {
        var content = [
            {
                title: 'LOCATION',
                state: 'location',
                url: '/location',
                controller: 'LocationController',
                templateUrl: '../samples/location/location.html'
            },
            {
                title: 'DIALOG',
                state: 'dialogs',
                url: '/dialogs',
                controller: 'DialogsController',
                templateUrl: '../samples/dialogs/dialogs.html'
            }
            ], i, contentItem;

        $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);
        // String translations
        pipTranslateProvider.translations('en', {
            LOCATION_CONTROLS: 'Location controls',
            LOCATION: 'Location',
            DIALOG: 'Dialog',
            SIGNOUT: 'Sign out',
            SAMPLES: 'samples'
        });

        pipTranslateProvider.translations('ru', {
            LOCATION_CONTROLS: 'Контролы местонахождения',
            LOCATION: 'Местонахождение',
            DIALOG: 'Диалог',
            SIGNOUT: 'Выйти',
            SAMPLES: 'примеры'
        });

        for (i = 0; i < content.length; i++) {
            contentItem = content[i];
            $stateProvider.state(contentItem.state, contentItem);
        }

        $urlRouterProvider.otherwise('/location');

        // Configure navigation menu
        pipSideNavProvider.sections([
            {
                links: [{title: 'LOCATION_CONTROLS', url: '/list'}]
            },
            {
                links: [{title: 'SIGNOUT', url: '/signout'}]
            }
        ]);
    });

})(window.angular);
