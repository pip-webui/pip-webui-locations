
(function (angular) {
    'use strict';

    var thisModule = angular.module('appLocations.Location');

    thisModule.controller('LocationIpController',
        function ($scope, $timeout, $injector) {

            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });

            $scope.ipaddress = '96.17.143.194';
        }
    );

})(window.angular);
