/**
 * @file Location edit control
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo
 * - Improve samples in sampler app
 */
 
/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module("pipLocationEdit", ['pipLocationEditDialog']);

    thisModule.directive('pipLocationEdit',
        function ($parse, $http, pipLocationEditDialog) {
            return {
                restrict: 'EAC',
                scope: {
                    pipLocationName: '=',
                    pipLocationPos: '=',
                    pipLocationHolder: '=',
                    ngDisabled: '&',
                    pipChanged: '&'
                },
                template: String()
                    + '<md-input-container class="md-block">'
                    + '<label>{{ \'LOCATION\'  }}</label>'
                    + '<input ng-model="pipLocationName"'
                    + 'ng-disabled="ngDisabled()"/></md-input-container>'
                    + '<div class="pip-location-empty" layout="column" layout-align="center center">'
                    + '<md-button class="md-raised" ng-disabled="ngDisabled()" ng-click="onSetLocation()"'
                    + 'aria-label="LOCATION_ADD_LOCATION">'
                    + '<span class="icon-location"></span> {{::\'LOCATION_ADD_LOCATION\' }}'
                    + '</md-button></div>'
                    + '<div class="pip-location-container" tabindex="{{ ngDisabled() ? -1 : 0 }}"'
                    + ' ng-click="onMapClick($event)" ng-keypress=""onMapKeyPress($event)"></div>',
                controller: function ($scope, $element) {
                    $element.find('md-input-container').attr('md-no-float', !!$scope.pipLocationHolder);
                },
                link: function ($scope: any, $element) {
console.log('pipLocationEdit');
                    var 
                        $empty = $element.children('.pip-location-empty'),
                        $mapContainer = $element.children('.pip-location-container'),
                        $mapControl = null;

                    function clearMap() {
                        // Remove map control
                        if ($mapControl) $mapControl.remove();
                        $mapControl = null;

                        // Toggle control visibility
                        $mapContainer.hide();
                        $empty.show();
                    };

                    function generateMap() {
                        // Safeguard for bad coordinates
                        var location = $scope.pipLocationPos;
                        if (location == null || location.coordinates == null || location.coordinates.length < 0) {
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

                        // Toggle control visibility
                        $mapContainer.show();
                        $empty.hide();

                        // Add a new map
                        $mapControl = $('<div></div>');
                        $mapControl.appendTo($mapContainer);

                        // Create the map with point marker
                        var mapOptions = {
                            center: coordinates,
                            zoom: 12,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            disableDefaultUI: true,
                            disableDoubleClickZoom: true,
                            scrollwheel: false,
                            draggable: false
                        };
                        var map = new google.maps.Map($mapControl[0], mapOptions);
                        var marker = new google.maps.Marker({
                            position: coordinates,
                            map: map
                        });
                    };

                    function defineCoordinates() {
                        var locationName = $scope.pipLocationName;

                        if (locationName == '') {
                            $scope.pipLocationPos = null;
                            clearMap();
                            $scope.$apply();
                            return;
                        }

                    //    $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + locationName)
                    //    .success(function (response) { ... })
                    //    .error(function (response) {... });

                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ address: locationName }, function(results, status) {
                            $scope.$apply(function() {
                                // Process response
                                if (status == google.maps.GeocoderStatus.OK) {
                                    // Check for empty results
                                    if (results == null || results.length == 0) {
                                        $scope.pipLocationPos = null;
                                        clearMap();
                                        return;
                                    }

                                    var 
                                        geometry = results[0].geometry || {},
                                        location = geometry.location || {};

                                    // Check for empty results again
                                    if (location.lat == null || location.lng == null) {
                                        $scope.pipLocationPos = null;
                                        clearMap();
                                        return;
                                    }

                                    $scope.pipLocationPos = {
                                        type: 'Point',
                                        coordinates: [
                                            location.lat(),
                                            location.lng()
                                        ]
                                    };

                                    //generateMap();                                
                                } 
                                // Process error...
                                else {
                                    $scope.pipLocationPos = null;
                                    //clearMap();                                
                                }
                            });
                        });

                    };
                    var defineCoordinatesDebounced = _.debounce(defineCoordinates, 2000);

                    // Process user actions
                    
                    $scope.onSetLocation = function() {
                        if ($scope.ngDisabled()) return;
                          
                        pipLocationEditDialog.show(
                            {
                                locationName: $scope.pipLocationName,
                                locationPos: $scope.pipLocationPos
                            },
                            function (result) {
                                var 
                                    location = result.location,
                                    locationName = result.locationName;

                                // Do not change anything if location is about the same
                                if ($scope.pipLocationPos && $scope.pipLocationPos.type == 'Point'
                                    && $scope.pipLocationPos.coordinates.length == 2
                                    && location && location.coordinates.length == 2
                                    && ($scope.pipLocationPos.coordinates[0] - location.coordinates[0]) < 0.0001
                                    && ($scope.pipLocationPos.coordinates[1] - location.coordinates[1]) < 0.0001
                                    && (locationName == $scope.pipLocationName)) {
                                    return;        
                                }

                                $scope.pipLocationPos = location;
                                $scope.pipLocationName = locationName;

                                if (locationName == null && location != null) {
                                    $scope.pipLocationName = 
                                        '(' + result.location.coordinates[0]
                                        + ',' + result.location.coordinates[1] + ')';
                                }
                                $scope.pipChanged();
                                $mapContainer[0].focus();
                            }
                        );
                    };

                    $scope.onMapClick = function ($event) {
                        if ($scope.ngDisabled()) return;

                        $mapContainer[0].focus();
                        $scope.onSetLocation();
                        //$event.stopPropagation();
                    };

                    $scope.onMapKeyPress = function($event) {
                        if ($scope.ngDisabled()) return;

                        if ($event.keyCode == 13 || $event.keyCode == 32) {
                            $scope.onSetLocation();
                            //$event.stopPropagation();
                        }  
                    };

                    // Watch for location name changes
                    $scope.$watch(
                        function () {
                            return $scope.pipLocationName
                        },
                        function (newValue, oldValue) {
                            if (newValue != oldValue)
                                defineCoordinatesDebounced();
                        }
                    );

                    $scope.$watch(
                        function () {
                            return $scope.pipLocationPos
                        },
                        function () {
                            generateMap();
                        }
                    );

                    // Add class
                    $element.addClass('pip-location-edit');

                    // Visualize map
                    if ($scope.pipLocationPos) generateMap();
                    else clearMap();
                }
            }
        }
    );

})();
