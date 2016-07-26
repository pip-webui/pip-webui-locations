/**
 * @file Global configuration for sample application
 * @copyright Digital Living Software Corp. 2014-2016
 */

(function (angular) {
    'use strict';

    var thisModule = angular.module('pipSampleConfig', ['pipRest.State', 'pipRest', 'pipSideNav',
        'pipAppBar']);

    // Configure application services before start
    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider,
                                $mdIconProvider, pipSideNavProvider) {
        var content = [
            {
                title: 'LOCATION',
                state: 'location',
                url: '/location',
                auth: false,
                controller: 'LocationController',
                templateUrl: 'location/location.html'
            },
            {
                title: 'DIALOG',
                state: 'dialogs',
                url: '/dialogs',
                auth: false,
                controller: 'DialogsController',
                templateUrl: 'dialogs/dialogs.html'
            }
            ],
            links = [
                { title: 'Basic controls', href: '/pip-webui-controls/index.html'},
                { title: 'Composite controls', href: '/pip-webui-composite/index.html'},
                { title: 'Core', href: '/pip-webui-core/index.html'},
                { title: 'CSS components', href: '/pip-webui-css/index.html'},
                { title: 'Document controls', href: '/pip-webui-documents/index.html'},
                { title: 'Entry pages', href: '/pip-webui-entry/index.html'},
                { title: 'Error handling', href: '/pip-webui-errors/index.html'},
                { title: 'Guidance components', href: '/pip-webui-guidance/index.html'},
                { title: 'Help components', href: '/pip-webui-help/index.html'},
                { title: 'Layouts', href: '/pip-webui-layouts/index.html'},
                { title: 'Navigation controls', href: '/pip-webui-nav/index.html'},
                { title: 'Picture controls', href: '/pip-webui-pictures/index.html'},
                { title: 'REST API', href: '/pip-webui-rest/index.html'},
                { title: 'Settings components', href: '/pip-webui-settings/index.html'},
                { title: 'Support components', href: '/pip-webui-support/index.html'},
                { title: 'Test Framework', href: '/pip-webui-test/index.html'}
            ], i, contentItem;

        $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);
        // String translations
        pipTranslateProvider.translations('en', {
            LOCATION_CONTROLS: 'Location controls',
            LOCATION: 'Location',
            DIALOG: 'Dialog',
            SIGNOUT: 'Sign out',
            SAMPLES: 'samples',
            MAP: 'map',
            EDIT: 'edit',
            BY_IP: 'by IP'
        });

        pipTranslateProvider.translations('ru', {
            LOCATION_CONTROLS: 'Контролы местонахождения',
            LOCATION: 'Местонахождение',
            DIALOG: 'Диалог',
            SIGNOUT: 'Выйти',
            SAMPLES: 'примеры',
            MAP: 'карта',
            EDIT: 'редактирование',
            BY_IP: 'по IP'
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
            }/*, Links only for publishing samples
            {
                links: links    
            }/*,
            {
                links: [{title: 'SIGNOUT', url: '/signout'}]
            }*/
        ]);
    });

})(window.angular);
