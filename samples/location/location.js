
(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Location', []);

    thisModule.controller('LocationController',
        function ($scope, $timeout) {
console.log('LocationController');
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
