/**
 * @file Location map control
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo
 * - Improve samples in sampler app
 */
 
/* global angular, google */

(function () {
    'use strict';

    var thisModule = angular.module("pipLocationMap", ['pipUtils']);

    thisModule.directive('pipLocationMap', 
        function () {
            return {
                restrict: 'EA',
                scope: {
                    pipLocationPos: '&'
                },
                template: '<div class="pip-location-container"></div>',
                controller: 'pipLocationMapController' 
            }
        }
    );

    thisModule.controller('pipLocationMapController',
        function ($scope, $element, $attrs, $parse, pipUtils) {
            var 
                $mapContainer = $element.children('.pip-location-container'),
                $mapControl = null;
    
            function clearMap() {
                // Remove map control
                if ($mapControl) $mapControl.remove();
                $mapControl = null;
            };
    
            function generateMap() {
                var location = $scope.pipLocationPos();
                
                // Safeguard for bad coordinates
                if (location == null
                    || location.coordinates == null
                    || location.coordinates.length < 0) {
                    clearMap();
                    return;
                }
    
                // Determine map coordinates
                var coordinates = new google.maps.LatLng(
                    location.coordinates[0],
                    location.coordinates[1]
                );
    
                // Clean up the control
                if ($mapControl) $mapControl.remove();
                $mapControl = $('<div></div>');
                $mapControl.appendTo($mapContainer);
    
                // Create the map with point marker
                var 
                    mapOptions = {
                        center: coordinates,
                        zoom: 12,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        disableDefaultUI: true,
                        disableDoubleClickZoom: true,
                        scrollwheel: false,
                        draggable: false
                    },
                    map = new google.maps.Map($mapControl[0], mapOptions);
                    
                new google.maps.Marker({
                    position: coordinates,
                    map: map
                });
            };
    
            // Watch for location changes
            if (pipUtils.toBoolean($attrs.pipRebind)) {
                $scope.$watch(
                    function () {
                        return $scope.pipLocationPos()
                    },
                    function (newValue) {
                        generateMap();
                    }
                );
            }
    
            // Add class
            $element.addClass('pip-location-map');
    
            // Visualize map
            if ($scope.pipLocationPos()) generateMap();
            else clearMap();
        }
    );

})();
