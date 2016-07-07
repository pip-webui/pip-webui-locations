
(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Location', []);

    thisModule.controller('LocationController',
        function ($scope) {
            $scope.note = {
                location_name: '780 W. Lost Creek Place, Tucson, AZ 85737',
                location: {
                    type: 'Point',
                    coordinates: [32.393603, -110.982593]
                },
                location1: null,
                location_name1: null
            };

            $scope.locationDisabled = true;
            $scope.ipaddress = '96.17.143.194';
        }
    );

})(window.angular);
