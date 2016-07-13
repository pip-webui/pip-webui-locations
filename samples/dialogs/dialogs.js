(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Dialogs', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            OPEN_LOCATION: 'Open location edit dialog'
        });
        pipTranslateProvider.translations('ru', {
            OPEN_LOCATION: 'Открыть диалог изменения местонахождения'
        });
    });

    thisModule.controller('DialogsController',
        function ($scope, pipLocationEditDialog, pipAppBar) {

            pipAppBar.hideShadow();
            pipAppBar.showMenuNavIcon();
            pipAppBar.showLanguage();
            pipAppBar.showTitleText('LOCATION_CONTROLS');
            
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
