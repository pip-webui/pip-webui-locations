/**
 * @file Location map control
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
/* global angular, google */

(function () {
    'use strict';

    var thisModule = angular.module("pipLocationMap", []);

    thisModule.directive('pipLocationMap',
        function () {
            return {
                restrict: 'EA',
                scope: {
                    pipLocationPos: '&',
                    pipLocationPositions: '&',
                    pipIconPath: '&',
                    pipDraggable: '&',
                    pipStretch: '&'
                },
                template: '<div class="pip-location-container"></div>',
                controller: 'pipLocationMapController'
            }
        }
    );

    thisModule.controller('pipLocationMapController',
        ['$scope', '$element', '$attrs', '$parse', function ($scope, $element, $attrs, $parse) {
            var
                $mapContainer = $element.children('.pip-location-container'),
                $mapControl = null,
                stretchMap = $scope.pipStretch() || false,
                iconPath = $scope.pipIconPath();

            function clearMap() {
                // Remove map control
                if ($mapControl) $mapControl.remove();
                $mapControl = null;
            }

            function checkLocation (loc) {
                return !(loc == null
                || loc.coordinates == null
                || loc.coordinates.length < 0);
            }

            function determineCoordinates(loc) {
                var point = new google.maps.LatLng(
                    loc.coordinates[0],
                    loc.coordinates[1]
                );

                point.fill = loc.fill;
                point.stroke = loc.stroke;

                return point;
            }

            function toBoolean(value) {
                if (value == null) return false;
                if (!value) return false;
                value = value.toString().toLowerCase();
                return value == '1' || value == 'true';
            }

            function generateMap() {
                var location = $scope.pipLocationPos(),
                    locations = $scope.pipLocationPositions(),
                    points = [],
                    draggable = $scope.pipDraggable() || false;

                // Safeguard for bad coordinates
                if (checkLocation(location)) {
                    points.push(determineCoordinates(location));
                } else {
                    if (locations && locations.length && locations.length > 0) {
                        locations.forEach(function (loc) {
                            if (checkLocation(loc)) {
                                points.push(determineCoordinates(loc));
                            }
                        });
                    }
                }

                if (points.length === 0) {
                    clearMap();
                    return;
                }

                // Clean up the control
                if ($mapControl) $mapControl.remove();
                $mapControl = $('<div></div>');
                $mapControl.appendTo($mapContainer);

                // Create the map
                var
                    mapOptions = {
                        center: points[0],
                        zoom: 12,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        disableDefaultUI: true,
                        disableDoubleClickZoom: true,
                        scrollwheel: draggable,
                        draggable: draggable
                    },
                    map = new google.maps.Map($mapControl[0], mapOptions),
                    bounds = new google.maps.LatLngBounds();

                // Create markers
                points.forEach(function(point) {
                    var icon = {
                        path: iconPath,
                        fillColor: point.fill || '#EF5350',
                        fillOpacity: 1,
                        scale: 1,
                        strokeColor: point.stroke || 'white',
                        strokeWeight: 5
                    };

                    new google.maps.Marker({
                        position: point,
                        map: map,
                        icon: iconPath ? icon : null
                    });
                    bounds.extend(point);
                });

                // Auto-config of zoom and center
                if (points.length > 1) map.fitBounds(bounds);
            }

            // Watch for location changes
            if (toBoolean($attrs.pipRebind)) {
                $scope.$watch(
                    function () {
                        return $scope.pipLocationPos()
                    },
                    function () {
                        generateMap();
                    }
                );
            }

            // Add class
            $element.addClass('pip-location-map');
            if (stretchMap) $mapContainer.addClass('stretch');

            // Visualize map
            if ($scope.pipLocationPos() || $scope.pipLocationPositions()) generateMap();
            else clearMap();
        }]
    );

})();

