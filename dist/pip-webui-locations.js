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
                        + '<div class="pip-location-name bm0" ng-click="pipLocationResize()" ng-hide="!pipLocationName()"'
                        + 'ng-class="pipShowLocationIcon ? \'lp24-flex rp16\' : \'\'">'
                        + '<md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="pipShowLocationIcon"></md-icon>'
                        + '<span class="pip-location-text">{{pipLocationName()}}</span> '
                        + '</div>'
                        + '<div class="pip-location-container bm8" ng-hide="!pipLocationPos()"></div>';
                }
                else {
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
    var thisModule = angular.module('pipLocationEditDialog', ['ngMaterial', 'pipTranslate', 'pipTransactions', 'pipLocations.Templates']);
    thisModule.config(['pipTranslateProvider', function (pipTranslateProvider) {
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
    thisModule.controller('pipLocationEditDialogController', ['$scope', '$rootScope', '$timeout', '$mdDialog', 'pipTransaction', 'locationPos', 'locationName', function ($scope, $rootScope, $timeout, $mdDialog, pipTransaction, locationPos, locationName) {
        $scope.theme = $rootScope.$theme;
        $scope.locationPos = locationPos && locationPos.type == 'Point'
            && locationPos.coordinates && locationPos.coordinates.length == 2
            ? locationPos : null;
        $scope.locationName = locationName;
        $scope.supportSet = navigator.geolocation != null;
        $scope.transaction = pipTransaction('location_edit_dialog', $scope);
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
                tid = $scope.transaction.begin();
                if (tid == null)
                    return;
            }
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: coordinates }, function (results, status) {
                if ($scope.transaction.aborted(tid))
                    return;
                if (status == google.maps.GeocoderStatus.OK
                    && results && results.length > 0) {
                    $scope.locationName = results[0].formatted_address;
                }
                $scope.transaction.end();
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
            var tid = $scope.transaction.begin();
            if (tid == null)
                return;
            navigator.geolocation.getCurrentPosition(function (position) {
                if ($scope.transaction.aborted(tid))
                    return;
                var coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                marker = createMarker(coordinates);
                map.setCenter(coordinates);
                map.setZoom(12);
                changeLocation(coordinates, tid);
            }, function () {
                $scope.transaction.end();
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
                + '<span class="icon-location"></span> {{::\'LOCATION_ADD_LOCATION\' | translate}}'
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
        'pipLocationEdit',
        'pipLocationEditDialog'
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
    '<md-dialog class="pip-dialog pip-location-edit-dialog layout-column" md-theme="{{theme}}"><div class="pip-header layout-column layout-align-start-start"><md-progress-linear ng-show="transaction.busy()" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h3 class="m0 w-stretch flex">{{ \'LOCATION_SET_LOCATION\' | translate }}</h3></div><div class="pip-footer"><div class="layout-row layout-align-start-center"><md-button class="md-accent" ng-click="onAddPin()" ng-show="locationPos == null" ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_ADD_PIN\' | translate }}">{{ ::\'LOCATION_ADD_PIN\' | translate }}</md-button><md-button class="md-accent" ng-click="onRemovePin()" ng-show="locationPos != null" ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_REMOVE_PIN\' | translate }}">{{ ::\'LOCATION_REMOVE_PIN\' | translate }}</md-button></div><div class="flex"></div><div class="layout-row layout-align-end-center"><md-button ng-click="onCancel()" aria-label="{{ ::\'CANCEL\' | translate }}">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="onApply()" ng-disabled="transaction.busy()" aria-label="{{ ::\'APPLY\' | translate }}">{{ ::\'APPLY\' | translate }}</md-button></div></div><div class="pip-body"><div class="pip-location-container"></div><md-button class="md-icon-button md-fab pip-zoom-in" ng-click="onZoomIn()" aria-label="{{ ::\'LOCATION_ZOOM_IN\' | translate }}"><md-icon md-svg-icon="icons:plus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-zoom-out" ng-click="onZoomOut()" aria-label="{{ ::\'LOCATION_ZOOM_OUT\' | translate }}"><md-icon md-svg-icon="icons:minus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-set-location" ng-click="onSetLocation()" aria-label="{{ ::\'LOCATION_SET_LOCATION\' | translate }}" ng-show="supportSet" ng-disabled="transaction.busy()"><md-icon md-svg-icon="icons:target"></md-icon></md-button></div></md-dialog>');
}]);
})();



},{}]},{},[8,1,3,4,5,6,2,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2VkaXQvbG9jYXRpb25fZWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9sb2NhdGlvbl9pcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvbG9jYXRpb25fbWFwLnRzIiwic3JjL2xvY2F0aW9ucy50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ09BLENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlELFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsU0FBUztRQUM5QyxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztjQUMxQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUUzQyxNQUFNLENBQUMsVUFBVSxHQUFHO1lBQ2hCLE1BQU0sQ0FBQyxZQUFZLEdBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3BFLENBQUMsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNaTCxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbkQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQzlCO1FBQ0ks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QUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVFLElBQUk7Z0JBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQ0wsQ0FBQztBQUVOLENBQUMsQ0FBQyxFQUFFLENBQUM7O0FDckpMLENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUMzQixhQUFhO1FBQ2IsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFDZixpQkFBaUI7UUFDakIsdUJBQXVCO0tBQzFCLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxFQUFFLENBQUM7O0FDbEJMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIEBmaWxlIE9wdGlvbmFsIGZpbHRlciB0byB0cmFuc2xhdGUgc3RyaW5nIHJlc291cmNlc1xyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJywgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZmlsdGVyKCd0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpIFxyXG4gICAgICAgICAgICA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcFRyYW5zbGF0ZSAgPyBwaXBUcmFuc2xhdGUudHJhbnNsYXRlKGtleSkgfHwga2V5IDoga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlIExvY2F0aW9uIGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZXMgaW4gc2FtcGxlciBhcHBcclxuICovXHJcblxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvblwiLCBbXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5kaXJlY3RpdmUoJ3BpcExvY2F0aW9uJywgXHJcbiAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uTmFtZTogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBTaG93TG9jYXRpb25JY29uOiAnPSdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oJGVsZW1lbnQsICRhdHRyczogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICcxJyB8fCB2YWx1ZSA9PSAndHJ1ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b0Jvb2xlYW4oJGF0dHJzLnBpcENvbGxhcHNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1uYW1lIGJtMFwiIG5nLWNsaWNrPVwicGlwTG9jYXRpb25SZXNpemUoKVwiIG5nLWhpZGU9XCIhcGlwTG9jYXRpb25OYW1lKClcIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICduZy1jbGFzcz1cInBpcFNob3dMb2NhdGlvbkljb24gPyBcXCdscDI0LWZsZXggcnAxNlxcJyA6IFxcJ1xcJ1wiPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmxvY2F0aW9uXCIgY2xhc3M9XCJmbGV4LWZpeGVkIHBpcC1pY29uXCIgbmctaWY9XCJwaXBTaG93TG9jYXRpb25JY29uXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInBpcC1sb2NhdGlvbi10ZXh0XCI+e3twaXBMb2NhdGlvbk5hbWUoKX19PC9zcGFuPiAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyIGJtOFwiIG5nLWhpZGU9XCIhcGlwTG9jYXRpb25Qb3MoKVwiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtYnV0dG9uIGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWVcIiBuZy1jbGljaz1cInBpcExvY2F0aW9uUmVzaXplKClcIiAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwnbHAyNC1mbGV4IHJwMTZcXCcgOiBcXCdcXCdcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgbGF5b3V0LXJvdyB3LXN0cmV0Y2hcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpsb2NhdGlvblwiIGNsYXNzPVwiZmxleC1maXhlZCBwaXAtaWNvblwiIG5nLWlmPVwicGlwU2hvd0xvY2F0aW9uSWNvblwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dCBmbGV4XCI+e3twaXBMb2NhdGlvbk5hbWUoKX19PC9zcGFuPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLWRvd25cIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1pZj1cIiFzaG93TWFwXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLXVwXCIgY2xhc3M9XCJmbGV4LWZpeGVkXCIgbmctaWY9XCJzaG93TWFwXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj48L21kLWJ1dHRvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXIgYm04XCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwnbG0yNC1mbGV4IHJtMjQtZmxleFxcJyA6IFxcJ1xcJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb250cm9sbGVyKCdwaXBMb2NhdGlvbkNvbnRyb2xsZXInLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgJG5hbWUgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1uYW1lJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICAkdXAgPSAkZWxlbWVudC5maW5kKCcuaWNvbi11cCcpLFxyXG4gICAgICAgICAgICAgICAgJGRvd24gPSAkZWxlbWVudC5maW5kKCcuaWNvbi1kb3duJyksXHJcbiAgICAgICAgICAgICAgICBjb2xsYXBzYWJsZSA9IHRvQm9vbGVhbigkYXR0cnMucGlwQ29sbGFwc2UpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnNob3dNYXAgPT0gZmFsc2UgfHwgbG9jYXRpb24gPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAoIWNvbGxhcHNhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd01hcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHVwLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICRuYW1lLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkYXR0cnMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd01hcCA9ICEkc2NvcGUuc2hvd01hcDtcclxuICAgICAgICAgICAgICAgICAgICAkdXBbJHNjb3BlLnNob3dNYXAgPyAnc2hvdycgOiAnaGlkZSddKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvd25bISRzY29wZS5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgkc2NvcGUucGlwTG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcygpKSBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICBlbHNlIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgfSAgICBcclxuICAgICk7XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gZWRpdCBkaWFsb2dcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZSBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFxyXG4gICAgICAgIFsnbmdNYXRlcmlhbCcsICdwaXBUcmFuc2xhdGUnLCAncGlwVHJhbnNhY3Rpb25zJywgJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb25maWcoZnVuY3Rpb24ocGlwVHJhbnNsYXRlUHJvdmlkZXIpIHtcclxuICAgICAgICBwaXBUcmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ0FkZCBsb2NhdGlvbicsXHJcbiAgICAgICAgICAgICdMT0NBVElPTl9TRVRfTE9DQVRJT04nOiAnU2V0IGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAnQWRkIHBpbicsXHJcbiAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ1JlbW92ZSBwaW4nXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGlwVHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25zKCdydScsIHtcclxuICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICfQlNC+0LHQsNCy0LjRgtGMINC80LXRgdGC0L7Qv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ9Ce0L/RgNC10LTQtdC70LjRgtGMINC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICdMT0NBVElPTl9BRERfUElOJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0YLQvtGH0LrRgycsXHJcbiAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ9Cj0LHRgNCw0YLRjCDRgtC+0YfQutGDJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5mYWN0b3J5KCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkbWREaWFsb2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogcGFyYW1zLmxvY2F0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiBwYXJhbXMubG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2socmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmNlbENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXInLCBcclxuICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgJG1kRGlhbG9nLCBwaXBUcmFuc2FjdGlvbiwgbG9jYXRpb25Qb3MsIGxvY2F0aW9uTmFtZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUudGhlbWUgPSAkcm9vdFNjb3BlLiR0aGVtZTtcclxuICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zID0gbG9jYXRpb25Qb3MgJiYgbG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnXHJcbiAgICAgICAgICAgICAgICAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcyAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMlxyXG4gICAgICAgICAgICAgICAgPyBsb2NhdGlvblBvcyA6IG51bGw7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zdXBwb3J0U2V0ID0gbmF2aWdhdG9yLmdlb2xvY2F0aW9uICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudHJhbnNhY3Rpb24gPSBwaXBUcmFuc2FjdGlvbignbG9jYXRpb25fZWRpdF9kaWFsb2cnLCAkc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcCA9IG51bGwsIG1hcmtlciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXJrZXIgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFya2VyKSBtYXJrZXIuc2V0TWFwKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNNYXJrZXIgPSBtYXJrZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSB0aGlzTWFya2VyLmdldFBvc2l0aW9uKCk7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFya2VyO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtjb29yZGluYXRlcy5sYXQoKSwgY29vcmRpbmF0ZXMubG5nKCldXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRpZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpZCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBsb2NhdGlvbjogY29vcmRpbmF0ZXMgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS50cmFuc2FjdGlvbi5hYm9ydGVkKHRpZCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBwb3NpdGl2ZSByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0tcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhbnNhY3Rpb24uZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IHVudGlsIGRpYWxvZyBpcyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFwQ29udGFpbmVyID0gJCgnLnBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyAucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXJcclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9ICRzY29wZS5sb2NhdGlvblBvcyA/XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGNvb3JkaW5hdGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuem9vbSA9IDEyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQ29udGFpbmVyWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRml4IHJlc2l6aW5nIGlzc3VlXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTGF5b3V0UmVzaXplZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vbkFkZFBpbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG1hcC5nZXRDZW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25SZW1vdmVQaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihudWxsKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblpvb21JbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSArIDEpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uWm9vbU91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSA+IDEgPyB6b29tIC0gMSA6IHpvb20pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlkID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnRyYW5zYWN0aW9uLmFib3J0ZWQodGlkKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFuc2FjdGlvbi5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uQ2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uQXBwbHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246ICRzY29wZS5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogJHNjb3BlLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogJHNjb3BlLmxvY2F0aW9uTmFtZSAgIFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBlZGl0IGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZXMgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uRWRpdFwiLCBbJ3BpcExvY2F0aW9uRWRpdERpYWxvZyddKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25FZGl0JyxcclxuICAgICAgICBmdW5jdGlvbiAoJHBhcnNlLCAkaHR0cCwgcGlwTG9jYXRpb25FZGl0RGlhbG9nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBQycsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICAgICAgICAgICAgICBuZ0Rpc2FibGVkOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cIm1kLWJsb2NrXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxsYWJlbD57eyBcXCdMT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbGFiZWw+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxpbnB1dCBuZy1tb2RlbD1cInBpcExvY2F0aW9uTmFtZVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJ25nLWRpc2FibGVkPVwibmdEaXNhYmxlZCgpXCIvPjwvbWQtaW5wdXQtY29udGFpbmVyPidcclxuICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWVtcHR5XCIgbGF5b3V0PVwiY29sdW1uXCIgbGF5b3V0LWFsaWduPVwiY2VudGVyIGNlbnRlclwiPidcclxuICAgICAgICAgICAgICAgICAgICArICc8bWQtYnV0dG9uIGNsYXNzPVwibWQtcmFpc2VkXCIgbmctZGlzYWJsZWQ9XCJuZ0Rpc2FibGVkKClcIiBuZy1jbGljaz1cIm9uU2V0TG9jYXRpb24oKVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJ2FyaWEtbGFiZWw9XCJMT0NBVElPTl9BRERfTE9DQVRJT05cIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJpY29uLWxvY2F0aW9uXCI+PC9zcGFuPiB7ezo6XFwnTE9DQVRJT05fQUREX0xPQ0FUSU9OXFwnIHwgdHJhbnNsYXRlfX0nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPC9tZC1idXR0b24+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCIgdGFiaW5kZXg9XCJ7eyBuZ0Rpc2FibGVkKCkgPyAtMSA6IDAgfX1cIidcclxuICAgICAgICAgICAgICAgICAgICArICcgbmctY2xpY2s9XCJvbk1hcENsaWNrKCRldmVudClcIiBuZy1rZXlwcmVzcz1cIlwib25NYXBLZXlQcmVzcygkZXZlbnQpXCI+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnbWQtaW5wdXQtY29udGFpbmVyJykuYXR0cignbWQtbm8tZmxvYXQnLCAhISRzY29wZS5waXBMb2NhdGlvbkhvbGRlcik7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCRzY29wZTogYW55LCAkZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbXB0eSA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWVtcHR5JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBjb250cm9sIHZpc2liaWxpdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbXB0eS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9ICRzY29wZS5waXBMb2NhdGlvblBvcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uID09IG51bGwgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMgPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9nZ2xlIGNvbnRyb2wgdmlzaWJpbGl0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVtcHR5LmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBtYXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udHJvbC5hcHBlbmRUbygkbWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25OYW1lID0gJHNjb3BlLnBpcExvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbk5hbWUgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICRodHRwLmdldCgnaHR0cDovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvZ2VvY29kZS9qc29uP2FkZHJlc3M9JyArIGxvY2F0aW9uTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAuc3VjY2VzcyhmdW5jdGlvbiAocmVzcG9uc2UpIHsgLi4uIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgLmVycm9yKGZ1bmN0aW9uIChyZXNwb25zZSkgey4uLiB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb25OYW1lIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyA9PSBudWxsIHx8IHJlc3VsdHMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeSA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkgfHwge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdlb21ldHJ5LmxvY2F0aW9uIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHJlc3VsdHMgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uLmxhdCA9PSBudWxsIHx8IGxvY2F0aW9uLmxuZyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ubGF0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ubG5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2VuZXJhdGVNYXAoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBlcnJvci4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFyTWFwKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkID0gXy5kZWJvdW5jZShkZWZpbmVDb29yZGluYXRlcywgMjAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgdXNlciBhY3Rpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uZ0Rpc2FibGVkKCkpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25FZGl0RGlhbG9nLnNob3coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiAkc2NvcGUucGlwTG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiAkc2NvcGUucGlwTG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IHJlc3VsdC5sb2NhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lID0gcmVzdWx0LmxvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG8gbm90IGNoYW5nZSBhbnl0aGluZyBpZiBsb2NhdGlvbiBpcyBhYm91dCB0aGUgc2FtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MgJiYgJHNjb3BlLnBpcExvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAkc2NvcGUucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMubGVuZ3RoID09IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbG9jYXRpb24gJiYgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoID09IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCRzY29wZS5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlc1swXSAtIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdKSA8IDAuMDAwMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMV0pIDwgMC4wMDAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChsb2NhdGlvbk5hbWUgPT0gJHNjb3BlLnBpcExvY2F0aW9uTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBsb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09IG51bGwgJiYgbG9jYXRpb24gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25OYW1lID0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyByZXN1bHQubG9jYXRpb24uY29vcmRpbmF0ZXNbMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJywnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdICsgJyknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwQ2hhbmdlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25NYXBDbGljayA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uZ0Rpc2FibGVkKCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8kZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uTWFwS2V5UHJlc3MgPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uZ0Rpc2FibGVkKCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZXZlbnQua2V5Q29kZSA9PSAxMyB8fCAkZXZlbnQua2V5Q29kZSA9PSAzMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBXYXRjaCBmb3IgbG9jYXRpb24gbmFtZSBjaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBMb2NhdGlvbk5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9IG9sZFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBpcExvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLWVkaXQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MpIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBJUCBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGVzIGluIHNhbXBsZXIgYXBwXHJcbiAqL1xyXG4gXHJcbi8qIGdsb2JhbCBhbmd1bGFyLCBnb29nbGUgKi9cclxuXHJcbmRlY2xhcmUgbGV0IGdvb2dsZTogYW55O1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25JcFwiLCBbXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5kaXJlY3RpdmUoJ3BpcExvY2F0aW9uSXAnLFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBJcGFkZHJlc3M6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBFeHRyYUluZm86ICcmJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uSXBDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uSXBDb250cm9sbGVyJyxcclxuICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkaHR0cCkge1xyXG4gICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVNYXAobGF0aXR1ZGUsIGxvbmdpdHVkZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIGlmIChsYXRpdHVkZSA9PSBudWxsIHx8IGxvbmdpdHVkZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGVcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbC5hcHBlbmRUbygkbWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGVmaW5lQ29vcmRpbmF0ZXMoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXBBZGRyZXNzID0gJHNjb3BlLnBpcElwYWRkcmVzcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpcEFkZHJlc3MgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUb2RvOiBGaW5kIG1vcmUgcmVsaWFibGUgZ2VvY29kaW5nIHNlcnZpY2UgdG8gbG9jYXRlIGlwIGFkZHJlc3Nlc1xyXG4gICAgICAgICAgICAgICAgJGh0dHAuanNvbnAoJ2h0dHBzOi8vd3d3Lmdlb3BsdWdpbi5uZXQvanNvbi5ncD9pcD0nICsgaXBBZGRyZXNzICsgJyZqc29uY2FsbGJhY2s9SlNPTl9DQUxMQkFDSycpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgIT0gbnVsbCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzcG9uc2UuZ2VvcGx1Z2luX2xhdGl0dWRlICE9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzcG9uc2UuZ2VvcGx1Z2luX2xvbmdpdHVkZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcChyZXNwb25zZS5nZW9wbHVnaW5fbGF0aXR1ZGUsIHJlc3BvbnNlLmdlb3BsdWdpbl9sb25naXR1ZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5waXBFeHRyYUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleHRyYUluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2l0eTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NpdHksICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25Db2RlOiByZXNwb25zZS5nZW9wbHVnaW5fcmVnaW9uQ29kZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogcmVzcG9uc2UuZ2VvcGx1Z2luX3JlZ2lvbk5hbWUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhQ29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX2FyZWFDb2RlLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9jb3VudHJ5Q29kZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IHJlc3BvbnNlLmdlb3BsdWdpbl9jb3VudHJ5TmFtZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbmVudENvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9jb250aW5lbnRDb2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcEV4dHJhSW5mbyh7IGV4dHJhSW5mbzogZXh0cmFJbmZvIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwSXBhZGRyZXNzKClcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLWlwJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGRlZmluZUNvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBtYXAgY29udHJvbFxyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvbk1hcFwiLCBbXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5kaXJlY3RpdmUoJ3BpcExvY2F0aW9uTWFwJyxcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Qb3M6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvc2l0aW9uczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcEljb25QYXRoOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwRHJhZ2dhYmxlOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwU3RyZXRjaDogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAncGlwTG9jYXRpb25NYXBDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uTWFwQ29udHJvbGxlcicsXHJcbiAgICAgICAgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRwYXJzZScsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSkge1xyXG4gICAgICAgICAgICB2YXJcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKSxcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIHN0cmV0Y2hNYXAgPSAkc2NvcGUucGlwU3RyZXRjaCgpIHx8IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaWNvblBhdGggPSAkc2NvcGUucGlwSWNvblBhdGgoKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0xvY2F0aW9uIChsb2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhKGxvYyA9PSBudWxsXHJcbiAgICAgICAgICAgICAgICB8fCBsb2MuY29vcmRpbmF0ZXMgPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfHwgbG9jLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZXRlcm1pbmVDb29yZGluYXRlcyhsb2MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwb2ludCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwb2ludC5maWxsID0gbG9jLmZpbGw7XHJcbiAgICAgICAgICAgICAgICBwb2ludC5zdHJva2UgPSBsb2Muc3Ryb2tlO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSAkc2NvcGUucGlwTG9jYXRpb25Qb3MoKSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMgPSAkc2NvcGUucGlwTG9jYXRpb25Qb3NpdGlvbnMoKSxcclxuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGUgPSAkc2NvcGUucGlwRHJhZ2dhYmxlKCkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIGlmIChjaGVja0xvY2F0aW9uKGxvY2F0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKGRldGVybWluZUNvb3JkaW5hdGVzKGxvY2F0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbnMgJiYgbG9jYXRpb25zLmxlbmd0aCAmJiBsb2NhdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tMb2NhdGlvbihsb2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzLnB1c2goZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXBcclxuICAgICAgICAgICAgICAgIHZhclxyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogcG9pbnRzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGRyYWdnYWJsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBkcmFnZ2FibGVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbWFya2Vyc1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogaWNvblBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogcG9pbnQuZmlsbCB8fCAnI0VGNTM1MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZTogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IHBvaW50LnN0cm9rZSB8fCAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBvaW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvblBhdGggPyBpY29uIDogbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQocG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXV0by1jb25maWcgb2Ygem9vbSBhbmQgY2VudGVyXHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwTG9jYXRpb25Qb3MoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLW1hcCcpO1xyXG4gICAgICAgICAgICBpZiAoc3RyZXRjaE1hcCkgJG1hcENvbnRhaW5lci5hZGRDbGFzcygnc3RyZXRjaCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zKCkgfHwgJHNjb3BlLnBpcExvY2F0aW9uUG9zaXRpb25zKCkpIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgIGVsc2UgY2xlYXJNYXAoKTtcclxuICAgICAgICB9XVxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcblxyXG4iLCLvu78vKipcclxuICogQGZpbGUgUmVnaXN0cmF0aW9uIG9mIGxvY2F0aW9uIFdlYlVJIGNvbnRyb2xzXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqL1xyXG5cclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucycsIFsgICAgICAgIFxyXG4gICAgICAgICdwaXBMb2NhdGlvbicsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uTWFwJyxcclxuICAgICAgICAncGlwTG9jYXRpb25JcCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uRWRpdCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uRWRpdERpYWxvZydcclxuICAgIF0pO1xyXG4gICAgXHJcbn0pKCk7XHJcblxyXG5cclxuIiwiKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbl9kaWFsb2cuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyBsYXlvdXQtY29sdW1uXCIgbWQtdGhlbWU9XCJ7e3RoZW1lfX1cIj48ZGl2IGNsYXNzPVwicGlwLWhlYWRlciBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1zdGFydC1zdGFydFwiPjxtZC1wcm9ncmVzcy1saW5lYXIgbmctc2hvdz1cInRyYW5zYWN0aW9uLmJ1c3koKVwiIG1kLW1vZGU9XCJpbmRldGVybWluYXRlXCIgY2xhc3M9XCJwaXAtcHJvZ3Jlc3MtdG9wXCI+PC9tZC1wcm9ncmVzcy1saW5lYXI+PGgzIGNsYXNzPVwibTAgdy1zdHJldGNoIGZsZXhcIj57eyBcXCdMT0NBVElPTl9TRVRfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2gzPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtZm9vdGVyXCI+PGRpdiBjbGFzcz1cImxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlclwiPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIm9uQWRkUGluKClcIiBuZy1zaG93PVwibG9jYXRpb25Qb3MgPT0gbnVsbFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVwiPnt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIm9uUmVtb3ZlUGluKClcIiBuZy1zaG93PVwibG9jYXRpb25Qb3MgIT0gbnVsbFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVwiPnt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjwvZGl2PjxkaXYgY2xhc3M9XCJmbGV4XCI+PC9kaXY+PGRpdiBjbGFzcz1cImxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXJcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwib25DYW5jZWwoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0NBTkNFTFxcJyB8IHRyYW5zbGF0ZSB9fVwiPnt7IDo6XFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwib25BcHBseSgpXCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fVwiPnt7IDo6XFwnQVBQTFlcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWJvZHlcIj48ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXpvb20taW5cIiBuZy1jbGljaz1cIm9uWm9vbUluKClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9aT09NX0lOXFwnIHwgdHJhbnNsYXRlIH19XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXpvb20tb3V0XCIgbmctY2xpY2s9XCJvblpvb21PdXQoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fT1VUXFwnIHwgdHJhbnNsYXRlIH19XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51c1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC1zZXQtbG9jYXRpb25cIiBuZy1jbGljaz1cIm9uU2V0TG9jYXRpb24oKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fVwiIG5nLXNob3c9XCJzdXBwb3J0U2V0XCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRhcmdldFwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48L2Rpdj48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1sb2NhdGlvbnMtaHRtbC5taW4uanMubWFwXG4iXX0=