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
        console.log('pipLocationController');
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
        console.log('pipLocationEditDialogController');
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
            controller: ['$scope', '$element', function ($scope, $element) {
                $element.find('md-input-container').attr('md-no-float', !!$scope.pipLocationHolder);
            }],
            link: function ($scope, $element) {
                console.log('pipLocationEdit');
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
        console.log('pipLocationIpController');
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
    '<md-dialog class="pip-dialog pip-location-edit-dialog layout-column" md-theme="{{theme}}"><div class="pip-header layout-column layout-align-start-start"><md-progress-linear ng-show="transaction.busy()" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h3 class="m0 w-stretch flex">{{ \'LOCATION_SET_LOCATION\' }}</h3></div><div class="pip-footer"><div class="layout-row layout-align-start-center"><md-button class="md-accent" ng-click="onAddPin()" ng-show="locationPos == null" ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_ADD_PIN\' }}">{{ ::\'LOCATION_ADD_PIN\' }}</md-button><md-button class="md-accent" ng-click="onRemovePin()" ng-show="locationPos != null" ng-disabled="transaction.busy()" aria-label="{{ ::\'LOCATION_REMOVE_PIN\' }}">{{ ::\'LOCATION_REMOVE_PIN\' }}</md-button></div><div class="flex"></div><div class="layout-row layout-align-end-center"><md-button ng-click="onCancel()" aria-label="{{ ::\'CANCEL\' }}">{{ ::\'CANCEL\' }}</md-button><md-button class="md-accent" ng-click="onApply()" ng-disabled="transaction.busy()" aria-label="{{ ::\'APPLY\' }}">{{ ::\'APPLY\' }}</md-button></div></div><div class="pip-body"><div class="pip-location-container"></div><md-button class="md-icon-button md-fab pip-zoom-in" ng-click="onZoomIn()" aria-label="{{ ::\'LOCATION_ZOOM_IN\' }}"><md-icon md-svg-icon="icons:plus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-zoom-out" ng-click="onZoomOut()" aria-label="{{ ::\'LOCATION_ZOOM_OUT\' }}"><md-icon md-svg-icon="icons:minus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-set-location" ng-click="onSetLocation()" aria-label="{{ ::\'LOCATION_SET_LOCATION\' }}" ng-show="supportSet" ng-disabled="transaction.busy()"><md-icon md-svg-icon="icons:target"></md-icon></md-button></div></md-dialog>');
}]);
})();



},{}]},{},[8,1,3,4,5,6,2,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2VkaXQvbG9jYXRpb25fZWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9sb2NhdGlvbl9pcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvbG9jYXRpb25fbWFwLnRzIiwic3JjL2xvY2F0aW9ucy50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0VBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlELFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsU0FBUztRQUM5QyxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztjQUMxQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUUzQyxNQUFNLENBQUMsVUFBVSxHQUFHO1lBQ2hCLE1BQU0sQ0FBQyxZQUFZLEdBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3BFLENBQUMsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNQTCxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbkQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQzlCO1FBQ0ks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QUM7Z0JBQ2xCLENBQUMsQ0FDSixDQUFDO1lBQ04sQ0FBQztZQUdELFFBQVEsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUdsRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUUsSUFBSTtnQkFBQyxRQUFRLEVBQUUsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FDTCxDQUFDO0FBRU4sQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNySkwsQ0FBQztJQUNHLFlBQVksQ0FBQztJQUViLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1FBQzNCLGFBQWE7UUFDYixnQkFBZ0I7UUFDaEIsZUFBZTtRQUNmLHVCQUF1QjtRQUN2QixpQkFBaUI7UUFDakIsd0JBQXdCO0tBQzNCLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxFQUFFLENBQUM7O0FDbkJMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJywgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZmlsdGVyKCd0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpIFxyXG4gICAgICAgICAgICA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcFRyYW5zbGF0ZSAgPyBwaXBUcmFuc2xhdGUudHJhbnNsYXRlKGtleSkgfHwga2V5IDoga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGVzIGluIHNhbXBsZXIgYXBwXHJcbiAqL1xyXG5cclxuLyogZ2xvYmFsIGFuZ3VsYXIsIGdvb2dsZSAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25cIiwgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZGlyZWN0aXZlKCdwaXBMb2NhdGlvbicsIFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvbk5hbWU6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUmVzaXplOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogJz0nXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRlbGVtZW50LCAkYXR0cnM6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PSAnMScgfHwgdmFsdWUgPT0gJ3RydWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9Cb29sZWFuKCRhdHRycy5waXBDb2xsYXBzZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tbmFtZSBibTBcIiBuZy1jbGljaz1cInBpcExvY2F0aW9uUmVzaXplKClcIiBuZy1oaWRlPVwiIXBpcExvY2F0aW9uTmFtZSgpXCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwnbHAyNC1mbGV4IHJwMTZcXCcgOiBcXCdcXCdcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpsb2NhdGlvblwiIGNsYXNzPVwiZmxleC1maXhlZCBwaXAtaWNvblwiIG5nLWlmPVwicGlwU2hvd0xvY2F0aW9uSWNvblwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dFwiPnt7cGlwTG9jYXRpb25OYW1lKCl9fTwvc3Bhbj4gJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lciBibThcIiBuZy1oaWRlPVwiIXBpcExvY2F0aW9uUG9zKClcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWJ1dHRvbiBjbGFzcz1cInBpcC1sb2NhdGlvbi1uYW1lXCIgbmctY2xpY2s9XCJwaXBMb2NhdGlvblJlc2l6ZSgpXCIgJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJ25nLWNsYXNzPVwicGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ2xwMjQtZmxleCBycDE2XFwnIDogXFwnXFwnXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGxheW91dC1yb3cgdy1zdHJldGNoXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cInBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuIGNsYXNzPVwicGlwLWxvY2F0aW9uLXRleHQgZmxleFwiPnt7cGlwTG9jYXRpb25OYW1lKCl9fTwvc3Bhbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp0cmlhbmdsZS1kb3duXCIgY2xhc3M9XCJmbGV4LWZpeGVkXCIgbmctaWY9XCIhc2hvd01hcFwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp0cmlhbmdsZS11cFwiIGNsYXNzPVwiZmxleC1maXhlZFwiIG5nLWlmPVwic2hvd01hcFwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+PC9tZC1idXR0b24+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyIGJtOFwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJ25nLWNsYXNzPVwicGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ2xtMjQtZmxleCBybTI0LWZsZXhcXCcgOiBcXCdcXCdcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbkNvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuY29udHJvbGxlcigncGlwTG9jYXRpb25Db250cm9sbGVyJyxcclxuICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwaXBMb2NhdGlvbkNvbnRyb2xsZXInKTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgJG5hbWUgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1uYW1lJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICAkdXAgPSAkZWxlbWVudC5maW5kKCcuaWNvbi11cCcpLFxyXG4gICAgICAgICAgICAgICAgJGRvd24gPSAkZWxlbWVudC5maW5kKCcuaWNvbi1kb3duJyksXHJcbiAgICAgICAgICAgICAgICBjb2xsYXBzYWJsZSA9IHRvQm9vbGVhbigkYXR0cnMucGlwQ29sbGFwc2UpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnNob3dNYXAgPT0gZmFsc2UgfHwgbG9jYXRpb24gPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAoIWNvbGxhcHNhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd01hcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHVwLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICRuYW1lLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkYXR0cnMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd01hcCA9ICEkc2NvcGUuc2hvd01hcDtcclxuICAgICAgICAgICAgICAgICAgICAkdXBbJHNjb3BlLnNob3dNYXAgPyAnc2hvdycgOiAnaGlkZSddKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvd25bISRzY29wZS5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaCgkc2NvcGUucGlwTG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcygpKSBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICBlbHNlIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgfSAgICBcclxuICAgICk7XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gZWRpdCBkaWFsb2dcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZSBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0aGlzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFxyXG4gICAgICAgIFsnbmdNYXRlcmlhbCcsICAncGlwTG9jYXRpb25zLlRlbXBsYXRlcyddKTtcclxuXHJcbiAgICAvLyB0aGlzTW9kdWxlLmNvbmZpZyhmdW5jdGlvbihwaXBUcmFuc2xhdGVQcm92aWRlcikge1xyXG4gICAgLy8gICAgIHBpcFRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygnZW4nLCB7XHJcbiAgICAvLyAgICAgICAgICdMT0NBVElPTl9BRERfTE9DQVRJT04nOiAnQWRkIGxvY2F0aW9uJyxcclxuICAgIC8vICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICdTZXQgbG9jYXRpb24nLFxyXG4gICAgLy8gICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICdBZGQgcGluJyxcclxuICAgIC8vICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAnUmVtb3ZlIHBpbidcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vICAgICBwaXBUcmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgLy8gICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0LzQtdGB0YLQvtC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAvLyAgICAgICAgICdMT0NBVElPTl9TRVRfTE9DQVRJT04nOiAn0J7Qv9GA0LXQtNC10LvQuNGC0Ywg0L/QvtC70L7QttC10L3QuNC1JyxcclxuICAgIC8vICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAn0JTQvtCx0LDQstC40YLRjCDRgtC+0YfQutGDJyxcclxuICAgIC8vICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAn0KPQsdGA0LDRgtGMINGC0L7Rh9C60YMnXHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmZhY3RvcnkoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRtZERpYWxvZykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbl9kaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBwYXJhbXMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6IHBhcmFtcy5sb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuY29udHJvbGxlcigncGlwTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlcicsIFxyXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCAkbWREaWFsb2csICBsb2NhdGlvblBvcywgbG9jYXRpb25OYW1lKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGlwTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlcicpO1xyXG4gICAgICAgICAgICAkc2NvcGUudGhlbWUgPSAkcm9vdFNjb3BlLiR0aGVtZTtcclxuICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zID0gbG9jYXRpb25Qb3MgJiYgbG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnXHJcbiAgICAgICAgICAgICAgICAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcyAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMlxyXG4gICAgICAgICAgICAgICAgPyBsb2NhdGlvblBvcyA6IG51bGw7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zdXBwb3J0U2V0ID0gbmF2aWdhdG9yLmdlb2xvY2F0aW9uICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyAkc2NvcGUudHJhbnNhY3Rpb24gPSBwaXBUcmFuc2FjdGlvbignbG9jYXRpb25fZWRpdF9kaWFsb2cnLCAkc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcCA9IG51bGwsIG1hcmtlciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXJrZXIgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFya2VyKSBtYXJrZXIuc2V0TWFwKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNNYXJrZXIgPSBtYXJrZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSB0aGlzTWFya2VyLmdldFBvc2l0aW9uKCk7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFya2VyO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtjb29yZGluYXRlcy5sYXQoKSwgY29vcmRpbmF0ZXMubG5nKCldXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRpZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpZCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBsb2NhdGlvbjogY29vcmRpbmF0ZXMgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCRzY29wZS50cmFuc2FjdGlvbi5hYm9ydGVkKHRpZCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBwb3NpdGl2ZSByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0tcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAkc2NvcGUudHJhbnNhY3Rpb24uZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IHVudGlsIGRpYWxvZyBpcyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFwQ29udGFpbmVyID0gJCgnLnBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyAucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXJcclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9ICRzY29wZS5sb2NhdGlvblBvcyA/XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGNvb3JkaW5hdGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuem9vbSA9IDEyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQ29udGFpbmVyWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRml4IHJlc2l6aW5nIGlzc3VlXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTGF5b3V0UmVzaXplZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vbkFkZFBpbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG1hcC5nZXRDZW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25SZW1vdmVQaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IGNyZWF0ZU1hcmtlcihudWxsKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblpvb21JbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSArIDEpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uWm9vbU91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSA+IDEgPyB6b29tIC0gMSA6IHpvb20pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAodGlkID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoJHNjb3BlLnRyYW5zYWN0aW9uLmFib3J0ZWQodGlkKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICRzY29wZS50cmFuc2FjdGlvbi5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uQ2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uQXBwbHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246ICRzY29wZS5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogJHNjb3BlLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogJHNjb3BlLmxvY2F0aW9uTmFtZSAgIFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBlZGl0IGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZXMgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uRWRpdFwiLCBbJ3BpcExvY2F0aW9uRWRpdERpYWxvZyddKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25FZGl0JyxcclxuICAgICAgICBmdW5jdGlvbiAoJHBhcnNlLCAkaHR0cCwgcGlwTG9jYXRpb25FZGl0RGlhbG9nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBQycsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICAgICAgICAgICAgICBuZ0Rpc2FibGVkOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cIm1kLWJsb2NrXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxsYWJlbD57eyBcXCdMT0NBVElPTlxcJyAgfX08L2xhYmVsPidcclxuICAgICAgICAgICAgICAgICAgICArICc8aW5wdXQgbmctbW9kZWw9XCJwaXBMb2NhdGlvbk5hbWVcIidcclxuICAgICAgICAgICAgICAgICAgICArICduZy1kaXNhYmxlZD1cIm5nRGlzYWJsZWQoKVwiLz48L21kLWlucHV0LWNvbnRhaW5lcj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1lbXB0eVwiIGxheW91dD1cImNvbHVtblwiIGxheW91dC1hbGlnbj1cImNlbnRlciBjZW50ZXJcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLXJhaXNlZFwiIG5nLWRpc2FibGVkPVwibmdEaXNhYmxlZCgpXCIgbmctY2xpY2s9XCJvblNldExvY2F0aW9uKClcIidcclxuICAgICAgICAgICAgICAgICAgICArICdhcmlhLWxhYmVsPVwiTE9DQVRJT05fQUREX0xPQ0FUSU9OXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxzcGFuIGNsYXNzPVwiaWNvbi1sb2NhdGlvblwiPjwvc3Bhbj4ge3s6OlxcJ0xPQ0FUSU9OX0FERF9MT0NBVElPTlxcJyB9fSdcclxuICAgICAgICAgICAgICAgICAgICArICc8L21kLWJ1dHRvbj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIiB0YWJpbmRleD1cInt7IG5nRGlzYWJsZWQoKSA/IC0xIDogMCB9fVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJyBuZy1jbGljaz1cIm9uTWFwQ2xpY2soJGV2ZW50KVwiIG5nLWtleXByZXNzPVwiXCJvbk1hcEtleVByZXNzKCRldmVudClcIj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCdtZC1pbnB1dC1jb250YWluZXInKS5hdHRyKCdtZC1uby1mbG9hdCcsICEhJHNjb3BlLnBpcExvY2F0aW9uSG9sZGVyKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlOiBhbnksICRlbGVtZW50KSB7XHJcbmNvbnNvbGUubG9nKCdwaXBMb2NhdGlvbkVkaXQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbXB0eSA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWVtcHR5JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBjb250cm9sIHZpc2liaWxpdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbXB0eS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9ICRzY29wZS5waXBMb2NhdGlvblBvcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uID09IG51bGwgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMgPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9nZ2xlIGNvbnRyb2wgdmlzaWJpbGl0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGVtcHR5LmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBtYXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udHJvbC5hcHBlbmRUbygkbWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25OYW1lID0gJHNjb3BlLnBpcExvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbk5hbWUgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICRodHRwLmdldCgnaHR0cDovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvZ2VvY29kZS9qc29uP2FkZHJlc3M9JyArIGxvY2F0aW9uTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAuc3VjY2VzcyhmdW5jdGlvbiAocmVzcG9uc2UpIHsgLi4uIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgLmVycm9yKGZ1bmN0aW9uIChyZXNwb25zZSkgey4uLiB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb25OYW1lIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyA9PSBudWxsIHx8IHJlc3VsdHMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeSA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkgfHwge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdlb21ldHJ5LmxvY2F0aW9uIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHJlc3VsdHMgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uLmxhdCA9PSBudWxsIHx8IGxvY2F0aW9uLmxuZyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ubGF0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ubG5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2VuZXJhdGVNYXAoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBlcnJvci4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFyTWFwKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkID0gXy5kZWJvdW5jZShkZWZpbmVDb29yZGluYXRlcywgMjAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgdXNlciBhY3Rpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uZ0Rpc2FibGVkKCkpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25FZGl0RGlhbG9nLnNob3coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiAkc2NvcGUucGlwTG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiAkc2NvcGUucGlwTG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IHJlc3VsdC5sb2NhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lID0gcmVzdWx0LmxvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG8gbm90IGNoYW5nZSBhbnl0aGluZyBpZiBsb2NhdGlvbiBpcyBhYm91dCB0aGUgc2FtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MgJiYgJHNjb3BlLnBpcExvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAkc2NvcGUucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMubGVuZ3RoID09IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbG9jYXRpb24gJiYgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoID09IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCRzY29wZS5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlc1swXSAtIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdKSA8IDAuMDAwMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMV0pIDwgMC4wMDAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChsb2NhdGlvbk5hbWUgPT0gJHNjb3BlLnBpcExvY2F0aW9uTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBsb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09IG51bGwgJiYgbG9jYXRpb24gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25OYW1lID0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyByZXN1bHQubG9jYXRpb24uY29vcmRpbmF0ZXNbMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJywnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdICsgJyknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwQ2hhbmdlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25NYXBDbGljayA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uZ0Rpc2FibGVkKCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8kZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uTWFwS2V5UHJlc3MgPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uZ0Rpc2FibGVkKCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZXZlbnQua2V5Q29kZSA9PSAxMyB8fCAkZXZlbnQua2V5Q29kZSA9PSAzMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uU2V0TG9jYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBXYXRjaCBmb3IgbG9jYXRpb24gbmFtZSBjaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBMb2NhdGlvbk5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9IG9sZFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBpcExvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLWVkaXQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MpIGdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBJUCBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGVzIGluIHNhbXBsZXIgYXBwXHJcbiAqL1xyXG4gXHJcbi8qIGdsb2JhbCBhbmd1bGFyLCBnb29nbGUgKi9cclxuXHJcbmRlY2xhcmUgbGV0IGdvb2dsZTogYW55O1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25JcFwiLCBbXSk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5kaXJlY3RpdmUoJ3BpcExvY2F0aW9uSXAnLFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBJcGFkZHJlc3M6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBFeHRyYUluZm86ICcmJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uSXBDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmNvbnRyb2xsZXIoJ3BpcExvY2F0aW9uSXBDb250cm9sbGVyJyxcclxuICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkaHR0cCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGlwTG9jYXRpb25JcENvbnRyb2xsZXInKTtcclxuICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpLFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKGxhdGl0dWRlLCBsb25naXR1ZGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICBpZiAobGF0aXR1ZGUgPT0gbnVsbCB8fCBsb25naXR1ZGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICcxJyB8fCB2YWx1ZSA9PSAndHJ1ZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGlwQWRkcmVzcyA9ICRzY29wZS5waXBJcGFkZHJlc3MoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXBBZGRyZXNzID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVG9kbzogRmluZCBtb3JlIHJlbGlhYmxlIGdlb2NvZGluZyBzZXJ2aWNlIHRvIGxvY2F0ZSBpcCBhZGRyZXNzZXNcclxuICAgICAgICAgICAgICAgICRodHRwLmpzb25wKCdodHRwczovL3d3dy5nZW9wbHVnaW4ubmV0L2pzb24uZ3A/aXA9JyArIGlwQWRkcmVzcyArICcmanNvbmNhbGxiYWNrPUpTT05fQ0FMTEJBQ0snKVxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICE9IG51bGwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHJlc3BvbnNlLmdlb3BsdWdpbl9sYXRpdHVkZSAhPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHJlc3BvbnNlLmdlb3BsdWdpbl9sb25naXR1ZGUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNYXAocmVzcG9uc2UuZ2VvcGx1Z2luX2xhdGl0dWRlLCByZXNwb25zZS5nZW9wbHVnaW5fbG9uZ2l0dWRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUucGlwRXh0cmFJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXh0cmFJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHk6IHJlc3BvbnNlLmdlb3BsdWdpbl9jaXR5LCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uQ29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX3JlZ2lvbkNvZGUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IHJlc3BvbnNlLmdlb3BsdWdpbl9yZWdpb25OYW1lLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYUNvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9hcmVhQ29kZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlOiByZXNwb25zZS5nZW9wbHVnaW5fY291bnRyeUNvZGUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5OiByZXNwb25zZS5nZW9wbHVnaW5fY291bnRyeU5hbWUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW5lbnRDb2RlOiByZXNwb25zZS5nZW9wbHVnaW5fY29udGluZW50Q29kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBFeHRyYUluZm8oeyBleHRyYUluZm86IGV4dHJhSW5mbyB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFdhdGNoIGZvciBsb2NhdGlvbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIGlmICh0b0Jvb2xlYW4oJGF0dHJzLnBpcFJlYmluZCkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBpcElwYWRkcmVzcygpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lQ29vcmRpbmF0ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1pcCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBkZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgKTtcclxuXHJcbn0pKCk7XHJcblxyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gbWFwIGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIsIGdvb2dsZSAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25NYXBcIiwgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZGlyZWN0aXZlKCdwaXBMb2NhdGlvbk1hcCcsXHJcbiAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Qb3NpdGlvbnM6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBJY29uUGF0aDogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcERyYWdnYWJsZTogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcFN0cmV0Y2g6ICcmJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uTWFwQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb250cm9sbGVyKCdwaXBMb2NhdGlvbk1hcENvbnRyb2xsZXInLFxyXG4gICAgICAgIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckcGFyc2UnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkcGFyc2UpIHtcclxuICAgICAgICAgICAgdmFyXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzdHJldGNoTWFwID0gJHNjb3BlLnBpcFN0cmV0Y2goKSB8fCBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGljb25QYXRoID0gJHNjb3BlLnBpcEljb25QYXRoKCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tMb2NhdGlvbiAobG9jKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIShsb2MgPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfHwgbG9jLmNvb3JkaW5hdGVzID09IG51bGxcclxuICAgICAgICAgICAgICAgIHx8IGxvYy5jb29yZGluYXRlcy5sZW5ndGggPCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcG9pbnQgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcG9pbnQuZmlsbCA9IGxvYy5maWxsO1xyXG4gICAgICAgICAgICAgICAgcG9pbnQuc3Ryb2tlID0gbG9jLnN0cm9rZTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICcxJyB8fCB2YWx1ZSA9PSAndHJ1ZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zID0gJHNjb3BlLnBpcExvY2F0aW9uUG9zaXRpb25zKCksXHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlID0gJHNjb3BlLnBpcERyYWdnYWJsZSgpIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tMb2NhdGlvbihsb2NhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaChkZXRlcm1pbmVDb29yZGluYXRlcyhsb2NhdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25zICYmIGxvY2F0aW9ucy5sZW5ndGggJiYgbG9jYXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGxvYykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrTG9jYXRpb24obG9jKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKGRldGVybWluZUNvb3JkaW5hdGVzKGxvYykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwXHJcbiAgICAgICAgICAgICAgICB2YXJcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHBvaW50c1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBkcmFnZ2FibGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZHJhZ2dhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKSxcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIG1hcmtlcnNcclxuICAgICAgICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGljb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGljb25QYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IHBvaW50LmZpbGwgfHwgJyNFRjUzNTAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiBwb2ludC5zdHJva2UgfHwgJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiA1XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb2ludCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25QYXRoID8gaWNvbiA6IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKHBvaW50KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEF1dG8tY29uZmlnIG9mIHpvb20gYW5kIGNlbnRlclxyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFdhdGNoIGZvciBsb2NhdGlvbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIGlmICh0b0Jvb2xlYW4oJGF0dHJzLnBpcFJlYmluZCkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBpcExvY2F0aW9uUG9zKClcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1tYXAnKTtcclxuICAgICAgICAgICAgaWYgKHN0cmV0Y2hNYXApICRtYXBDb250YWluZXIuYWRkQ2xhc3MoJ3N0cmV0Y2gnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5waXBMb2NhdGlvblBvcygpIHx8ICRzY29wZS5waXBMb2NhdGlvblBvc2l0aW9ucygpKSBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICBlbHNlIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgfV1cclxuICAgICk7XHJcblxyXG59KSgpO1xyXG5cclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlIFJlZ2lzdHJhdGlvbiBvZiBsb2NhdGlvbiBXZWJVSSBjb250cm9sc1xyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKi9cclxuXHJcbi8qIGdsb2JhbCBhbmd1bGFyICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMnLCBbICAgICAgICBcclxuICAgICAgICAncGlwTG9jYXRpb24nLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbk1hcCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uSXAnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbkVkaXQnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJ1xyXG4gICAgXSk7XHJcbiAgICBcclxufSkoKTtcclxuXHJcblxyXG4iLCIoZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb25fZGlhbG9nL2xvY2F0aW9uX2RpYWxvZy5odG1sJyxcbiAgICAnPG1kLWRpYWxvZyBjbGFzcz1cInBpcC1kaWFsb2cgcGlwLWxvY2F0aW9uLWVkaXQtZGlhbG9nIGxheW91dC1jb2x1bW5cIiBtZC10aGVtZT1cInt7dGhlbWV9fVwiPjxkaXYgY2xhc3M9XCJwaXAtaGVhZGVyIGxheW91dC1jb2x1bW4gbGF5b3V0LWFsaWduLXN0YXJ0LXN0YXJ0XCI+PG1kLXByb2dyZXNzLWxpbmVhciBuZy1zaG93PVwidHJhbnNhY3Rpb24uYnVzeSgpXCIgbWQtbW9kZT1cImluZGV0ZXJtaW5hdGVcIiBjbGFzcz1cInBpcC1wcm9ncmVzcy10b3BcIj48L21kLXByb2dyZXNzLWxpbmVhcj48aDMgY2xhc3M9XCJtMCB3LXN0cmV0Y2ggZmxleFwiPnt7IFxcJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTlxcJyB9fTwvaDM+PC9kaXY+PGRpdiBjbGFzcz1cInBpcC1mb290ZXJcIj48ZGl2IGNsYXNzPVwibGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwib25BZGRQaW4oKVwiIG5nLXNob3c9XCJsb2NhdGlvblBvcyA9PSBudWxsXCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9BRERfUElOXFwnIH19XCI+e3sgOjpcXCdMT0NBVElPTl9BRERfUElOXFwnIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwib25SZW1vdmVQaW4oKVwiIG5nLXNob3c9XCJsb2NhdGlvblBvcyAhPSBudWxsXCIgbmctZGlzYWJsZWQ9XCJ0cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9SRU1PVkVfUElOXFwnIH19XCI+e3sgOjpcXCdMT0NBVElPTl9SRU1PVkVfUElOXFwnIH19PC9tZC1idXR0b24+PC9kaXY+PGRpdiBjbGFzcz1cImZsZXhcIj48L2Rpdj48ZGl2IGNsYXNzPVwibGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlclwiPjxtZC1idXR0b24gbmctY2xpY2s9XCJvbkNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnQ0FOQ0VMXFwnIH19XCI+e3sgOjpcXCdDQU5DRUxcXCcgfX08L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCJvbkFwcGx5KClcIiBuZy1kaXNhYmxlZD1cInRyYW5zYWN0aW9uLmJ1c3koKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0FQUExZXFwnIH19XCI+e3sgOjpcXCdBUFBMWVxcJyB9fTwvbWQtYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtYm9keVwiPjxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtem9vbS1pblwiIG5nLWNsaWNrPVwib25ab29tSW4oKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fSU5cXCcgfX1cIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtem9vbS1vdXRcIiBuZy1jbGljaz1cIm9uWm9vbU91dCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fWk9PTV9PVVRcXCcgfX1cIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOm1pbnVzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXNldC1sb2NhdGlvblwiIG5nLWNsaWNrPVwib25TZXRMb2NhdGlvbigpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fU0VUX0xPQ0FUSU9OXFwnIH19XCIgbmctc2hvdz1cInN1cHBvcnRTZXRcIiBuZy1kaXNhYmxlZD1cInRyYW5zYWN0aW9uLmJ1c3koKVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dGFyZ2V0XCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjwvZGl2PjwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcy5tYXBcbiJdfQ==