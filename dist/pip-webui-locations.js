(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).locations = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
    'use strict';
    var thisModule = angular.module('pipLocations.Translate', []);
    thisModule.filter('translate', ['$injector', function ($injector) {
        var pipTranslate = $injector.has('pipTranslate')
            ? $injector.get('pipTranslate') : null;
        return function (key) {
            return pipTranslate ? pipTranslate.translate(key) || key : key;
        };
    }]);
})();
},{}],2:[function(require,module,exports){
(function () {
    'use strict';
    var thisModule = angular.module("pipLocation", []);
    thisModule.directive('pipLocation', function () {
        return {
            restrict: 'EA',
            scope: {
                pipLocationName: '&',
                pipLocationPos: '&',
                pipLocationResize: '&',
                pipShowLocationIcon: '='
            },
            template: function ($element, $attrs) {
                function toBoolean(value) {
                    if (value == null)
                        return false;
                    if (!value)
                        return false;
                    value = value.toString().toLowerCase();
                    return value == '1' || value == 'true';
                }
                if (toBoolean($attrs.pipCollapse)) {
                    return String()
                        + '<div class="pip-location-name location-collapse" ng-click="pipLocationResize()" ng-hide="!pipLocationName()"'
                        + 'ng-class="pipShowLocationIcon ? \'pip-location-icon-space\' : \'\'">'
                        + '<md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="pipShowLocationIcon"></md-icon>'
                        + '<span class="pip-location-text">{{pipLocationName()}}</span> '
                        + '</div>'
                        + '<div class="pip-location-container" ng-hide="!pipLocationPos()"></div>';
                }
                else {
                    return String()
                        + '<md-button class="pip-location-name" ng-click="pipLocationResize()" '
                        + 'ng-class="pipShowLocationIcon ? \'pip-location-icon-space\' : \'\'">'
                        + '<div class="layout-align-start-center layout-row w-stretch">'
                        + '<md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="pipShowLocationIcon"></md-icon>'
                        + '<span class="pip-location-text flex">{{pipLocationName()}}</span>'
                        + '<md-icon md-svg-icon="icons:triangle-down" class="flex-fixed" ng-if="!showMap"></md-icon>'
                        + '<md-icon md-svg-icon="icons:triangle-up" class="flex-fixed" ng-if="showMap"></md-icon>'
                        + '</div></md-button>'
                        + '<div class="pip-location-container"'
                        + 'ng-class="pipShowLocationIcon ? \'pip-location-icon-space\' : \'\'"></div>';
                }
            },
            controller: 'pipLocationController'
        };
    });
    thisModule.controller('pipLocationController', ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        function toBoolean(value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        }
        var $name = $element.children('.pip-location-name'), $mapContainer = $element.children('.pip-location-container'), $mapControl = null, $up = $element.find('.icon-up'), $down = $element.find('.icon-down'), collapsable = toBoolean($attrs.pipCollapse);
        function clearMap() {
            if ($mapControl)
                $mapControl.remove();
            $mapControl = null;
            $mapContainer.hide();
        }
        ;
        function generateMap() {
            var location = $scope.pipLocationPos();
            if ($scope.showMap == false || location == null
                || location.coordinates == null
                || location.coordinates.length < 0) {
                clearMap();
                return;
            }
            var coordinates = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
            if ($mapControl)
                $mapControl.remove();
            $mapControl = $('<div></div>');
            $mapContainer.show();
            $mapControl.appendTo($mapContainer);
            var mapOptions = {
                center: coordinates,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggable: false
            }, map = new google.maps.Map($mapControl[0], mapOptions);
            new google.maps.Marker({
                position: coordinates,
                map: map
            });
        }
        ;
        if (!collapsable) {
            $scope.showMap = false;
            $up.hide();
            $mapContainer.hide();
            $name.click(function (event) {
                event.stopPropagation();
                if ($attrs.disabled)
                    return;
                $scope.showMap = !$scope.showMap;
                $up[$scope.showMap ? 'show' : 'hide']();
                $down[!$scope.showMap ? 'show' : 'hide']();
                generateMap();
            });
        }
        if (toBoolean($attrs.pipRebind)) {
            $scope.$watch($scope.pipLocationPos, function (newValue) {
                generateMap();
            });
        }
        $element.addClass('pip-location');
        if ($scope.pipLocationPos())
            generateMap();
        else
            clearMap();
    }]);
})();
},{}],3:[function(require,module,exports){
(function () {
    'use strict';
    var thisModule = angular.module('pipLocationEditDialog', ['ngMaterial', 'pipLocations.Templates']);
    thisModule.run(['$injector', function ($injector) {
        var pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null;
        if (pipTranslate) {
            pipTranslate.setTranslations('en', {
                'LOCATION_ADD_LOCATION': 'Add location',
                'LOCATION_SET_LOCATION': 'Set location',
                'LOCATION_ADD_PIN': 'Add pin',
                'LOCATION_REMOVE_PIN': 'Remove pin'
            });
            pipTranslate.setTranslations('ru', {
                'LOCATION_ADD_LOCATION': 'Добавить местоположение',
                'LOCATION_SET_LOCATION': 'Определить положение',
                'LOCATION_ADD_PIN': 'Добавить точку',
                'LOCATION_REMOVE_PIN': 'Убрать точку'
            });
        }
    }]);
    thisModule.factory('pipLocationEditDialog', ['$mdDialog', function ($mdDialog) {
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
    }]);
    thisModule.controller('pipLocationEditDialogController', ['$scope', '$rootScope', '$timeout', '$mdDialog', 'locationPos', 'locationName', function ($scope, $rootScope, $timeout, $mdDialog, locationPos, locationName) {
        $scope.theme = $rootScope.$theme;
        $scope.locationPos = locationPos && locationPos.type == 'Point'
            && locationPos.coordinates && locationPos.coordinates.length == 2
            ? locationPos : null;
        $scope.locationName = locationName;
        $scope.supportSet = navigator.geolocation != null;
        var map = null, marker = null;
        function createMarker(coordinates) {
            if (marker)
                marker.setMap(null);
            if (coordinates) {
                marker = new google.maps.Marker({
                    position: coordinates,
                    map: map,
                    draggable: true,
                    animation: google.maps.Animation.DROP
                });
                var thisMarker = marker;
                google.maps.event.addListener(thisMarker, 'dragend', function () {
                    var coordinates = thisMarker.getPosition();
                    changeLocation(coordinates, null);
                });
            }
            else {
                marker = null;
            }
            return marker;
        }
        ;
        function changeLocation(coordinates, tid) {
            $scope.locationPos = {
                type: 'Point',
                coordinates: [coordinates.lat(), coordinates.lng()]
            };
            $scope.locationName = null;
            if (tid == null) {
                if (tid == null)
                    return;
            }
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: coordinates }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK
                    && results && results.length > 0) {
                    $scope.locationName = results[0].formatted_address;
                }
                $scope.$apply();
            });
        }
        ;
        $timeout(function () {
            var mapContainer = $('.pip-location-edit-dialog .pip-location-container');
            var coordinates = $scope.locationPos ?
                new google.maps.LatLng($scope.locationPos.coordinates[0], $scope.locationPos.coordinates[1]) : null;
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
            setTimeout(function () {
                google.maps.event.trigger(map, 'resize');
            }, 1000);
        }, 0);
        $scope.$on('pipLayoutResized', function (event) {
            if (map == null)
                return;
            google.maps.event.trigger(map, 'resize');
        });
        $scope.onAddPin = function () {
            if (map == null)
                return;
            var coordinates = map.getCenter();
            marker = createMarker(coordinates);
            changeLocation(coordinates, null);
        };
        $scope.onRemovePin = function () {
            if (map == null)
                return;
            marker = createMarker(null);
            $scope.locationPos = null;
            $scope.locationName = null;
        };
        $scope.onZoomIn = function () {
            if (map == null)
                return;
            var zoom = map.getZoom();
            map.setZoom(zoom + 1);
        };
        $scope.onZoomOut = function () {
            if (map == null)
                return;
            var zoom = map.getZoom();
            map.setZoom(zoom > 1 ? zoom - 1 : zoom);
        };
        $scope.onSetLocation = function () {
            if (map == null)
                return;
            navigator.geolocation.getCurrentPosition(function (position) {
                var coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                marker = createMarker(coordinates);
                map.setCenter(coordinates);
                map.setZoom(12);
            }, function () {
                $scope.$apply();
            }, {
                maximumAge: 0,
                enableHighAccuracy: true,
                timeout: 5000
            });
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
    }]);
})();
},{}],4:[function(require,module,exports){
(function () {
    'use strict';
    var thisModule = angular.module("pipLocationEdit", ['pipLocationEditDialog']);
    thisModule.directive('pipLocationEdit', ['$parse', '$http', 'pipLocationEditDialog', function ($parse, $http, pipLocationEditDialog) {
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
                + '<span class="icon-location"></span> {{::\'LOCATION_ADD_LOCATION\' | translate }}'
                + '</md-button></div>'
                + '<div class="pip-location-container" tabindex="{{ ngDisabled() ? -1 : 0 }}"'
                + ' ng-click="onMapClick($event)" ng-keypress=""onMapKeyPress($event)"></div>',
            controller: ['$scope', '$element', function ($scope, $element) {
                $element.find('md-input-container').attr('md-no-float', !!$scope.pipLocationHolder);
            }],
            link: function ($scope, $element) {
                var $empty = $element.children('.pip-location-empty'), $mapContainer = $element.children('.pip-location-container'), $mapControl = null;
                function clearMap() {
                    if ($mapControl)
                        $mapControl.remove();
                    $mapControl = null;
                    $mapContainer.hide();
                    $empty.show();
                }
                ;
                function generateMap() {
                    var location = $scope.pipLocationPos;
                    if (location == null || location.coordinates == null || location.coordinates.length < 0) {
                        clearMap();
                        return;
                    }
                    var coordinates = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
                    if ($mapControl)
                        $mapControl.remove();
                    $mapContainer.show();
                    $empty.hide();
                    $mapControl = $('<div></div>');
                    $mapControl.appendTo($mapContainer);
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
                }
                ;
                function defineCoordinates() {
                    var locationName = $scope.pipLocationName;
                    if (locationName == '') {
                        $scope.pipLocationPos = null;
                        clearMap();
                        $scope.$apply();
                        return;
                    }
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: locationName }, function (results, status) {
                        $scope.$apply(function () {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results == null || results.length == 0) {
                                    $scope.pipLocationPos = null;
                                    clearMap();
                                    return;
                                }
                                var geometry = results[0].geometry || {}, location = geometry.location || {};
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
                            }
                            else {
                                $scope.pipLocationPos = null;
                            }
                        });
                    });
                }
                ;
                var defineCoordinatesDebounced = _.debounce(defineCoordinates, 2000);
                $scope.onSetLocation = function () {
                    if ($scope.ngDisabled())
                        return;
                    pipLocationEditDialog.show({
                        locationName: $scope.pipLocationName,
                        locationPos: $scope.pipLocationPos
                    }, function (result) {
                        var location = result.location, locationName = result.locationName;
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
                    });
                };
                $scope.onMapClick = function ($event) {
                    if ($scope.ngDisabled())
                        return;
                    $mapContainer[0].focus();
                    $scope.onSetLocation();
                };
                $scope.onMapKeyPress = function ($event) {
                    if ($scope.ngDisabled())
                        return;
                    if ($event.keyCode == 13 || $event.keyCode == 32) {
                        $scope.onSetLocation();
                    }
                };
                $scope.$watch(function () {
                    return $scope.pipLocationName;
                }, function (newValue, oldValue) {
                    if (newValue != oldValue)
                        defineCoordinatesDebounced();
                });
                $scope.$watch(function () {
                    return $scope.pipLocationPos;
                }, function () {
                    generateMap();
                });
                $element.addClass('pip-location-edit');
                if ($scope.pipLocationPos)
                    generateMap();
                else
                    clearMap();
            }
        };
    }]);
})();
},{}],5:[function(require,module,exports){
(function () {
    'use strict';
    var thisModule = angular.module("pipLocationIp", []);
    thisModule.directive('pipLocationIp', function () {
        return {
            restrict: 'EA',
            scope: {
                pipIpaddress: '&',
                pipExtraInfo: '&'
            },
            template: '<div class="pip-location-container"></div>',
            controller: 'pipLocationIpController'
        };
    });
    thisModule.controller('pipLocationIpController', ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {
        var $mapContainer = $element.children('.pip-location-container'), $mapControl = null;
        function clearMap() {
            if ($mapControl)
                $mapControl.remove();
            $mapControl = null;
        }
        function generateMap(latitude, longitude) {
            if (latitude == null || longitude == null) {
                clearMap();
                return;
            }
            var coordinates = new google.maps.LatLng(latitude, longitude);
            if ($mapControl)
                $mapControl.remove();
            $mapControl = $('<div></div>');
            $mapControl.appendTo($mapContainer);
            var mapOptions = {
                center: coordinates,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggable: false
            }, map = new google.maps.Map($mapControl[0], mapOptions);
            new google.maps.Marker({
                position: coordinates,
                map: map
            });
        }
        function toBoolean(value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        }
        function defineCoordinates() {
            var ipAddress = $scope.pipIpaddress();
            if (ipAddress == '') {
                clearMap();
                return;
            }
            $http.jsonp('https://www.geoplugin.net/json.gp?ip=' + ipAddress + '&jsoncallback=JSON_CALLBACK')
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
                }
                else {
                    clearMap();
                }
            })
                .error(function (response) {
                console.error(response);
                clearMap();
            });
        }
        if (toBoolean($attrs.pipRebind)) {
            $scope.$watch(function () {
                return $scope.pipIpaddress();
            }, function (newValue) {
                defineCoordinates();
            });
        }
        $element.addClass('pip-location-ip');
        defineCoordinates();
    }]);
})();
},{}],6:[function(require,module,exports){
(function () {
    'use strict';
    var thisModule = angular.module("pipLocationMap", []);
    thisModule.directive('pipLocationMap', function () {
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
        };
    });
    thisModule.controller('pipLocationMapController', ['$scope', '$element', '$attrs', '$parse', '$timeout', function ($scope, $element, $attrs, $parse, $timeout) {
            var $mapContainer = $element.children('.pip-location-container'), $mapControl = null, stretchMap = $scope.pipStretch() || false, iconPath = $scope.pipIconPath();
            function clearMap() {
                if ($mapControl)
                    $mapControl.remove();
                $mapControl = null;
            }
            function checkLocation(loc) {
                return !(loc == null
                    || loc.coordinates == null
                    || loc.coordinates.length < 0);
            }
            function determineCoordinates(loc) {
                var point = new google.maps.LatLng(loc.coordinates[0], loc.coordinates[1]);
                point.fill = loc.fill;
                point.stroke = loc.stroke;
                return point;
            }
            function toBoolean(value) {
                if (value == null)
                    return false;
                if (!value)
                    return false;
                value = value.toString().toLowerCase();
                return value == '1' || value == 'true';
            }
            function generateMap() {
                var location = $scope.pipLocationPos(), locations = $scope.pipLocationPositions(), points = [], draggable = $scope.pipDraggable() || false;
                if (checkLocation(location)) {
                    points.push(determineCoordinates(location));
                }
                else {
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
                if ($mapControl)
                    $mapControl.remove();
                $mapControl = $('<div></div>');
                $mapControl.appendTo($mapContainer);
                var mapOptions = {
                    center: points[0],
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                    disableDoubleClickZoom: true,
                    scrollwheel: draggable,
                    draggable: draggable
                }, map = new google.maps.Map($mapControl[0], mapOptions), bounds = new google.maps.LatLngBounds();
                points.forEach(function (point) {
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
                if (points.length > 1)
                    map.fitBounds(bounds);
            }
            if (toBoolean($attrs.pipRebind)) {
                $scope.$watch(function () {
                    return $scope.pipLocationPos();
                }, function () {
                    generateMap();
                });
            }
            $element.addClass('pip-location-map');
            if (stretchMap)
                $mapContainer.addClass('stretch');
            if ($scope.pipLocationPos() || $scope.pipLocationPositions())
                $timeout(generateMap, 200);
            else
                clearMap();
        }]);
})();
},{}],7:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipLocations', [
        'pipLocation',
        'pipLocationMap',
        'pipLocationIp',
        'pipLocationEditDialog',
        'pipLocationEdit',
        'pipLocations.Translate'
    ]);
})();
},{}],8:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipLocations.Templates');
} catch (e) {
  module = angular.module('pipLocations.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location_dialog/location_dialog.html',
    '<md-dialog class="pip-dialog pip-location-edit-dialog layout-column" md-theme="{{theme}}"><div class="pip-header layout-column layout-align-start-start"><md-progress-linear ng-show="transaction.busy()" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h3 class="flex">{{ \'LOCATION_SET_LOCATION\' | translate }}</h3></div><div class="pip-footer"><div class="layout-row layout-align-start-center"><md-button class="md-accent" ng-click="onAddPin()" ng-show="locationPos == null" ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_ADD_PIN\' }}">{{ ::\'LOCATION_ADD_PIN\' | translate }}</md-button><md-button class="md-accent" ng-click="onRemovePin()" ng-show="locationPos != null" ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_REMOVE_PIN\' }}">{{ ::\'LOCATION_REMOVE_PIN\' | translate }}</md-button></div><div class="flex"></div><div class="layout-row layout-align-end-center"><md-button ng-click="onCancel()" aria-label="{{ ::\'CANCEL\' }}">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="onApply()" ng-disabled="transaction.busy()" aria-label="{{ ::\'APPLY\' }}">{{ ::\'APPLY\' | translate }}</md-button></div></div><div class="pip-body"><div class="pip-location-container"></div><md-button class="md-icon-button md-fab pip-zoom-in" ng-click="onZoomIn()" aria-label="{{ ::\'LOCATION_ZOOM_IN\' }}"><md-icon md-svg-icon="icons:plus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-zoom-out" ng-click="onZoomOut()" aria-label="{{ ::\'LOCATION_ZOOM_OUT\' }}"><md-icon md-svg-icon="icons:minus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-set-location" ng-click="onSetLocation()" aria-label="{{ ::\'LOCATION_SET_LOCATION\' }}" ng-show="supportSet" ng-disabled="transaction.busy()"><md-icon md-svg-icon="icons:target"></md-icon></md-button></div></md-dialog>');
}]);
})();



},{}]},{},[8,1,3,4,5,6,2,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2VkaXQvbG9jYXRpb25fZWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9sb2NhdGlvbl9pcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvbG9jYXRpb25fbWFwLnRzIiwic3JjL2xvY2F0aW9ucy50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0VBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlELFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsU0FBUztRQUM5QyxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztjQUMxQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUUzQyxNQUFNLENBQUMsVUFBVSxHQUFHO1lBQ2hCLE1BQU0sQ0FBQyxZQUFZLEdBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3BFLENBQUMsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNQTCxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbkQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQzlCO1FBQ0ks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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRyYW5zbGF0ZScsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmZpbHRlcigndHJhbnNsYXRlJywgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgIHZhciBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGUnKSBcclxuICAgICAgICAgICAgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGUnKSA6IG51bGw7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXBUcmFuc2xhdGUgID8gcGlwVHJhbnNsYXRlLnRyYW5zbGF0ZShrZXkpIHx8IGtleSA6IGtleTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKCk7XHJcblxyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gY29udHJvbFxyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKiBAdG9kb1xyXG4gKiAtIEltcHJvdmUgc2FtcGxlcyBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuXHJcbi8qIGdsb2JhbCBhbmd1bGFyLCBnb29nbGUgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uXCIsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb24nLCBcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25OYW1lOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Qb3M6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblJlc2l6ZTogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246ICc9J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigkZWxlbWVudCwgJGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwQ29sbGFwc2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWUgbG9jYXRpb24tY29sbGFwc2VcIiBuZy1jbGljaz1cInBpcExvY2F0aW9uUmVzaXplKClcIiBuZy1oaWRlPVwiIXBpcExvY2F0aW9uTmFtZSgpXCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpsb2NhdGlvblwiIGNsYXNzPVwiZmxleC1maXhlZCBwaXAtaWNvblwiIG5nLWlmPVwicGlwU2hvd0xvY2F0aW9uSWNvblwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dFwiPnt7cGlwTG9jYXRpb25OYW1lKCl9fTwvc3Bhbj4gJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiIG5nLWhpZGU9XCIhcGlwTG9jYXRpb25Qb3MoKVwiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtYnV0dG9uIGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWVcIiBuZy1jbGljaz1cInBpcExvY2F0aW9uUmVzaXplKClcIiAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgbGF5b3V0LXJvdyB3LXN0cmV0Y2hcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpsb2NhdGlvblwiIGNsYXNzPVwiZmxleC1maXhlZCBwaXAtaWNvblwiIG5nLWlmPVwicGlwU2hvd0xvY2F0aW9uSWNvblwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dCBmbGV4XCI+e3twaXBMb2NhdGlvbk5hbWUoKX19PC9zcGFuPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLWRvd25cIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1pZj1cIiFzaG93TWFwXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLXVwXCIgY2xhc3M9XCJmbGV4LWZpeGVkXCIgbmctaWY9XCJzaG93TWFwXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj48L21kLWJ1dHRvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICduZy1jbGFzcz1cInBpcFNob3dMb2NhdGlvbkljb24gPyBcXCdwaXAtbG9jYXRpb24taWNvbi1zcGFjZVxcJyA6IFxcJ1xcJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb250cm9sbGVyKCdwaXBMb2NhdGlvbkNvbnRyb2xsZXInLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICcxJyB8fCB2YWx1ZSA9PSAndHJ1ZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICRuYW1lID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpLFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgJHVwID0gJGVsZW1lbnQuZmluZCgnLmljb24tdXAnKSxcclxuICAgICAgICAgICAgICAgICRkb3duID0gJGVsZW1lbnQuZmluZCgnLmljb24tZG93bicpLFxyXG4gICAgICAgICAgICAgICAgY29sbGFwc2FibGUgPSB0b0Jvb2xlYW4oJGF0dHJzLnBpcENvbGxhcHNlKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9ICRzY29wZS5waXBMb2NhdGlvblBvcygpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5zaG93TWFwID09IGZhbHNlIHx8IGxvY2F0aW9uID09IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyB1c2VyIGFjdGlvbnNcclxuICAgICAgICAgICAgaWYgKCFjb2xsYXBzYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNob3dNYXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICR1cC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkbmFtZS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGF0dHJzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dNYXAgPSAhJHNjb3BlLnNob3dNYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgJHVwWyRzY29wZS5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRkb3duWyEkc2NvcGUuc2hvd01hcCA/ICdzaG93JyA6ICdoaWRlJ10oKTtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFdhdGNoIGZvciBsb2NhdGlvbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIGlmICh0b0Jvb2xlYW4oJGF0dHJzLnBpcFJlYmluZCkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJHNjb3BlLnBpcExvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MoKSkgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgZWxzZSBjbGVhck1hcCgpO1xyXG4gICAgICAgIH0gICAgXHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlIExvY2F0aW9uIGVkaXQgZGlhbG9nXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGUgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIsIGdvb2dsZSAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLCBcclxuICAgICAgICBbJ25nTWF0ZXJpYWwnLCAgJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5ydW4oZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgIHZhciBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGUnKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICBwaXBUcmFuc2xhdGUuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfTE9DQVRJT04nOiAnQWRkIGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9TRVRfTE9DQVRJT04nOiAnU2V0IGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfUElOJzogJ0FkZCBwaW4nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAnUmVtb3ZlIHBpbidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICfQlNC+0LHQsNCy0LjRgtGMINC80LXRgdGC0L7Qv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICfQntC/0YDQtdC00LXQu9C40YLRjCDQv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAn0JTQvtCx0LDQstC40YLRjCDRgtC+0YfQutGDJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ9Cj0LHRgNCw0YLRjCDRgtC+0YfQutGDJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgdGhpc01vZHVsZS5mYWN0b3J5KCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkbWREaWFsb2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogcGFyYW1zLmxvY2F0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiBwYXJhbXMubG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2socmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmNlbENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXInLCBcclxuICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgJG1kRGlhbG9nLCAgbG9jYXRpb25Qb3MsIGxvY2F0aW9uTmFtZSkge1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnRoZW1lID0gJHJvb3RTY29wZS4kdGhlbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IGxvY2F0aW9uUG9zICYmIGxvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50J1xyXG4gICAgICAgICAgICAgICAgJiYgbG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMgJiYgbG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMubGVuZ3RoID09IDJcclxuICAgICAgICAgICAgICAgID8gbG9jYXRpb25Qb3MgOiBudWxsO1xyXG4gICAgICAgICAgICAkc2NvcGUubG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3VwcG9ydFNldCA9IG5hdmlnYXRvci5nZW9sb2NhdGlvbiAhPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gJHNjb3BlLnRyYW5zYWN0aW9uID0gcGlwVHJhbnNhY3Rpb24oJ2xvY2F0aW9uX2VkaXRfZGlhbG9nJywgJHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtYXAgPSBudWxsLCBtYXJrZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlTWFya2VyIChjb29yZGluYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcmtlcikgbWFya2VyLnNldE1hcChudWxsKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzTWFya2VyID0gbWFya2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXNNYXJrZXIsICdkcmFnZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gdGhpc01hcmtlci5nZXRQb3NpdGlvbigpOyBcclxuICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmtlcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCB0aWQpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbY29vcmRpbmF0ZXMubGF0KCksIGNvb3JkaW5hdGVzLmxuZygpXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRpZCA9ICRzY29wZS50cmFuc2FjdGlvbi5iZWdpbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aWQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlYWQgYWRkcmVzc1xyXG4gICAgICAgICAgICAgICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgbG9jYXRpb246IGNvb3JkaW5hdGVzIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICgkc2NvcGUudHJhbnNhY3Rpb24uYWJvcnRlZCh0aWQpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcG9zaXRpdmUgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJHNjb3BlLnRyYW5zYWN0aW9uLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCB1bnRpbCBkaWFsb2cgaXMgaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hcENvbnRhaW5lciA9ICQoJy5waXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyXHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSAkc2NvcGUubG9jYXRpb25Qb3MgP1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChjb29yZGluYXRlcyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucy5jZW50ZXIgPSBjb29yZGluYXRlcztcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLnpvb20gPSAxMjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcENvbnRhaW5lclswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpeCByZXNpemluZyBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcihtYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ3BpcExheW91dFJlc2l6ZWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcihtYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25BZGRQaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBtYXAuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uUmVtb3ZlUGluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25ab29tSW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHZhciB6b29tID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKHpvb20gKyAxKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblpvb21PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHZhciB6b29tID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKHpvb20gPiAxID8gem9vbSAtIDEgOiB6b29tKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdmFyIHRpZCA9ICRzY29wZS50cmFuc2FjdGlvbi5iZWdpbigpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRpZCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCRzY29wZS50cmFuc2FjdGlvbi5hYm9ydGVkKHRpZCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDEyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCB0aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAkc2NvcGUudHJhbnNhY3Rpb24uZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bUFnZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vbkNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vbkFwcGx5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiAkc2NvcGUubG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6ICRzY29wZS5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWU6ICRzY29wZS5sb2NhdGlvbk5hbWUgICBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gZWRpdCBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGVzIGluIHNhbXBsZXIgYXBwXHJcbiAqL1xyXG4gXHJcbi8qIGdsb2JhbCBhbmd1bGFyICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvbkVkaXRcIiwgWydwaXBMb2NhdGlvbkVkaXREaWFsb2cnXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5kaXJlY3RpdmUoJ3BpcExvY2F0aW9uRWRpdCcsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRwYXJzZSwgJGh0dHAsIHBpcExvY2F0aW9uRWRpdERpYWxvZykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQUMnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvbk5hbWU6ICc9JyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvczogJz0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uSG9sZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICAgICAgbmdEaXNhYmxlZDogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcENoYW5nZWQ6ICcmJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBTdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgICsgJzxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJtZC1ibG9ja1wiPidcclxuICAgICAgICAgICAgICAgICAgICArICc8bGFiZWw+e3sgXFwnTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2xhYmVsPidcclxuICAgICAgICAgICAgICAgICAgICArICc8aW5wdXQgbmctbW9kZWw9XCJwaXBMb2NhdGlvbk5hbWVcIidcclxuICAgICAgICAgICAgICAgICAgICArICduZy1kaXNhYmxlZD1cIm5nRGlzYWJsZWQoKVwiLz48L21kLWlucHV0LWNvbnRhaW5lcj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1lbXB0eVwiIGxheW91dD1cImNvbHVtblwiIGxheW91dC1hbGlnbj1cImNlbnRlciBjZW50ZXJcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLXJhaXNlZFwiIG5nLWRpc2FibGVkPVwibmdEaXNhYmxlZCgpXCIgbmctY2xpY2s9XCJvblNldExvY2F0aW9uKClcIidcclxuICAgICAgICAgICAgICAgICAgICArICdhcmlhLWxhYmVsPVwiTE9DQVRJT05fQUREX0xPQ0FUSU9OXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxzcGFuIGNsYXNzPVwiaWNvbi1sb2NhdGlvblwiPjwvc3Bhbj4ge3s6OlxcJ0xPQ0FUSU9OX0FERF9MT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fSdcclxuICAgICAgICAgICAgICAgICAgICArICc8L21kLWJ1dHRvbj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIiB0YWJpbmRleD1cInt7IG5nRGlzYWJsZWQoKSA/IC0xIDogMCB9fVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJyBuZy1jbGljaz1cIm9uTWFwQ2xpY2soJGV2ZW50KVwiIG5nLWtleXByZXNzPVwiXCJvbk1hcEtleVByZXNzKCRldmVudClcIj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCdtZC1pbnB1dC1jb250YWluZXInKS5hdHRyKCdtZC1uby1mbG9hdCcsICEhJHNjb3BlLnBpcExvY2F0aW9uSG9sZGVyKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlOiBhbnksICRlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVtcHR5ID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tZW1wdHknKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9nZ2xlIGNvbnRyb2wgdmlzaWJpbGl0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVtcHR5LnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24gPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUb2dnbGUgY29udHJvbCB2aXNpYmlsaXR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZW1wdHkuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGEgbmV3IG1hcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZGVmaW5lQ29vcmRpbmF0ZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbk5hbWUgPSAkc2NvcGUucGlwTG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uTmFtZSA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgJGh0dHAuZ2V0KCdodHRwOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9nZW9jb2RlL2pzb24/YWRkcmVzcz0nICsgbG9jYXRpb25OYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChyZXNwb25zZSkgeyAuLi4gfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAuZXJyb3IoZnVuY3Rpb24gKHJlc3BvbnNlKSB7Li4uIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbk5hbWUgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBlbXB0eSByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzID09IG51bGwgfHwgcmVzdWx0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeSB8fCB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gZ2VvbWV0cnkubG9jYXRpb24gfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0cyBhZ2FpblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24ubGF0ID09IG51bGwgfHwgbG9jYXRpb24ubG5nID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5sYXQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5sbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9nZW5lcmF0ZU1hcCgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIGVycm9yLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xlYXJNYXAoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVmaW5lQ29vcmRpbmF0ZXNEZWJvdW5jZWQgPSBfLmRlYm91bmNlKGRlZmluZUNvb3JkaW5hdGVzLCAyMDAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB1c2VyIGFjdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25TZXRMb2NhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm5nRGlzYWJsZWQoKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvbkVkaXREaWFsb2cuc2hvdyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWU6ICRzY29wZS5waXBMb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6ICRzY29wZS5waXBMb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gcmVzdWx0LmxvY2F0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWUgPSByZXN1bHQubG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEbyBub3QgY2hhbmdlIGFueXRoaW5nIGlmIGxvY2F0aW9uIGlzIGFib3V0IHRoZSBzYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcyAmJiAkc2NvcGUucGlwTG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICRzY29wZS5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBsb2NhdGlvbiAmJiBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPT0gMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0pIDwgMC4wMDAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV0gLSBsb2NhdGlvbi5jb29yZGluYXRlc1sxXSkgPCAwLjAwMDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGxvY2F0aW9uTmFtZSA9PSAkc2NvcGUucGlwTG9jYXRpb25OYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47ICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IGxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbk5hbWUgPT0gbnVsbCAmJiBsb2NhdGlvbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvbk5hbWUgPSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHJlc3VsdC5sb2NhdGlvbi5jb29yZGluYXRlc1swXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLCcgKyByZXN1bHQubG9jYXRpb24uY29vcmRpbmF0ZXNbMV0gKyAnKSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBDaGFuZ2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lclswXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vbk1hcENsaWNrID0gZnVuY3Rpb24gKCRldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm5nRGlzYWJsZWQoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lclswXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25TZXRMb2NhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25NYXBLZXlQcmVzcyA9IGZ1bmN0aW9uKCRldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm5nRGlzYWJsZWQoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRldmVudC5rZXlDb2RlID09IDEzIHx8ICRldmVudC5rZXlDb2RlID09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25TZXRMb2NhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8kZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gIFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdhdGNoIGZvciBsb2NhdGlvbiBuYW1lIGNoYW5nZXNcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBpcExvY2F0aW9uTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgIT0gb2xkVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lQ29vcmRpbmF0ZXNEZWJvdW5jZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwTG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24tZWRpdCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcykgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlIExvY2F0aW9uIElQIGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZXMgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIsIGdvb2dsZSAqL1xyXG5cclxuZGVjbGFyZSBsZXQgZ29vZ2xlOiBhbnk7XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvbklwXCIsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25JcCcsXHJcbiAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcElwYWRkcmVzczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcEV4dHJhSW5mbzogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAncGlwTG9jYXRpb25JcENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuY29udHJvbGxlcigncGlwTG9jYXRpb25JcENvbnRyb2xsZXInLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRodHRwKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVNYXAobGF0aXR1ZGUsIGxvbmdpdHVkZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIGlmIChsYXRpdHVkZSA9PSBudWxsIHx8IGxvbmdpdHVkZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGVcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbC5hcHBlbmRUbygkbWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGVmaW5lQ29vcmRpbmF0ZXMoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXBBZGRyZXNzID0gJHNjb3BlLnBpcElwYWRkcmVzcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpcEFkZHJlc3MgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUb2RvOiBGaW5kIG1vcmUgcmVsaWFibGUgZ2VvY29kaW5nIHNlcnZpY2UgdG8gbG9jYXRlIGlwIGFkZHJlc3Nlc1xyXG4gICAgICAgICAgICAgICAgJGh0dHAuanNvbnAoJ2h0dHBzOi8vd3d3Lmdlb3BsdWdpbi5uZXQvanNvbi5ncD9pcD0nICsgaXBBZGRyZXNzICsgJyZqc29uY2FsbGJhY2s9SlNPTl9DQUxMQkFDSycpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgIT0gbnVsbCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzcG9uc2UuZ2VvcGx1Z2luX2xhdGl0dWRlICE9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzcG9uc2UuZ2VvcGx1Z2luX2xvbmdpdHVkZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcChyZXNwb25zZS5nZW9wbHVnaW5fbGF0aXR1ZGUsIHJlc3BvbnNlLmdlb3BsdWdpbl9sb25naXR1ZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5waXBFeHRyYUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleHRyYUluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2l0eTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NpdHksICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25Db2RlOiByZXNwb25zZS5nZW9wbHVnaW5fcmVnaW9uQ29kZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogcmVzcG9uc2UuZ2VvcGx1Z2luX3JlZ2lvbk5hbWUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhQ29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX2FyZWFDb2RlLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9jb3VudHJ5Q29kZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IHJlc3BvbnNlLmdlb3BsdWdpbl9jb3VudHJ5TmFtZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbmVudENvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9jb250aW5lbnRDb2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcEV4dHJhSW5mbyh7IGV4dHJhSW5mbzogZXh0cmFJbmZvIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwSXBhZGRyZXNzKClcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLWlwJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGRlZmluZUNvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBtYXAgY29udHJvbFxyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvbk1hcFwiLCBbXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5kaXJlY3RpdmUoJ3BpcExvY2F0aW9uTWFwJyxcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Qb3M6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvc2l0aW9uczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcEljb25QYXRoOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwRHJhZ2dhYmxlOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwU3RyZXRjaDogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAncGlwTG9jYXRpb25NYXBDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uTWFwQ29udHJvbGxlcicsXHJcbiAgICAgICAgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSwgJHRpbWVvdXQpIHtcclxuICAgICAgICAgICAgdmFyXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzdHJldGNoTWFwID0gJHNjb3BlLnBpcFN0cmV0Y2goKSB8fCBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGljb25QYXRoID0gJHNjb3BlLnBpcEljb25QYXRoKCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tMb2NhdGlvbiAobG9jKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIShsb2MgPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfHwgbG9jLmNvb3JkaW5hdGVzID09IG51bGxcclxuICAgICAgICAgICAgICAgIHx8IGxvYy5jb29yZGluYXRlcy5sZW5ndGggPCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcG9pbnQgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcG9pbnQuZmlsbCA9IGxvYy5maWxsO1xyXG4gICAgICAgICAgICAgICAgcG9pbnQuc3Ryb2tlID0gbG9jLnN0cm9rZTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICcxJyB8fCB2YWx1ZSA9PSAndHJ1ZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zaXRpb25zKCksXHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlID0gJHNjb3BlLnBpcERyYWdnYWJsZSgpIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tMb2NhdGlvbihsb2NhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaChkZXRlcm1pbmVDb29yZGluYXRlcyhsb2NhdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25zICYmIGxvY2F0aW9ucy5sZW5ndGggJiYgbG9jYXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGxvYykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrTG9jYXRpb24obG9jKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKGRldGVybWluZUNvb3JkaW5hdGVzKGxvYykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwXHJcbiAgICAgICAgICAgICAgICB2YXJcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHBvaW50c1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBkcmFnZ2FibGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZHJhZ2dhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKSxcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIG1hcmtlcnNcclxuICAgICAgICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGljb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGljb25QYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IHBvaW50LmZpbGwgfHwgJyNFRjUzNTAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiBwb2ludC5zdHJva2UgfHwgJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiA1XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb2ludCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25QYXRoID8gaWNvbiA6IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKHBvaW50KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEF1dG8tY29uZmlnIG9mIHpvb20gYW5kIGNlbnRlclxyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFdhdGNoIGZvciBsb2NhdGlvbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIGlmICh0b0Jvb2xlYW4oJGF0dHJzLnBpcFJlYmluZCkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBpcExvY2F0aW9uUG9zKClcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1tYXAnKTtcclxuICAgICAgICAgICAgaWYgKHN0cmV0Y2hNYXApICRtYXBDb250YWluZXIuYWRkQ2xhc3MoJ3N0cmV0Y2gnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcygpIHx8ICRzY29wZS5waXBMb2NhdGlvblBvc2l0aW9ucygpKSAkdGltZW91dChnZW5lcmF0ZU1hcCwgMjAwKTtcclxuICAgICAgICAgICAgZWxzZSBjbGVhck1hcCgpO1xyXG4gICAgICAgIH1dXHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIu+7vy8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucycsIFsgICAgICAgIFxyXG4gICAgICAgICdwaXBMb2NhdGlvbicsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uTWFwJyxcclxuICAgICAgICAncGlwTG9jYXRpb25JcCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uRWRpdCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9ucy5UcmFuc2xhdGUnXHJcbiAgICBdKTtcclxuICAgIFxyXG59KSgpO1xyXG5cclxuXHJcbiIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgbGF5b3V0LWNvbHVtblwiIG1kLXRoZW1lPVwie3t0aGVtZX19XCI+PGRpdiBjbGFzcz1cInBpcC1oZWFkZXIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3RhcnQtc3RhcnRcIj48bWQtcHJvZ3Jlc3MtbGluZWFyIG5nLXNob3c9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicGlwLXByb2dyZXNzLXRvcFwiPjwvbWQtcHJvZ3Jlc3MtbGluZWFyPjxoMyBjbGFzcz1cImZsZXhcIj57eyBcXCdMT0NBVElPTl9TRVRfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2gzPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtZm9vdGVyXCI+PGRpdiBjbGFzcz1cImxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlclwiPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIm9uQWRkUGluKClcIiBuZy1zaG93PVwibG9jYXRpb25Qb3MgPT0gbnVsbFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB9fVwiPnt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIm9uUmVtb3ZlUGluKClcIiBuZy1zaG93PVwibG9jYXRpb25Qb3MgIT0gbnVsbFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB9fVwiPnt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjwvZGl2PjxkaXYgY2xhc3M9XCJmbGV4XCI+PC9kaXY+PGRpdiBjbGFzcz1cImxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXJcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwib25DYW5jZWwoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0NBTkNFTFxcJyB9fVwiPnt7IDo6XFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwib25BcHBseSgpXCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdBUFBMWVxcJyB9fVwiPnt7IDo6XFwnQVBQTFlcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWJvZHlcIj48ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXpvb20taW5cIiBuZy1jbGljaz1cIm9uWm9vbUluKClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9aT09NX0lOXFwnIH19XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXpvb20tb3V0XCIgbmctY2xpY2s9XCJvblpvb21PdXQoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fT1VUXFwnIH19XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51c1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC1zZXQtbG9jYXRpb25cIiBuZy1jbGljaz1cIm9uU2V0TG9jYXRpb24oKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTlxcJyB9fVwiIG5nLXNob3c9XCJzdXBwb3J0U2V0XCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRhcmdldFwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48L2Rpdj48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1sb2NhdGlvbnMtaHRtbC5taW4uanMubWFwXG4iXX0=