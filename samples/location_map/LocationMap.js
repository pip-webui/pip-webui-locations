
(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Location');

    thisModule.controller('LocationMapController',
        function ($scope, $timeout, $injector) {

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
        }
    );

})(window.angular);
