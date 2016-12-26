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
    thisModule.controller('pipLocationMapController', ['$scope', '$element', '$attrs', '$parse', function ($scope, $element, $attrs, $parse) {
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
                generateMap();
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2VkaXQvbG9jYXRpb25fZWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9sb2NhdGlvbl9pcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvbG9jYXRpb25fbWFwLnRzIiwic3JjL2xvY2F0aW9ucy50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0VBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlELFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsU0FBUztRQUM5QyxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztjQUMxQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUUzQyxNQUFNLENBQUMsVUFBVSxHQUFHO1lBQ2hCLE1BQU0sQ0FBQyxZQUFZLEdBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3BFLENBQUMsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNQTCxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbkQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQzlCO1FBQ0ks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O0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJywgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZmlsdGVyKCd0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpIFxyXG4gICAgICAgICAgICA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcFRyYW5zbGF0ZSAgPyBwaXBUcmFuc2xhdGUudHJhbnNsYXRlKGtleSkgfHwga2V5IDoga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGVzIGluIHNhbXBsZXIgYXBwXHJcbiAqL1xyXG5cclxuLyogZ2xvYmFsIGFuZ3VsYXIsIGdvb2dsZSAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25cIiwgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZGlyZWN0aXZlKCdwaXBMb2NhdGlvbicsIFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvbk5hbWU6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUmVzaXplOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogJz0nXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRlbGVtZW50LCAkYXR0cnM6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PSAnMScgfHwgdmFsdWUgPT0gJ3RydWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9Cb29sZWFuKCRhdHRycy5waXBDb2xsYXBzZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tbmFtZSBsb2NhdGlvbi1jb2xsYXBzZVwiIG5nLWNsaWNrPVwicGlwTG9jYXRpb25SZXNpemUoKVwiIG5nLWhpZGU9XCIhcGlwTG9jYXRpb25OYW1lKClcIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICduZy1jbGFzcz1cInBpcFNob3dMb2NhdGlvbkljb24gPyBcXCdwaXAtbG9jYXRpb24taWNvbi1zcGFjZVxcJyA6IFxcJ1xcJ1wiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmxvY2F0aW9uXCIgY2xhc3M9XCJmbGV4LWZpeGVkIHBpcC1pY29uXCIgbmctaWY9XCJwaXBTaG93TG9jYXRpb25JY29uXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInBpcC1sb2NhdGlvbi10ZXh0XCI+e3twaXBMb2NhdGlvbk5hbWUoKX19PC9zcGFuPiAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCIgbmctaGlkZT1cIiFwaXBMb2NhdGlvblBvcygpXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxtZC1idXR0b24gY2xhc3M9XCJwaXAtbG9jYXRpb24tbmFtZVwiIG5nLWNsaWNrPVwicGlwTG9jYXRpb25SZXNpemUoKVwiICdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICduZy1jbGFzcz1cInBpcFNob3dMb2NhdGlvbkljb24gPyBcXCdwaXAtbG9jYXRpb24taWNvbi1zcGFjZVxcJyA6IFxcJ1xcJ1wiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwibGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBsYXlvdXQtcm93IHctc3RyZXRjaFwiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmxvY2F0aW9uXCIgY2xhc3M9XCJmbGV4LWZpeGVkIHBpcC1pY29uXCIgbmctaWY9XCJwaXBTaG93TG9jYXRpb25JY29uXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInBpcC1sb2NhdGlvbi10ZXh0IGZsZXhcIj57e3BpcExvY2F0aW9uTmFtZSgpfX08L3NwYW4+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dHJpYW5nbGUtZG93blwiIGNsYXNzPVwiZmxleC1maXhlZFwiIG5nLWlmPVwiIXNob3dNYXBcIj48L21kLWljb24+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dHJpYW5nbGUtdXBcIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1pZj1cInNob3dNYXBcIj48L21kLWljb24+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PjwvbWQtYnV0dG9uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJ25nLWNsYXNzPVwicGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ3BpcC1sb2NhdGlvbi1pY29uLXNwYWNlXFwnIDogXFwnXFwnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAncGlwTG9jYXRpb25Db250cm9sbGVyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uQ29udHJvbGxlcicsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgJG5hbWUgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1uYW1lJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICAkdXAgPSAkZWxlbWVudC5maW5kKCcuaWNvbi11cCcpLFxyXG4gICAgICAgICAgICAgICAgJGRvd24gPSAkZWxlbWVudC5maW5kKCcuaWNvbi1kb3duJyksXHJcbiAgICAgICAgICAgICAgICBjb2xsYXBzYWJsZSA9IHRvQm9vbGVhbigkYXR0cnMucGlwQ29sbGFwc2UpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnNob3dNYXAgPT0gZmFsc2UgfHwgbG9jYXRpb24gPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAoIWNvbGxhcHNhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd01hcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHVwLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICRuYW1lLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkYXR0cnMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd01hcCA9ICEkc2NvcGUuc2hvd01hcDtcclxuICAgICAgICAgICAgICAgICAgICAkdXBbJHNjb3BlLnNob3dNYXAgPyAnc2hvdycgOiAnaGlkZSddKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvd25bISRzY29wZS5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgkc2NvcGUucGlwTG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcygpKSBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICBlbHNlIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgfSAgICBcclxuICAgICk7XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gZWRpdCBkaWFsb2dcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZSBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFxyXG4gICAgICAgIFsnbmdNYXRlcmlhbCcsICAncGlwTG9jYXRpb25zLlRlbXBsYXRlcyddKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLnJ1bihmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAocGlwVHJhbnNsYXRlKSB7XHJcbiAgICAgICAgICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICdBZGQgbG9jYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICdTZXQgbG9jYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAnQWRkIHBpbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fUkVNT1ZFX1BJTic6ICdSZW1vdmUgcGluJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGlwVHJhbnNsYXRlLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0LzQtdGB0YLQvtC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ9Ce0L/RgNC10LTQtdC70LjRgtGMINC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICfQlNC+0LHQsNCy0LjRgtGMINGC0L7Rh9C60YMnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAn0KPQsdGA0LDRgtGMINGC0L7Rh9C60YMnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzTW9kdWxlLmZhY3RvcnkoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRtZERpYWxvZykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbl9kaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBwYXJhbXMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6IHBhcmFtcy5sb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuY29udHJvbGxlcigncGlwTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlcicsIFxyXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCAkbWREaWFsb2csICBsb2NhdGlvblBvcywgbG9jYXRpb25OYW1lKSB7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudGhlbWUgPSAkcm9vdFNjb3BlLiR0aGVtZTtcclxuICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zID0gbG9jYXRpb25Qb3MgJiYgbG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnXHJcbiAgICAgICAgICAgICAgICAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcyAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMlxyXG4gICAgICAgICAgICAgICAgPyBsb2NhdGlvblBvcyA6IG51bGw7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zdXBwb3J0U2V0ID0gbmF2aWdhdG9yLmdlb2xvY2F0aW9uICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyAkc2NvcGUudHJhbnNhY3Rpb24gPSBwaXBUcmFuc2FjdGlvbignbG9jYXRpb25fZWRpdF9kaWFsb2cnLCAkc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcCA9IG51bGwsIG1hcmtlciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXJrZXIgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFya2VyKSBtYXJrZXIuc2V0TWFwKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNNYXJrZXIgPSBtYXJrZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSB0aGlzTWFya2VyLmdldFBvc2l0aW9uKCk7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFya2VyO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtjb29yZGluYXRlcy5sYXQoKSwgY29vcmRpbmF0ZXMubG5nKCldXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRpZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpZCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBsb2NhdGlvbjogY29vcmRpbmF0ZXMgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCRzY29wZS50cmFuc2FjdGlvbi5hYm9ydGVkKHRpZCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBwb3NpdGl2ZSByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0tcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAkc2NvcGUudHJhbnNhY3Rpb24uZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IHVudGlsIGRpYWxvZyBpcyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFwQ29udGFpbmVyID0gJCgnLnBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyAucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXJcclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9ICRzY29wZS5sb2NhdGlvblBvcyA/XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGNvb3JkaW5hdGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuem9vbSA9IDEyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQ29udGFpbmVyWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRml4IHJlc2l6aW5nIGlzc3VlXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTGF5b3V0UmVzaXplZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vbkFkZFBpbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG1hcC5nZXRDZW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25SZW1vdmVQaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihudWxsKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblpvb21JbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSArIDEpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uWm9vbU91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSA+IDEgPyB6b29tIC0gMSA6IHpvb20pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAodGlkID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoJHNjb3BlLnRyYW5zYWN0aW9uLmFib3J0ZWQodGlkKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICRzY29wZS50cmFuc2FjdGlvbi5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uQ2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uQXBwbHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246ICRzY29wZS5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogJHNjb3BlLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogJHNjb3BlLmxvY2F0aW9uTmFtZSAgIFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBlZGl0IGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZXMgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uRWRpdFwiLCBbJ3BpcExvY2F0aW9uRWRpdERpYWxvZyddKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25FZGl0JyxcclxuICAgICAgICBmdW5jdGlvbiAoJHBhcnNlLCAkaHR0cCwgcGlwTG9jYXRpb25FZGl0RGlhbG9nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBQycsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICAgICAgICAgICAgICBuZ0Rpc2FibGVkOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cIm1kLWJsb2NrXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxsYWJlbD57eyBcXCdMT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbGFiZWw+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxpbnB1dCBuZy1tb2RlbD1cInBpcExvY2F0aW9uTmFtZVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJ25nLWRpc2FibGVkPVwibmdEaXNhYmxlZCgpXCIvPjwvbWQtaW5wdXQtY29udGFpbmVyPidcclxuICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWVtcHR5XCIgbGF5b3V0PVwiY29sdW1uXCIgbGF5b3V0LWFsaWduPVwiY2VudGVyIGNlbnRlclwiPidcclxuICAgICAgICAgICAgICAgICAgICArICc8bWQtYnV0dG9uIGNsYXNzPVwibWQtcmFpc2VkXCIgbmctZGlzYWJsZWQ9XCJuZ0Rpc2FibGVkKClcIiBuZy1jbGljaz1cIm9uU2V0TG9jYXRpb24oKVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJ2FyaWEtbGFiZWw9XCJMT0NBVElPTl9BRERfTE9DQVRJT05cIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJpY29uLWxvY2F0aW9uXCI+PC9zcGFuPiB7ezo6XFwnTE9DQVRJT05fQUREX0xPQ0FUSU9OXFwnIHwgdHJhbnNsYXRlIH19J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzwvbWQtYnV0dG9uPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiIHRhYmluZGV4PVwie3sgbmdEaXNhYmxlZCgpID8gLTEgOiAwIH19XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnIG5nLWNsaWNrPVwib25NYXBDbGljaygkZXZlbnQpXCIgbmcta2V5cHJlc3M9XCJcIm9uTWFwS2V5UHJlc3MoJGV2ZW50KVwiPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ21kLWlucHV0LWNvbnRhaW5lcicpLmF0dHIoJ21kLW5vLWZsb2F0JywgISEkc2NvcGUucGlwTG9jYXRpb25Ib2xkZXIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGU6IGFueSwgJGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZW1wdHkgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1lbXB0eScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUb2dnbGUgY29udHJvbCB2aXNpYmlsaXR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZW1wdHkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSAkc2NvcGUucGlwTG9jYXRpb25Qb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGwgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBjb250cm9sIHZpc2liaWxpdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbXB0eS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWZpbmVDb29yZGluYXRlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uTmFtZSA9ICRzY29wZS5waXBMb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAkaHR0cC5nZXQoJ2h0dHA6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2dlb2NvZGUvanNvbj9hZGRyZXNzPScgKyBsb2NhdGlvbk5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHJlc3BvbnNlKSB7IC4uLiB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIC5lcnJvcihmdW5jdGlvbiAocmVzcG9uc2UpIHsuLi4gfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uTmFtZSB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMgPT0gbnVsbCB8fCByZXN1bHRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5IHx8IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnZW9tZXRyeS5sb2NhdGlvbiB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBlbXB0eSByZXN1bHRzIGFnYWluXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbi5sYXQgPT0gbnVsbCB8fCBsb2NhdGlvbi5sbmcgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmxhdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmxuZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2dlbmVyYXRlTWFwKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgZXJyb3IuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jbGVhck1hcCgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZCA9IF8uZGVib3VuY2UoZGVmaW5lQ29vcmRpbmF0ZXMsIDIwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubmdEaXNhYmxlZCgpKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uRWRpdERpYWxvZy5zaG93KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogJHNjb3BlLnBpcExvY2F0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogJHNjb3BlLnBpcExvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSByZXN1bHQubG9jYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCBjaGFuZ2UgYW55dGhpbmcgaWYgbG9jYXRpb24gaXMgYWJvdXQgdGhlIHNhbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zICYmICRzY29wZS5waXBMb2NhdGlvblBvcy50eXBlID09ICdQb2ludCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgJHNjb3BlLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGxvY2F0aW9uICYmIGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMF0gLSBsb2NhdGlvbi5jb29yZGluYXRlc1swXSkgPCAwLjAwMDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCRzY29wZS5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlc1sxXSAtIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdKSA8IDAuMDAwMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAobG9jYXRpb25OYW1lID09ICRzY29wZS5waXBMb2NhdGlvbk5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uTmFtZSA9IGxvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uTmFtZSA9PSBudWxsICYmIGxvY2F0aW9uICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uTmFtZSA9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICcsJyArIHJlc3VsdC5sb2NhdGlvbi5jb29yZGluYXRlc1sxXSArICcpJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcENoYW5nZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uTWFwQ2xpY2sgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubmdEaXNhYmxlZCgpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vbk1hcEtleVByZXNzID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubmdEaXNhYmxlZCgpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGV2ZW50LmtleUNvZGUgPT0gMTMgfHwgJGV2ZW50LmtleUNvZGUgPT0gMzIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIG5hbWUgY2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwTG9jYXRpb25OYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAhPSBvbGRWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBMb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1lZGl0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zKSBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gSVAgY29udHJvbFxyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKiBAdG9kb1xyXG4gKiAtIEltcHJvdmUgc2FtcGxlcyBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG5kZWNsYXJlIGxldCBnb29nbGU6IGFueTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uSXBcIiwgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZGlyZWN0aXZlKCdwaXBMb2NhdGlvbklwJyxcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlwSXBhZGRyZXNzOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwRXh0cmFJbmZvOiAnJidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbklwQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb250cm9sbGVyKCdwaXBMb2NhdGlvbklwQ29udHJvbGxlcicsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJGh0dHApIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKSxcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZU1hcChsYXRpdHVkZSwgbG9uZ2l0dWRlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgaWYgKGxhdGl0dWRlID09IG51bGwgfHwgbG9uZ2l0dWRlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PSAnMScgfHwgdmFsdWUgPT0gJ3RydWUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWZpbmVDb29yZGluYXRlcygpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpcEFkZHJlc3MgPSAkc2NvcGUucGlwSXBhZGRyZXNzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlwQWRkcmVzcyA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFRvZG86IEZpbmQgbW9yZSByZWxpYWJsZSBnZW9jb2Rpbmcgc2VydmljZSB0byBsb2NhdGUgaXAgYWRkcmVzc2VzXHJcbiAgICAgICAgICAgICAgICAkaHR0cC5qc29ucCgnaHR0cHM6Ly93d3cuZ2VvcGx1Z2luLm5ldC9qc29uLmdwP2lwPScgKyBpcEFkZHJlc3MgKyAnJmpzb25jYWxsYmFjaz1KU09OX0NBTExCQUNLJylcclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAhPSBudWxsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiByZXNwb25zZS5nZW9wbHVnaW5fbGF0aXR1ZGUgIT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiByZXNwb25zZS5nZW9wbHVnaW5fbG9uZ2l0dWRlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKHJlc3BvbnNlLmdlb3BsdWdpbl9sYXRpdHVkZSwgcmVzcG9uc2UuZ2VvcGx1Z2luX2xvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBpcEV4dHJhSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4dHJhSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiByZXNwb25zZS5nZW9wbHVnaW5fY2l0eSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbkNvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9yZWdpb25Db2RlLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiByZXNwb25zZS5nZW9wbHVnaW5fcmVnaW9uTmFtZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFDb2RlOiByZXNwb25zZS5nZW9wbHVnaW5fYXJlYUNvZGUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NvdW50cnlDb2RlLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NvdW50cnlOYW1lLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGluZW50Q29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NvbnRpbmVudENvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwRXh0cmFJbmZvKHsgZXh0cmFJbmZvOiBleHRyYUluZm8gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBXYXRjaCBmb3IgbG9jYXRpb24gY2hhbmdlc1xyXG4gICAgICAgICAgICBpZiAodG9Cb29sZWFuKCRhdHRycy5waXBSZWJpbmQpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBJcGFkZHJlc3MoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZUNvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24taXAnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgZGVmaW5lQ29vcmRpbmF0ZXMoKTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICk7XHJcblxyXG59KSgpO1xyXG5cclxuIiwiLyoqXHJcbiAqIEBmaWxlIExvY2F0aW9uIG1hcCBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqL1xyXG4gXHJcbi8qIGdsb2JhbCBhbmd1bGFyLCBnb29nbGUgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uTWFwXCIsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25NYXAnLFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zaXRpb25zOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwSWNvblBhdGg6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBEcmFnZ2FibGU6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBTdHJldGNoOiAnJidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbk1hcENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuY29udHJvbGxlcigncGlwTG9jYXRpb25NYXBDb250cm9sbGVyJyxcclxuICAgICAgICBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlKSB7XHJcbiAgICAgICAgICAgIHZhclxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpLFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgc3RyZXRjaE1hcCA9ICRzY29wZS5waXBTdHJldGNoKCkgfHwgZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpY29uUGF0aCA9ICRzY29wZS5waXBJY29uUGF0aCgpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrTG9jYXRpb24gKGxvYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICEobG9jID09IG51bGxcclxuICAgICAgICAgICAgICAgIHx8IGxvYy5jb29yZGluYXRlcyA9PSBudWxsXHJcbiAgICAgICAgICAgICAgICB8fCBsb2MuY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRldGVybWluZUNvb3JkaW5hdGVzKGxvYykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50ID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIHBvaW50LmZpbGwgPSBsb2MuZmlsbDtcclxuICAgICAgICAgICAgICAgIHBvaW50LnN0cm9rZSA9IGxvYy5zdHJva2U7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PSAnMScgfHwgdmFsdWUgPT0gJ3RydWUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9ICRzY29wZS5waXBMb2NhdGlvblBvcygpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9ucyA9ICRzY29wZS5waXBMb2NhdGlvblBvc2l0aW9ucygpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZSA9ICRzY29wZS5waXBEcmFnZ2FibGUoKSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrTG9jYXRpb24obG9jYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzLnB1c2goZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jYXRpb24pKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9ucyAmJiBsb2NhdGlvbnMubGVuZ3RoICYmIGxvY2F0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChsb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0xvY2F0aW9uKGxvYykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaChkZXRlcm1pbmVDb29yZGluYXRlcyhsb2MpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbC5hcHBlbmRUbygkbWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcFxyXG4gICAgICAgICAgICAgICAgdmFyXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBwb2ludHNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZHJhZ2dhYmxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGRyYWdnYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyksXHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBtYXJrZXJzXHJcbiAgICAgICAgICAgICAgICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbihwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpY29uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBpY29uUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBwb2ludC5maWxsIHx8ICcjRUY1MzUwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogcG9pbnQuc3Ryb2tlIHx8ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogNVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9pbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uUGF0aCA/IGljb24gOiBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChwb2ludCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBdXRvLWNvbmZpZyBvZiB6b29tIGFuZCBjZW50ZXJcclxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBXYXRjaCBmb3IgbG9jYXRpb24gY2hhbmdlc1xyXG4gICAgICAgICAgICBpZiAodG9Cb29sZWFuKCRhdHRycy5waXBSZWJpbmQpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBMb2NhdGlvblBvcygpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24tbWFwJyk7XHJcbiAgICAgICAgICAgIGlmIChzdHJldGNoTWFwKSAkbWFwQ29udGFpbmVyLmFkZENsYXNzKCdzdHJldGNoJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MoKSB8fCAkc2NvcGUucGlwTG9jYXRpb25Qb3NpdGlvbnMoKSkgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgZWxzZSBjbGVhck1hcCgpO1xyXG4gICAgICAgIH1dXHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIu+7vy8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucycsIFsgICAgICAgIFxyXG4gICAgICAgICdwaXBMb2NhdGlvbicsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uTWFwJyxcclxuICAgICAgICAncGlwTG9jYXRpb25JcCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uRWRpdCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9ucy5UcmFuc2xhdGUnXHJcbiAgICBdKTtcclxuICAgIFxyXG59KSgpO1xyXG5cclxuXHJcbiIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgbGF5b3V0LWNvbHVtblwiIG1kLXRoZW1lPVwie3t0aGVtZX19XCI+PGRpdiBjbGFzcz1cInBpcC1oZWFkZXIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3RhcnQtc3RhcnRcIj48bWQtcHJvZ3Jlc3MtbGluZWFyIG5nLXNob3c9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicGlwLXByb2dyZXNzLXRvcFwiPjwvbWQtcHJvZ3Jlc3MtbGluZWFyPjxoMyBjbGFzcz1cImZsZXhcIj57eyBcXCdMT0NBVElPTl9TRVRfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2gzPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtZm9vdGVyXCI+PGRpdiBjbGFzcz1cImxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlclwiPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIm9uQWRkUGluKClcIiBuZy1zaG93PVwibG9jYXRpb25Qb3MgPT0gbnVsbFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB9fVwiPnt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIm9uUmVtb3ZlUGluKClcIiBuZy1zaG93PVwibG9jYXRpb25Qb3MgIT0gbnVsbFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB9fVwiPnt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjwvZGl2PjxkaXYgY2xhc3M9XCJmbGV4XCI+PC9kaXY+PGRpdiBjbGFzcz1cImxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXJcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwib25DYW5jZWwoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0NBTkNFTFxcJyB9fVwiPnt7IDo6XFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwib25BcHBseSgpXCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdBUFBMWVxcJyB9fVwiPnt7IDo6XFwnQVBQTFlcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWJvZHlcIj48ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXpvb20taW5cIiBuZy1jbGljaz1cIm9uWm9vbUluKClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9aT09NX0lOXFwnIH19XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXpvb20tb3V0XCIgbmctY2xpY2s9XCJvblpvb21PdXQoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fT1VUXFwnIH19XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51c1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC1zZXQtbG9jYXRpb25cIiBuZy1jbGljaz1cIm9uU2V0TG9jYXRpb24oKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTlxcJyB9fVwiIG5nLXNob3c9XCJzdXBwb3J0U2V0XCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRhcmdldFwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48L2Rpdj48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1sb2NhdGlvbnMtaHRtbC5taW4uanMubWFwXG4iXX0=