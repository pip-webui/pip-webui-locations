(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Dialogs', []);

    thisModule.controller('DialogsController',
        function ($scope, pipLocationEditDialog, $timeout, $injector) {

            var pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null;

            if (pipTranslate) {
                pipTranslate.setTranslations('en', {
                    OPEN_LOCATION: 'Open location edit dialog',
                    CODE: 'Code',
                    DIALOG: 'Dialog',
                    LOCATION: 'Location'
                });
                pipTranslate.setTranslations('ru', {
                    OPEN_LOCATION: 'Открыть диалог изменения местонахождения',
                    CODE: 'Пример кода',
                    DIALOG: 'Диалог',
                    LOCATION: 'Местонахождение'                    
                });
            }
            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });
            
            $scope.note = {
                location_name: '780 W. Lost Creek Place, Tucson, AZ 85737',
                location_pos: {
                    'type': 'Point',
                    'coordinates': [32.393603, -110.98259300000001]
                }
            };

            $scope.openLocationEditDialog = function () {
                pipLocationEditDialog.show(
                    {
                        locationName: $scope.note.location_name,
                        locationPos: $scope.note.location_pos
                    },
                    function (result) {
                        console.log('Selected New Location');// eslint-disable-line
                        console.log(result);// eslint-disable-line

                        if (result)
                            $scope.note.location_pos = result.locationPos;
                    }
                );
            };
        }
    );
})(window.angular);
