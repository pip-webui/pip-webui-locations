/**
 * @file Location control
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo
 * - Improve samples in sampler app
 */

/* global angular, google */

(function () {
    'use strict';

    var thisModule = angular.module("pipLocation", ['pipUtils']);

    thisModule.directive('pipLocation', 
        function (pipUtils) {
            return {
                restrict: 'EA',
                scope: {
                    pipLocationName: '&',
                    pipLocationPos: '&',
                    pipLocationResize: '&',
                    pipShowLocationIcon: '='
                },
                template: 
                    function($element, $attrs) {
                        if (pipUtils.toBoolean($attrs.pipCollapse)) {
                            return String()
                                + '<div class="pip-location-name bm0" ng-click="pipLocationResize()" ng-hide="!pipLocationName()"'
                                + 'ng-class="pipShowLocationIcon ? \'lp24-flex rp16\' : \'\'">'
                                + '<md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="pipShowLocationIcon"></md-icon>'
                                + '<span class="pip-location-text">{{pipLocationName()}}</span> '
                                + '</div>'
                                + '<div class="pip-location-container bm8" ng-hide="!pipLocationPos()"></div>';
                        } else {
                            return String()
                                + '<md-button class="pip-location-name" ng-click="pipLocationResize()" '
                                + 'ng-class="pipShowLocationIcon ? \'lp24-flex rp16\' : \'\'">'
                                + '<div class="layout-align-start-center layout-row w-stretch">'
                                + '<md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="pipShowLocationIcon"></md-icon>'
                                + '<span class="pip-location-text flex">{{pipLocationName()}}</span>'
                                + '<md-icon md-svg-icon="icons:triangle-down" class="flex-fixed" ng-if="!showMap"></md-icon>'
                                + '<md-icon md-svg-icon="icons:triangle-up" class="flex-fixed" ng-if="showMap"></md-icon>'
                                + '</div></md-button>'
                                + '<div class="pip-location-container bm8"'
                                + 'ng-class="pipShowLocationIcon ? \'lm24-flex rm24-flex\' : \'\'"></div>';
                        }
                    },
                controller: 'pipLocationController'
            }
        }
    );

    thisModule.controller('pipLocationController',
        function ($scope, $element, $attrs, pipUtils) {
            var 
                $name = $element.children('.pip-location-name'),
                $mapContainer = $element.children('.pip-location-container'),
                $mapControl = null,
                $up = $element.find('.icon-up'),
                $down = $element.find('.icon-down'),
                collapsable = pipUtils.toBoolean($attrs.pipCollapse);

            function clearMap() {
                // Remove map control
                if ($mapControl) $mapControl.remove();
                $mapControl = null;
                $mapContainer.hide();
            };

            function generateMap() {
                var location = $scope.pipLocationPos();
                
                // Safeguard for bad coordinates
                if ($scope.showMap == false || location == null
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
                $mapContainer.show();
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

            // Process user actions
            if (!collapsable) {
                $scope.showMap = false;
                $up.hide();
                $mapContainer.hide();

                $name.click(function (event) {
                    event.stopPropagation();
                    if ($attrs.disabled) return;
                    $scope.showMap = !$scope.showMap;
                    $up[$scope.showMap ? 'show' : 'hide']();
                    $down[!$scope.showMap ? 'show' : 'hide']();
                    generateMap();
                });
            }

            // Watch for location changes
            if (pipUtils.toBoolean($attrs.pipRebind)) {
                $scope.$watch($scope.pipLocationPos,
                    function (newValue) {
                        generateMap();
                    }
                );
            }

            // Add class
            $element.addClass('pip-location');

            // Visualize map
            if ($scope.pipLocationPos()) generateMap();
            else clearMap();
        }    
    );

})();
