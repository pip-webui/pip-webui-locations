
(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Location', []);

    thisModule.controller('LocationController',
        function ($scope, $timeout, $injector) {

            var pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null;

            if (pipTranslate) {
                pipTranslate.setTranslations('en', {
                    OPEN_LOCATION: 'Open location edit dialog',
                    CODE: 'Code',
                    DIALOG: 'Dialog',
                    LOCATION: 'Location',
                    SAMPLES: 'SAMPLES'
                });
                pipTranslate.setTranslations('ru', {
                    OPEN_LOCATION: 'Открыть диалог изменения местонахождения',
                    CODE: 'Пример кода',
                    DIALOG: 'Диалог',
                    LOCATION: 'Местонахождение',
                    SAMPLE: 'Пример'
                });
            }

            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });

            $scope.note = {
                location_name: '780 W. Lost Creek Place, Tucson, AZ 85737',
                location: {
                    type: 'Point',
                    coordinates: [32.393603, -110.982593]
                },
                location1: null,
                location_name1: null
            };

            $scope.locationDisabled = false;
            $scope.ipaddress = '96.17.143.194';
        }
    );

})(window.angular);
