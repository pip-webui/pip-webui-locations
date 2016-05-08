/**
 * @file Location IP control
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo
 * - Improve samples in sampler app
 */
 
/* global angular, google */

(function () {
    'use strict';

    var thisModule = angular.module("pipLocationIp", ['pipUtils']);

    thisModule.directive('pipLocationIp',
        function () {
            return {
                restrict: 'EA',
                scope: {
                    pipIpaddress: '&',
                    pipExtraInfo: '&'
                },
                template: '<div class="pip-location-container"></div>',
                controller: 'pipLocationIpController'
            }
        }
    );

    thisModule.controller('pipLocationIpController',
        function ($scope, $element, $attrs, $http, pipUtils) {
            var 
                $mapContainer = $element.children('.pip-location-container'),
                $mapControl = null;

            function clearMap() {
                // Remove map control
                if ($mapControl) $mapControl.remove();
                $mapControl = null;
            };

            function generateMap(latitude, longitude) {
                // Safeguard for bad coordinates
                if (latitude == null || longitude == null) {
                    clearMap();
                    return;
                }

                // Determine map coordinates
                var coordinates = new google.maps.LatLng(
                    latitude,
                    longitude
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

            function defineCoordinates() {
                var ipAddress = $scope.pipIpaddress();

                if (ipAddress == '') {
                    clearMap();
                    return;
                }

                // Todo: Find more reliable geocoding service to locate ip addresses
                $http.jsonp('http://www.geoplugin.net/json.gp?ip=' + ipAddress + '&jsoncallback=JSON_CALLBACK')
                .success(function (response) {
                    if (response != null 
                        && response.geoplugin_latitude != null
                        && response.geoplugin_longitude != null) {
                        
                        generateMap(response.geoplugin_latitude, response.geoplugin_longitude);

                        if ($scope.pipExtraInfo) {
                            var extraInfo = {
                                city: response.geoplugin_city,  
                                regionCode: response.geoplugin_regionCode,  
                                region: response.geoplugin_regionName,  
                                areaCode: response.geoplugin_areaCode,  
                                countryCode: response.geoplugin_countryCode,  
                                country: response.geoplugin_countryName,  
                                continentCode: response.geoplugin_continentCode
                            };
                            $scope.pipExtraInfo({ extraInfo: extraInfo });
                        }
                    } else {
                        clearMap();
                    }
                })
                .error(function (response) {
                    console.error(response);
                    clearMap();
                });
            };

            // Watch for location changes
            if (pipUtils.toBoolean($attrs.pipRebind)) {
                $scope.$watch(
                    function () {
                        return $scope.pipIpaddress()
                    },
                    function (newValue) {
                        defineCoordinates();
                    }
                );
            }

            // Add class
            $element.addClass('pip-location-ip');

            // Visualize map
            defineCoordinates();
        }        
    );

})();

