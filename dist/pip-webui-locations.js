/**
 * @file Registration of location WebUI controls
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    angular.module('pipLocations', [        
        'pipLocation',
        'pipLocationMap',
        'pipLocationIp',
        'pipLocationEdit',
        'pipLocationEditDialog'
    ]);
    
})();



(function(module) {
try {
  module = angular.module('pipLocations.Templates');
} catch (e) {
  module = angular.module('pipLocations.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location_dialog/location_dialog.html',
    '<!--\n' +
    '@file Location edit dialog content\n' +
    '@copyright Digital Living Software Corp. 2014-2016\n' +
    '-->\n' +
    '\n' +
    '<md-dialog class="pip-dialog pip-location-edit-dialog layout-column"md-theme="{{theme}}">\n' +
    '\n' +
    '    <div class="pip-header layout-column layout-align-start-start">\n' +
    '        <md-progress-linear ng-show="transaction.busy()" md-mode="indeterminate" class="pip-progress-top">\n' +
    '        </md-progress-linear>\n' +
    '        <h3 class="m0 w-stretch flex">{{ \'LOCATION_SET_LOCATION\' | translate }}</h3>\n' +
    '    </div>\n' +
    '    <div class="pip-footer">\n' +
    '        <div class="layout-row layout-align-start-center">\n' +
    '            <md-button class="md-accent" ng-click="onAddPin()" ng-show="locationPos == null"\n' +
    '                ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_ADD_PIN\' | translate }}">\n' +
    '                {{ ::\'LOCATION_ADD_PIN\' | translate }}\n' +
    '            </md-button>\n' +
    '            <md-button class="md-accent" ng-click="onRemovePin()" ng-show="locationPos != null"\n' +
    '                ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_REMOVE_PIN\' | translate }}">\n' +
    '                {{ ::\'LOCATION_REMOVE_PIN\' | translate }}\n' +
    '            </md-button>\n' +
    '        </div>\n' +
    '        <div class="flex"></div>\n' +
    '        <div class="layout-row layout-align-end-center">\n' +
    '            <md-button ng-click="onCancel()" aria-label="{{ ::\'CANCEL\' | translate }}">\n' +
    '                {{ ::\'CANCEL\' | translate }}\n' +
    '            </md-button>\n' +
    '            <md-button class="md-accent" ng-click="onApply()" ng-disabled="transaction.busy()"\n' +
    '                aria-label="{{ ::\'APPLY\' | translate }}">\n' +
    '                {{ ::\'APPLY\' | translate }}\n' +
    '            </md-button>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="pip-body">\n' +
    '        <div class="pip-location-container"></div>\n' +
    '        <md-button class="md-icon-button md-fab pip-zoom-in" ng-click="onZoomIn()"\n' +
    '                   aria-label="{{ ::\'LOCATION_ZOOM_IN\' | translate }}">\n' +
    '            <!--span class="icon-plus"></span-->\n' +
    '            <md-icon md-svg-icon="icons:plus"></md-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button md-fab pip-zoom-out" ng-click="onZoomOut()"\n' +
    '                   aria-label="{{ ::\'LOCATION_ZOOM_OUT\' | translate }}">\n' +
    '            <!--span class="icon-minus"></span-->\n' +
    '            <md-icon md-svg-icon="icons:minus"></md-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button md-fab pip-set-location" ng-click="onSetLocation()"\n' +
    '                   aria-label="{{ ::\'LOCATION_SET_LOCATION\' | translate }}"\n' +
    '                   ng-show="supportSet" ng-disabled="transaction.busy()">\n' +
    '            <!--span class="icon-target"></span-->\n' +
    '            <md-icon md-svg-icon="icons:target"></md-icon>\n' +
    '        </md-button>\n' +
    '    </div>\n' +
    '</md-dialog>\n' +
    '');
}]);
})();

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
        ['pipUtils', function (pipUtils) {
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
        }]
    );

    thisModule.controller('pipLocationController',
        ['$scope', '$element', '$attrs', 'pipUtils', function ($scope, $element, $attrs, pipUtils) {
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
        }]    
    );

})();

/**
 * @file Location edit dialog
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo
 * - Improve sample in sampler app
 */
 
/* global angular, google */

(function () {
    'use strict';

    var thisModule = angular.module('pipLocationEditDialog', 
        ['ngMaterial', 'pipTranslate', 'pipTransactions', 'pipLocations.Templates']);

    thisModule.config(['pipTranslateProvider', function(pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'LOCATION_ADD_LOCATION': 'Add location',
            'LOCATION_SET_LOCATION': 'Set location',
            'LOCATION_ADD_PIN': 'Add pin',
            'LOCATION_REMOVE_PIN': 'Remove pin'
        });
        pipTranslateProvider.translations('ru', {
            'LOCATION_ADD_LOCATION': 'Добавить местоположение',
            'LOCATION_SET_LOCATION': 'Определить положение',
            'LOCATION_ADD_PIN': 'Добавить точку',
            'LOCATION_REMOVE_PIN': 'Убрать точку'
        });
    }]);

    thisModule.factory('pipLocationEditDialog',
        ['$mdDialog', function ($mdDialog) {
            return {
                show: function (params, successCallback, cancelCallback) {
                    $mdDialog.show({
                        controller: 'pipLocationEditDialogController',
                        templateUrl: 'location_dialog/location_dialog.html',
                        locals: {
                            locationName: params.locationName,
                            locationPos: params.locationPos
                        },
                        clickOutsideToClose: true
                    })
                    .then(function (result) {
                        if (successCallback) {
                            successCallback(result);
                        }
                    }, function () {
                        if (cancelCallback) {
                            cancelCallback();
                        }
                    });
                }
            };
        }]
    );

    thisModule.controller('pipLocationEditDialogController', 
        ['$scope', '$rootScope', '$timeout', '$mdDialog', 'pipTransaction', 'locationPos', 'locationName', function ($scope, $rootScope, $timeout, $mdDialog, pipTransaction, locationPos, locationName) {
            $scope.theme = $rootScope.$theme;
            $scope.locationPos = locationPos && locationPos.type == 'Point'
                && locationPos.coordinates && locationPos.coordinates.length == 2
                ? locationPos : null;
            $scope.locationName = locationName;
            $scope.supportSet = navigator.geolocation != null;

            $scope.transaction = pipTransaction('location_edit_dialog', $scope);

            var map = null, marker = null;

            var createMarker = function(coordinates) {
                if (marker) marker.setMap(null);
                
                if (coordinates) {
                    marker = new google.maps.Marker({ 
                        position: coordinates, 
                        map: map,
                        draggable: true,
                        animation: google.maps.Animation.DROP
                    });

                    var thisMarker = marker;
                    google.maps.event.addListener(thisMarker, 'dragend', function() {
                       var coordinates = thisMarker.getPosition(); 
                       changeLocation(coordinates);
                    });
                } else {
                    marker = null;
                }

                return marker;
            };

            var changeLocation = function(coordinates, tid) {
                $scope.locationPos = {
                    type: 'Point',
                    coordinates: [coordinates.lat(), coordinates.lng()]
                };
                $scope.locationName = null;

                if (tid == null) {
                    tid = $scope.transaction.begin();
                    if (tid == null) return;
                }

                // Read address
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: coordinates }, function(results, status) {
                    if ($scope.transaction.aborted(tid)) return;

                    // Process positive response
                    if (status == google.maps.GeocoderStatus.OK
                        && results && results.length > 0) {
                        $scope.locationName = results[0].formatted_address;
                    }

                    $scope.transaction.end();
                    $scope.$apply();
                });
            };

            // Wait until dialog is initialized
            $timeout(function () {
                var mapContainer = $('.pip-location-edit-dialog .pip-location-container');

                // Calculate coordinate of the center
                var coordinates = $scope.locationPos ?
                    new google.maps.LatLng(
                        $scope.locationPos.coordinates[0],
                        $scope.locationPos.coordinates[1]
                    ) : null;

                // Create the map with point marker
                var mapOptions = {
                    center: new google.maps.LatLng(0, 0),
                    zoom: 1,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                };
                if (coordinates != null) {
                    mapOptions.center = coordinates;
                    mapOptions.zoom = 12;
                }

                map = new google.maps.Map(mapContainer[0], mapOptions);
                marker = createMarker(coordinates);

                // Fix resizing issue
                setTimeout(function () {
                    google.maps.event.trigger(map, 'resize');
                }, 1000);
            }, 0);

            $scope.$on('pipLayoutResized', function (event) {
                if (map == null) return;
                google.maps.event.trigger(map, 'resize');
            });

            $scope.onAddPin = function () {
                if (map == null) return;

                var coordinates = map.getCenter();
                marker = createMarker(coordinates);
                changeLocation(coordinates);
            };

            $scope.onRemovePin = function () {
                if (map == null) return;
                marker = createMarker(null);
                $scope.locationPos = null;
                $scope.locationName = null;
            };

            $scope.onZoomIn = function () {
                if (map == null) return;
                var zoom = map.getZoom();
                map.setZoom(zoom + 1);
            };

            $scope.onZoomOut = function () {
                if (map == null) return;
                var zoom = map.getZoom();
                map.setZoom(zoom > 1 ? zoom - 1 : zoom);
            };

            $scope.onSetLocation = function () {
                if (map == null) return;

                var tid = $scope.transaction.begin();
                if (tid == null) return;

                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        if ($scope.transaction.aborted(tid)) return;

                        var coordinates = new google.maps.LatLng(
                            position.coords.latitude, position.coords.longitude);

                        marker = createMarker(coordinates);
                        map.setCenter(coordinates);
                        map.setZoom(12);

                        changeLocation(coordinates, tid);
                    },
                    function () {
                        $scope.transaction.end();
                        $scope.$apply();
                    },
                    {
                        maximumAge: 0,
                        enableHighAccuracy: true,
                        timeout: 5000
                    }
                );
            };

            $scope.onCancel = function () {
                $mdDialog.cancel();
            };

            $scope.onApply = function () {
                $mdDialog.hide({
                    location: $scope.locationPos,
                    locationPos: $scope.locationPos,
                    locationName: $scope.locationName   
                });
            };
        }]
    );

})();

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
        ['$parse', '$http', 'pipLocationEditDialog', function ($parse, $http, pipLocationEditDialog) {
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
                    + '<label>{{ \'LOCATION\' | translate }}</label>'
                    + '<input ng-model="pipLocationName"'
                    + 'ng-disabled="ngDisabled()"/></md-input-container>'
                    + '<div class="pip-location-empty" layout="column" layout-align="center center">'
                    + '<md-button class="md-raised" ng-disabled="ngDisabled()" ng-click="onSetLocation()"'
                    + 'aria-label="LOCATION_ADD_LOCATION">'
                    + '<span class="icon-location"></span> {{::\'LOCATION_ADD_LOCATION\' | translate}}'
                    + '</md-button></div>'
                    + '<div class="pip-location-container" tabindex="{{ ngDisabled() ? -1 : 0 }}"'
                    + ' ng-click="onMapClick($event)" ng-keypress=""onMapKeyPress($event)"></div>',
                controller: ['$scope', '$element', function ($scope, $element) {
                    $element.find('md-input-container').attr('md-no-float', !!$scope.pipLocationHolder);
                }],
                link: function ($scope, $element) {

                    var 
                        $empty = $element.children('.pip-location-empty'),
                        $mapContainer = $element.children('.pip-location-container'),
                        $mapControl = null;

                    var clearMap = function () {
                        // Remove map control
                        if ($mapControl) $mapControl.remove();
                        $mapControl = null;

                        // Toggle control visibility
                        $mapContainer.hide();
                        $empty.show();
                    };

                    var generateMap = function () {
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

                    var defineCoordinates = function () {
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
                                    console.error(response);
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
        }]
    );

})();

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
        ['$scope', '$element', '$attrs', '$http', 'pipUtils', function ($scope, $element, $attrs, $http, pipUtils) {
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
        }]        
    );

})();


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
        ['$scope', '$element', '$attrs', '$parse', 'pipUtils', function ($scope, $element, $attrs, $parse, pipUtils) {
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
        }]
    );

})();


//# sourceMappingURL=pip-webui-locations.js.map
