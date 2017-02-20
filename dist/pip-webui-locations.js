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
var LocationDialogService = (function () {
    LocationDialogService.$inject = ['$mdDialog'];
    function LocationDialogService($mdDialog) {
        this._$mdDialog = $mdDialog;
    }
    LocationDialogService.prototype.show = function (params, successCallback, cancelCallback) {
        this._$mdDialog.show({
            controller: 'pipLocationEditDialogController',
            controllerAs: '$ctrl',
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
    };
    return LocationDialogService;
}());
var LocationEditDialogController = (function () {
    LocationEditDialogController.$inject = ['$scope', '$rootScope', '$timeout', '$mdDialog', 'locationPos', 'locationName'];
    function LocationEditDialogController($scope, $rootScope, $timeout, $mdDialog, locationPos, locationName) {
        var _this = this;
        this._map = null;
        this._marker = null;
        this.onSetLocation = function () {
            var _this = this;
            if (this._map == null)
                return;
            navigator.geolocation.getCurrentPosition(function (position) {
                var coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                _this._marker = _this.createMarker(coordinates);
                _this._map.setCenter(coordinates);
                _this._map.setZoom(12);
                _this.changeLocation(coordinates, null);
            }, function () {
                _this.$scope.$apply();
            }, {
                maximumAge: 0,
                enableHighAccuracy: true,
                timeout: 5000
            });
        };
        this._$mdDialog = $mdDialog;
        this._$scope = $scope;
        this.theme = $rootScope['$theme'];
        this.locationPos = locationPos && locationPos.type == 'Point'
            && locationPos.coordinates && locationPos.coordinates.length == 2
            ? locationPos : null;
        this.locationName = locationName;
        this.supportSet = navigator.geolocation != null;
        $timeout(function () {
            var mapContainer = $('.pip-location-edit-dialog .pip-location-container');
            var coordinates = _this.locationPos ?
                new google.maps.LatLng(_this.locationPos.coordinates[0], _this.locationPos.coordinates[1]) : null;
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
            _this._map = new google.maps.Map(mapContainer[0], mapOptions);
            _this._marker = _this.createMarker(coordinates);
            setTimeout(function () {
                google.maps.event.trigger(_this._map, 'resize');
            }, 1000);
        }, 0);
        $scope.$on('pipLayoutResized', function () {
            if (_this._map == null)
                return;
            google.maps.event.trigger(_this._map, 'resize');
        });
    }
    LocationEditDialogController.prototype.createMarker = function (coordinates) {
        var _this = this;
        if (this._marker)
            this._marker.setMap(null);
        if (coordinates) {
            this._marker = new google.maps.Marker({
                position: coordinates,
                map: this._map,
                draggable: true,
                animation: google.maps.Animation.DROP
            });
            var thisMarker_1 = this._marker;
            google.maps.event.addListener(thisMarker_1, 'dragend', function () {
                var coordinates = thisMarker_1.getPosition();
                _this.changeLocation(coordinates, null);
            });
        }
        else {
            this._marker = null;
        }
        return this._marker;
    };
    LocationEditDialogController.prototype.changeLocation = function (coordinates, tid) {
        var _this = this;
        this.locationPos = {
            type: 'Point',
            coordinates: [coordinates.lat(), coordinates.lng()]
        };
        this.locationName = null;
        if (tid == null) {
            if (tid == null)
                return;
        }
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: coordinates }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK && results && results.length > 0) {
                _this.locationName = results[0].formatted_address;
            }
            _this._$scope.$apply();
        });
    };
    LocationEditDialogController.prototype.onAddPin = function () {
        if (this._map == null)
            return;
        var coordinates = this._map.getCenter();
        this._marker = this.createMarker(coordinates);
        this.changeLocation(coordinates, null);
    };
    LocationEditDialogController.prototype.onRemovePin = function () {
        if (this._map == null)
            return;
        this._marker = this.createMarker(null);
        this.locationPos = null;
        this.locationName = null;
    };
    LocationEditDialogController.prototype.onZoomIn = function () {
        if (this._map == null)
            return;
        var zoom = this._map.getZoom();
        this._map.setZoom(zoom + 1);
    };
    LocationEditDialogController.prototype.onZoomOut = function () {
        if (this._map == null)
            return;
        var zoom = this._map.getZoom();
        this._map.setZoom(zoom > 1 ? zoom - 1 : zoom);
    };
    LocationEditDialogController.prototype.onCancel = function () {
        this._$mdDialog.cancel();
    };
    LocationEditDialogController.prototype.onApply = function () {
        this._$mdDialog.hide({
            location: this.locationPos,
            locationPos: this.locationPos,
            locationName: this.locationName
        });
    };
    return LocationEditDialogController;
}());
(function () {
    'use strict';
    LocationDialogRun.$inject = ['$injector'];
    function LocationDialogRun($injector) {
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
    }
    angular.module('pipLocationEditDialog', ['ngMaterial', 'pipLocations.Templates'])
        .run(LocationDialogRun)
        .service('pipLocationEditDialog', LocationDialogService)
        .controller('pipLocationEditDialogController', LocationEditDialogController);
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
    '<md-dialog class="pip-dialog pip-location-edit-dialog layout-column" md-theme="{{$ctrl.theme}}"><div class="pip-header layout-column layout-align-start-start"><md-progress-linear ng-show="$ctrl.transaction.busy()" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h3 class="flex">{{ \'LOCATION_SET_LOCATION\' | translate }}</h3></div><div class="pip-footer"><div class="layout-row layout-align-start-center"><md-button class="md-accent" ng-click="$ctrl.onAddPin()" ng-show="$ctrl.locationPos == null" ng-disabled="$ctrl.transaction.busy()" aria-label="{{ ::\'LOCATION_ADD_PIN\' }}">{{ ::\'LOCATION_ADD_PIN\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onRemovePin()" ng-show="$ctrl.locationPos != null" ng-disabled="$ctrl.transaction.busy()" aria-label="{{ ::\'LOCATION_REMOVE_PIN\' }}">{{ ::\'LOCATION_REMOVE_PIN\' | translate }}</md-button></div><div class="flex"></div><div class="layout-row layout-align-end-center"><md-button ng-click="$ctrl.onCancel()" aria-label="{{ ::\'CANCEL\' }}">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onApply()" ng-disabled="$ctrl.transaction.busy()" aria-label="{{ ::\'APPLY\' }}">{{ ::\'APPLY\' | translate }}</md-button></div></div><div class="pip-body"><div class="pip-location-container"></div><md-button class="md-icon-button md-fab pip-zoom-in" ng-click="$ctrl.onZoomIn()" aria-label="{{ ::\'LOCATION_ZOOM_IN\' }}"><md-icon md-svg-icon="icons:plus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-zoom-out" ng-click="$ctrl.onZoomOut()" aria-label="{{ ::\'LOCATION_ZOOM_OUT\' }}"><md-icon md-svg-icon="icons:minus"></md-icon></md-button><md-button class="md-icon-button md-fab pip-set-location" ng-click="$ctrl.onSetLocation()" aria-label="{{ ::\'LOCATION_SET_LOCATION\' }}" ng-show="supportSet" ng-disabled="transaction.busy()"><md-icon md-svg-icon="icons:target"></md-icon></md-button></div></md-dialog>');
}]);
})();



},{}]},{},[8,1,3,4,5,6,2,7])(8)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvbG9jYXRpb25fZGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2VkaXQvbG9jYXRpb25fZWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9sb2NhdGlvbl9pcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvbG9jYXRpb25fbWFwLnRzIiwic3JjL2xvY2F0aW9ucy50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0VBLENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlELFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsU0FBUztRQUM5QyxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztjQUMxQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUUzQyxNQUFNLENBQUMsVUFBVSxHQUFHO1lBQ2hCLE1BQU0sQ0FBQyxZQUFZLEdBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3BFLENBQUMsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNQTCxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbkQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQzlCO1FBQ0ks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SixDQUFDO1lBQ04sQ0FBQztZQUdELFFBQVEsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUdsRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6RixJQUFJO2dCQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUNMLENBQUM7QUFFTixDQUFDLENBQUMsRUFBRSxDQUFDOztBQzFKTCxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7UUFDM0IsYUFBYTtRQUNiLGdCQUFnQjtRQUNoQixlQUFlO1FBQ2YsdUJBQXVCO1FBQ3ZCLGlCQUFpQjtRQUNqQix3QkFBd0I7S0FDM0IsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNkTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRyYW5zbGF0ZScsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmZpbHRlcigndHJhbnNsYXRlJywgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgIHZhciBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGUnKSBcclxuICAgICAgICAgICAgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGUnKSA6IG51bGw7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXBUcmFuc2xhdGUgID8gcGlwVHJhbnNsYXRlLnRyYW5zbGF0ZShrZXkpIHx8IGtleSA6IGtleTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKCk7XHJcblxyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gY29udHJvbFxyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKiBAdG9kb1xyXG4gKiAtIEltcHJvdmUgc2FtcGxlcyBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuXHJcbi8qIGdsb2JhbCBhbmd1bGFyLCBnb29nbGUgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uXCIsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb24nLCBcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25OYW1lOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Qb3M6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblJlc2l6ZTogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246ICc9J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigkZWxlbWVudCwgJGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwQ29sbGFwc2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWUgbG9jYXRpb24tY29sbGFwc2VcIiBuZy1jbGljaz1cInBpcExvY2F0aW9uUmVzaXplKClcIiBuZy1oaWRlPVwiIXBpcExvY2F0aW9uTmFtZSgpXCInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpsb2NhdGlvblwiIGNsYXNzPVwiZmxleC1maXhlZCBwaXAtaWNvblwiIG5nLWlmPVwicGlwU2hvd0xvY2F0aW9uSWNvblwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dFwiPnt7cGlwTG9jYXRpb25OYW1lKCl9fTwvc3Bhbj4gJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiIG5nLWhpZGU9XCIhcGlwTG9jYXRpb25Qb3MoKVwiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtYnV0dG9uIGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWVcIiBuZy1jbGljaz1cInBpcExvY2F0aW9uUmVzaXplKClcIiAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnbmctY2xhc3M9XCJwaXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgbGF5b3V0LXJvdyB3LXN0cmV0Y2hcIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpsb2NhdGlvblwiIGNsYXNzPVwiZmxleC1maXhlZCBwaXAtaWNvblwiIG5nLWlmPVwicGlwU2hvd0xvY2F0aW9uSWNvblwiPjwvbWQtaWNvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dCBmbGV4XCI+e3twaXBMb2NhdGlvbk5hbWUoKX19PC9zcGFuPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLWRvd25cIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1pZj1cIiFzaG93TWFwXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLXVwXCIgY2xhc3M9XCJmbGV4LWZpeGVkXCIgbmctaWY9XCJzaG93TWFwXCI+PC9tZC1pY29uPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj48L21kLWJ1dHRvbj4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICduZy1jbGFzcz1cInBpcFNob3dMb2NhdGlvbkljb24gPyBcXCdwaXAtbG9jYXRpb24taWNvbi1zcGFjZVxcJyA6IFxcJ1xcJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb250cm9sbGVyKCdwaXBMb2NhdGlvbkNvbnRyb2xsZXInLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICcxJyB8fCB2YWx1ZSA9PSAndHJ1ZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICRuYW1lID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpLFxyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgJHVwID0gJGVsZW1lbnQuZmluZCgnLmljb24tdXAnKSxcclxuICAgICAgICAgICAgICAgICRkb3duID0gJGVsZW1lbnQuZmluZCgnLmljb24tZG93bicpLFxyXG4gICAgICAgICAgICAgICAgY29sbGFwc2FibGUgPSB0b0Jvb2xlYW4oJGF0dHJzLnBpcENvbGxhcHNlKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9ICRzY29wZS5waXBMb2NhdGlvblBvcygpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5zaG93TWFwID09IGZhbHNlIHx8IGxvY2F0aW9uID09IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgIGlmICgkbWFwQ29udHJvbCkgJG1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyB1c2VyIGFjdGlvbnNcclxuICAgICAgICAgICAgaWYgKCFjb2xsYXBzYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNob3dNYXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICR1cC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkbmFtZS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGF0dHJzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dNYXAgPSAhJHNjb3BlLnNob3dNYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgJHVwWyRzY29wZS5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRkb3duWyEkc2NvcGUuc2hvd01hcCA/ICdzaG93JyA6ICdoaWRlJ10oKTtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFdhdGNoIGZvciBsb2NhdGlvbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIGlmICh0b0Jvb2xlYW4oJGF0dHJzLnBpcFJlYmluZCkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goJHNjb3BlLnBpcExvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MoKSkgZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgZWxzZSBjbGVhck1hcCgpO1xyXG4gICAgICAgIH0gICAgXHJcbiAgICApO1xyXG5cclxufSkoKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlIExvY2F0aW9uIGVkaXQgZGlhbG9nXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqIEB0b2RvXHJcbiAqIC0gSW1wcm92ZSBzYW1wbGUgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIsIGdvb2dsZSAqL1xyXG5cclxuY2xhc3MgTG9jYXRpb25EaWFsb2dTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgXyRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLl8kbWREaWFsb2cgPSAkbWREaWFsb2c7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3cgKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuXyRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ3BpcExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICckY3RybCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbG9jYXRpb25fZGlhbG9nL2xvY2F0aW9uX2RpYWxvZy5odG1sJyxcclxuICAgICAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWU6IHBhcmFtcy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogcGFyYW1zLmxvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY2FuY2VsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyIHtcclxuICAgIHByaXZhdGUgX21hcCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9tYXJrZXIgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfJHNjb3BlOiBuZy5JU2NvcGU7XHJcbiAgICBwcml2YXRlIF8kbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2U7XHJcblxyXG4gICAgcHVibGljIHRoZW1lOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgbG9jYXRpb25Qb3M7XHJcbiAgICBwdWJsaWMgbG9jYXRpb25OYW1lO1xyXG4gICAgcHVibGljIHN1cHBvcnRTZXQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgJHNjb3BlOiBuZy5JU2NvcGUsIFxyXG4gICAgICAgICRyb290U2NvcGU6IG5nLklSb290U2NvcGVTZXJ2aWNlLCBcclxuICAgICAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsIFxyXG4gICAgICAgICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZSxcclxuICAgICAgICBsb2NhdGlvblBvcywgXHJcbiAgICAgICAgbG9jYXRpb25OYW1lKSB7XHJcblxyXG4gICAgICAgIHRoaXMuXyRtZERpYWxvZyA9ICRtZERpYWxvZztcclxuICAgICAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICAgICAgdGhpcy50aGVtZSA9ICRyb290U2NvcGVbJyR0aGVtZSddO1xyXG4gICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSBsb2NhdGlvblBvcyAmJiBsb2NhdGlvblBvcy50eXBlID09ICdQb2ludCdcclxuICAgICAgICAgICAgICAgICYmIGxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzICYmIGxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICAgICAgICAgICA/IGxvY2F0aW9uUG9zIDogbnVsbDtcclxuICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IGxvY2F0aW9uTmFtZTtcclxuICAgICAgICB0aGlzLnN1cHBvcnRTZXQgPSBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24gIT0gbnVsbDtcclxuXHJcbiAgICAgICAgIC8vIFdhaXQgdW50aWwgZGlhbG9nIGlzIGluaXRpYWxpemVkXHJcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbWFwQ29udGFpbmVyID0gJCgnLnBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyAucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyXHJcbiAgICAgICAgICAgIGxldCBjb29yZGluYXRlcyA9IHRoaXMubG9jYXRpb25Qb3MgP1xyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICkgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgIGxldCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgem9vbTogMSxcclxuICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuY2VudGVyID0gY29vcmRpbmF0ZXM7XHJcbiAgICAgICAgICAgICAgICBtYXBPcHRpb25zLnpvb20gPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBDb250YWluZXJbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSB0aGlzLmNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRml4IHJlc2l6aW5nIGlzc3VlXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcih0aGlzLl9tYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3BpcExheW91dFJlc2l6ZWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuX21hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlTWFya2VyIChjb29yZGluYXRlcykge1xyXG4gICAgICAgIGlmICh0aGlzLl9tYXJrZXIpIHRoaXMuX21hcmtlci5zZXRNYXAobnVsbCk7XHJcbiAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoeyBcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcywgXHJcbiAgICAgICAgICAgICAgICBtYXA6IHRoaXMuX21hcCxcclxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGhpc01hcmtlciA9IHRoaXMuX21hcmtlcjtcclxuICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzTWFya2VyLmdldFBvc2l0aW9uKCk7IFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcmtlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIHRpZCkge1xyXG4gICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbY29vcmRpbmF0ZXMubGF0KCksIGNvb3JkaW5hdGVzLmxuZygpXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5sb2NhdGlvbk5hbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAodGlkID09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gdGlkID0gJHNjb3BlLnRyYW5zYWN0aW9uLmJlZ2luKCk7XHJcbiAgICAgICAgICAgIGlmICh0aWQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgbGV0IGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGxvY2F0aW9uOiBjb29yZGluYXRlcyB9LCAocmVzdWx0cywgc3RhdHVzKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmICgkc2NvcGUudHJhbnNhY3Rpb24uYWJvcnRlZCh0aWQpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHBvc2l0aXZlIHJlc3BvbnNlXHJcbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0sgJiYgcmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAkc2NvcGUudHJhbnNhY3Rpb24uZW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMuXyRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9uQWRkUGluKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uUmVtb3ZlUGluKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKG51bGwpO1xyXG4gICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25ab29tSW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX21hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25ab29tT3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcclxuICAgICAgICB0aGlzLl9tYXAuc2V0Wm9vbSh6b29tID4gMSA/IHpvb20gLSAxIDogem9vbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX21hcCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdmFyIHRpZCA9ICRzY29wZS50cmFuc2FjdGlvbi5iZWdpbigpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRpZCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgIChwb3NpdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoJHNjb3BlLnRyYW5zYWN0aW9uLmFib3J0ZWQodGlkKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLCBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRDZW50ZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oMTIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHNjb3BlLnRyYW5zYWN0aW9uLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtYXhpbXVtQWdlOiAwLFxyXG4gICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DYW5jZWwoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkFwcGx5KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuXyRtZERpYWxvZy5oaWRlKHtcclxuICAgICAgICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgIGxvY2F0aW9uUG9zOiB0aGlzLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICBsb2NhdGlvbk5hbWU6IHRoaXMubG9jYXRpb25OYW1lICAgXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbn1cclxuXHJcbigoKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBmdW5jdGlvbiBMb2NhdGlvbkRpYWxvZ1J1biAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgbGV0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAocGlwVHJhbnNsYXRlKSB7XHJcbiAgICAgICAgICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICdBZGQgbG9jYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICdTZXQgbG9jYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAnQWRkIHBpbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fUkVNT1ZFX1BJTic6ICdSZW1vdmUgcGluJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGlwVHJhbnNsYXRlLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0LzQtdGB0YLQvtC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ9Ce0L/RgNC10LTQtdC70LjRgtGMINC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICfQlNC+0LHQsNCy0LjRgtGMINGC0L7Rh9C60YMnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAn0KPQsdGA0LDRgtGMINGC0L7Rh9C60YMnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFsnbmdNYXRlcmlhbCcsICAncGlwTG9jYXRpb25zLlRlbXBsYXRlcyddKVxyXG4gICAgICAgICAgIC5ydW4oTG9jYXRpb25EaWFsb2dSdW4pXHJcbiAgICAgICAgICAgLnNlcnZpY2UoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIExvY2F0aW9uRGlhbG9nU2VydmljZSlcclxuICAgICAgICAgICAuY29udHJvbGxlcigncGlwTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlcicsIExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXIgXHJcbiAgICAgICAgLypmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgJG1kRGlhbG9nLCAgbG9jYXRpb25Qb3MsIGxvY2F0aW9uTmFtZSkge1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnRoZW1lID0gJHJvb3RTY29wZS4kdGhlbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IGxvY2F0aW9uUG9zICYmIGxvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50J1xyXG4gICAgICAgICAgICAgICAgJiYgbG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMgJiYgbG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMubGVuZ3RoID09IDJcclxuICAgICAgICAgICAgICAgID8gbG9jYXRpb25Qb3MgOiBudWxsO1xyXG4gICAgICAgICAgICAkc2NvcGUubG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3VwcG9ydFNldCA9IG5hdmlnYXRvci5nZW9sb2NhdGlvbiAhPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gJHNjb3BlLnRyYW5zYWN0aW9uID0gcGlwVHJhbnNhY3Rpb24oJ2xvY2F0aW9uX2VkaXRfZGlhbG9nJywgJHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtYXAgPSBudWxsLCBtYXJrZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlTWFya2VyIChjb29yZGluYXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcmtlcikgbWFya2VyLnNldE1hcChudWxsKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzTWFya2VyID0gbWFya2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXNNYXJrZXIsICdkcmFnZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gdGhpc01hcmtlci5nZXRQb3NpdGlvbigpOyBcclxuICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmtlcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCB0aWQpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbY29vcmRpbmF0ZXMubGF0KCksIGNvb3JkaW5hdGVzLmxuZygpXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRpZCA9ICRzY29wZS50cmFuc2FjdGlvbi5iZWdpbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aWQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlYWQgYWRkcmVzc1xyXG4gICAgICAgICAgICAgICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgbG9jYXRpb246IGNvb3JkaW5hdGVzIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICgkc2NvcGUudHJhbnNhY3Rpb24uYWJvcnRlZCh0aWQpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcG9zaXRpdmUgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk5hbWUgPSByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJHNjb3BlLnRyYW5zYWN0aW9uLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCB1bnRpbCBkaWFsb2cgaXMgaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hcENvbnRhaW5lciA9ICQoJy5waXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyXHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSAkc2NvcGUubG9jYXRpb25Qb3MgP1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvblBvcy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChjb29yZGluYXRlcyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucy5jZW50ZXIgPSBjb29yZGluYXRlcztcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLnpvb20gPSAxMjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcENvbnRhaW5lclswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpeCByZXNpemluZyBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcihtYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ3BpcExheW91dFJlc2l6ZWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcihtYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25BZGRQaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBtYXAuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9uUmVtb3ZlUGluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBjcmVhdGVNYXJrZXIobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25ab29tSW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHZhciB6b29tID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKHpvb20gKyAxKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblpvb21PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwID09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHZhciB6b29tID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKHpvb20gPiAxID8gem9vbSAtIDEgOiB6b29tKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdmFyIHRpZCA9ICRzY29wZS50cmFuc2FjdGlvbi5iZWdpbigpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRpZCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCRzY29wZS50cmFuc2FjdGlvbi5hYm9ydGVkKHRpZCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDEyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHNjb3BlLnRyYW5zYWN0aW9uLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW1BZ2U6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25DYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuY2FuY2VsKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub25BcHBseSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRtZERpYWxvZy5oaWRlKHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbjogJHNjb3BlLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiAkc2NvcGUubG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiAkc2NvcGUubG9jYXRpb25OYW1lICAgXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9Ki9cclxuICAgICk7XHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSBMb2NhdGlvbiBlZGl0IGNvbnRyb2xcclxuICogQGNvcHlyaWdodCBEaWdpdGFsIExpdmluZyBTb2Z0d2FyZSBDb3JwLiAyMDE0LTIwMTZcclxuICogQHRvZG9cclxuICogLSBJbXByb3ZlIHNhbXBsZXMgaW4gc2FtcGxlciBhcHBcclxuICovXHJcbiBcclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uRWRpdFwiLCBbJ3BpcExvY2F0aW9uRWRpdERpYWxvZyddKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25FZGl0JyxcclxuICAgICAgICBmdW5jdGlvbiAoJHBhcnNlLCAkaHR0cCwgcGlwTG9jYXRpb25FZGl0RGlhbG9nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBQycsXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICAgICAgICAgICAgICBuZ0Rpc2FibGVkOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cIm1kLWJsb2NrXCI+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxsYWJlbD57eyBcXCdMT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fTwvbGFiZWw+J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzxpbnB1dCBuZy1tb2RlbD1cInBpcExvY2F0aW9uTmFtZVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJ25nLWRpc2FibGVkPVwibmdEaXNhYmxlZCgpXCIvPjwvbWQtaW5wdXQtY29udGFpbmVyPidcclxuICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWVtcHR5XCIgbGF5b3V0PVwiY29sdW1uXCIgbGF5b3V0LWFsaWduPVwiY2VudGVyIGNlbnRlclwiPidcclxuICAgICAgICAgICAgICAgICAgICArICc8bWQtYnV0dG9uIGNsYXNzPVwibWQtcmFpc2VkXCIgbmctZGlzYWJsZWQ9XCJuZ0Rpc2FibGVkKClcIiBuZy1jbGljaz1cIm9uU2V0TG9jYXRpb24oKVwiJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgJ2FyaWEtbGFiZWw9XCJMT0NBVElPTl9BRERfTE9DQVRJT05cIj4nXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJpY29uLWxvY2F0aW9uXCI+PC9zcGFuPiB7ezo6XFwnTE9DQVRJT05fQUREX0xPQ0FUSU9OXFwnIHwgdHJhbnNsYXRlIH19J1xyXG4gICAgICAgICAgICAgICAgICAgICsgJzwvbWQtYnV0dG9uPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiIHRhYmluZGV4PVwie3sgbmdEaXNhYmxlZCgpID8gLTEgOiAwIH19XCInXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnIG5nLWNsaWNrPVwib25NYXBDbGljaygkZXZlbnQpXCIgbmcta2V5cHJlc3M9XCJcIm9uTWFwS2V5UHJlc3MoJGV2ZW50KVwiPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ21kLWlucHV0LWNvbnRhaW5lcicpLmF0dHIoJ21kLW5vLWZsb2F0JywgISEkc2NvcGUucGlwTG9jYXRpb25Ib2xkZXIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGU6IGFueSwgJGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZW1wdHkgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1lbXB0eScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUb2dnbGUgY29udHJvbCB2aXNpYmlsaXR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZW1wdHkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSAkc2NvcGUucGlwTG9jYXRpb25Qb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGwgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBjb250cm9sIHZpc2liaWxpdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbXB0eS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWZpbmVDb29yZGluYXRlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uTmFtZSA9ICRzY29wZS5waXBMb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAkaHR0cC5nZXQoJ2h0dHA6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2dlb2NvZGUvanNvbj9hZGRyZXNzPScgKyBsb2NhdGlvbk5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHJlc3BvbnNlKSB7IC4uLiB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIC5lcnJvcihmdW5jdGlvbiAocmVzcG9uc2UpIHsuLi4gfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IGxvY2F0aW9uTmFtZSB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMgPT0gbnVsbCB8fCByZXN1bHRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5IHx8IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnZW9tZXRyeS5sb2NhdGlvbiB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBlbXB0eSByZXN1bHRzIGFnYWluXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbi5sYXQgPT0gbnVsbCB8fCBsb2NhdGlvbi5sbmcgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waXBMb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmxhdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmxuZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2dlbmVyYXRlTWFwKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgZXJyb3IuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jbGVhck1hcCgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZCA9IF8uZGVib3VuY2UoZGVmaW5lQ29vcmRpbmF0ZXMsIDIwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubmdEaXNhYmxlZCgpKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uRWRpdERpYWxvZy5zaG93KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogJHNjb3BlLnBpcExvY2F0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogJHNjb3BlLnBpcExvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSByZXN1bHQubG9jYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCBjaGFuZ2UgYW55dGhpbmcgaWYgbG9jYXRpb24gaXMgYWJvdXQgdGhlIHNhbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zICYmICRzY29wZS5waXBMb2NhdGlvblBvcy50eXBlID09ICdQb2ludCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgJHNjb3BlLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGxvY2F0aW9uICYmIGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICgkc2NvcGUucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMF0gLSBsb2NhdGlvbi5jb29yZGluYXRlc1swXSkgPCAwLjAwMDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCRzY29wZS5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlc1sxXSAtIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdKSA8IDAuMDAwMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAobG9jYXRpb25OYW1lID09ICRzY29wZS5waXBMb2NhdGlvbk5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uUG9zID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uTmFtZSA9IGxvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uTmFtZSA9PSBudWxsICYmIGxvY2F0aW9uICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcExvY2F0aW9uTmFtZSA9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICcsJyArIHJlc3VsdC5sb2NhdGlvbi5jb29yZGluYXRlc1sxXSArICcpJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpcENoYW5nZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uTWFwQ2xpY2sgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubmdEaXNhYmxlZCgpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWFwQ29udGFpbmVyWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vbk1hcEtleVByZXNzID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubmdEaXNhYmxlZCgpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGV2ZW50LmtleUNvZGUgPT0gMTMgfHwgJGV2ZW50LmtleUNvZGUgPT0gMzIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIG5hbWUgY2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwTG9jYXRpb25OYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAhPSBvbGRWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBMb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1lZGl0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zKSBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGUgTG9jYXRpb24gSVAgY29udHJvbFxyXG4gKiBAY29weXJpZ2h0IERpZ2l0YWwgTGl2aW5nIFNvZnR3YXJlIENvcnAuIDIwMTQtMjAxNlxyXG4gKiBAdG9kb1xyXG4gKiAtIEltcHJvdmUgc2FtcGxlcyBpbiBzYW1wbGVyIGFwcFxyXG4gKi9cclxuIFxyXG4vKiBnbG9iYWwgYW5ndWxhciwgZ29vZ2xlICovXHJcblxyXG5kZWNsYXJlIGxldCBnb29nbGU6IGFueTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uSXBcIiwgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZGlyZWN0aXZlKCdwaXBMb2NhdGlvbklwJyxcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlwSXBhZGRyZXNzOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwRXh0cmFJbmZvOiAnJidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbklwQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdGhpc01vZHVsZS5jb250cm9sbGVyKCdwaXBMb2NhdGlvbklwQ29udHJvbGxlcicsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJGh0dHApIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKSxcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZU1hcChsYXRpdHVkZSwgbG9uZ2l0dWRlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICAgICAgaWYgKGxhdGl0dWRlID09IG51bGwgfHwgbG9uZ2l0dWRlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgaWYgKCRtYXBDb250cm9sKSAkbWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sLmFwcGVuZFRvKCRtYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICB2YXIgXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PSAnMScgfHwgdmFsdWUgPT0gJ3RydWUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWZpbmVDb29yZGluYXRlcygpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpcEFkZHJlc3MgPSAkc2NvcGUucGlwSXBhZGRyZXNzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlwQWRkcmVzcyA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFRvZG86IEZpbmQgbW9yZSByZWxpYWJsZSBnZW9jb2Rpbmcgc2VydmljZSB0byBsb2NhdGUgaXAgYWRkcmVzc2VzXHJcbiAgICAgICAgICAgICAgICAkaHR0cC5qc29ucCgnaHR0cHM6Ly93d3cuZ2VvcGx1Z2luLm5ldC9qc29uLmdwP2lwPScgKyBpcEFkZHJlc3MgKyAnJmpzb25jYWxsYmFjaz1KU09OX0NBTExCQUNLJylcclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAhPSBudWxsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiByZXNwb25zZS5nZW9wbHVnaW5fbGF0aXR1ZGUgIT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiByZXNwb25zZS5nZW9wbHVnaW5fbG9uZ2l0dWRlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWFwKHJlc3BvbnNlLmdlb3BsdWdpbl9sYXRpdHVkZSwgcmVzcG9uc2UuZ2VvcGx1Z2luX2xvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBpcEV4dHJhSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4dHJhSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiByZXNwb25zZS5nZW9wbHVnaW5fY2l0eSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbkNvZGU6IHJlc3BvbnNlLmdlb3BsdWdpbl9yZWdpb25Db2RlLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiByZXNwb25zZS5nZW9wbHVnaW5fcmVnaW9uTmFtZSwgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFDb2RlOiByZXNwb25zZS5nZW9wbHVnaW5fYXJlYUNvZGUsICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NvdW50cnlDb2RlLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NvdW50cnlOYW1lLCAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGluZW50Q29kZTogcmVzcG9uc2UuZ2VvcGx1Z2luX2NvbnRpbmVudENvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGlwRXh0cmFJbmZvKHsgZXh0cmFJbmZvOiBleHRyYUluZm8gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBXYXRjaCBmb3IgbG9jYXRpb24gY2hhbmdlc1xyXG4gICAgICAgICAgICBpZiAodG9Cb29sZWFuKCRhdHRycy5waXBSZWJpbmQpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5waXBJcGFkZHJlc3MoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZUNvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24taXAnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgZGVmaW5lQ29vcmRpbmF0ZXMoKTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICk7XHJcblxyXG59KSgpO1xyXG5cclxuIiwiLyoqXHJcbiAqIEBmaWxlIExvY2F0aW9uIG1hcCBjb250cm9sXHJcbiAqIEBjb3B5cmlnaHQgRGlnaXRhbCBMaXZpbmcgU29mdHdhcmUgQ29ycC4gMjAxNC0yMDE2XHJcbiAqL1xyXG4gXHJcbi8qIGdsb2JhbCBhbmd1bGFyLCBnb29nbGUgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHRoaXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uTWFwXCIsIFtdKTtcclxuXHJcbiAgICB0aGlzTW9kdWxlLmRpcmVjdGl2ZSgncGlwTG9jYXRpb25NYXAnLFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaXBMb2NhdGlvblBvczogJyYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcExvY2F0aW9uUG9zaXRpb25zOiAnJicsXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwSWNvblBhdGg6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBEcmFnZ2FibGU6ICcmJyxcclxuICAgICAgICAgICAgICAgICAgICBwaXBTdHJldGNoOiAnJidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBMb2NhdGlvbk1hcENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuY29udHJvbGxlcigncGlwTG9jYXRpb25NYXBDb250cm9sbGVyJyxcclxuICAgICAgICBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICB2YXJcclxuICAgICAgICAgICAgICAgICRtYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKSxcclxuICAgICAgICAgICAgICAgICRtYXBDb250cm9sID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIHN0cmV0Y2hNYXAgPSAkc2NvcGUucGlwU3RyZXRjaCgpIHx8IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaWNvblBhdGggPSAkc2NvcGUucGlwSWNvblBhdGgoKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0xvY2F0aW9uIChsb2MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhKGxvYyA9PSBudWxsXHJcbiAgICAgICAgICAgICAgICB8fCBsb2MuY29vcmRpbmF0ZXMgPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfHwgbG9jLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZXRlcm1pbmVDb29yZGluYXRlcyhsb2MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwb2ludCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwb2ludC5maWxsID0gbG9jLmZpbGw7XHJcbiAgICAgICAgICAgICAgICBwb2ludC5zdHJva2UgPSBsb2Muc3Ryb2tlO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gJzEnIHx8IHZhbHVlID09ICd0cnVlJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSAkc2NvcGUucGlwTG9jYXRpb25Qb3MoKSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMgPSAkc2NvcGUucGlwTG9jYXRpb25Qb3NpdGlvbnMoKSxcclxuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGUgPSAkc2NvcGUucGlwRHJhZ2dhYmxlKCkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgICAgIGlmIChjaGVja0xvY2F0aW9uKGxvY2F0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKGRldGVybWluZUNvb3JkaW5hdGVzKGxvY2F0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbnMgJiYgbG9jYXRpb25zLmxlbmd0aCAmJiBsb2NhdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tMb2NhdGlvbihsb2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzLnB1c2goZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgICAgICBpZiAoJG1hcENvbnRyb2wpICRtYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgJG1hcENvbnRyb2wuYXBwZW5kVG8oJG1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXBcclxuICAgICAgICAgICAgICAgIHZhclxyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogcG9pbnRzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGRyYWdnYWJsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBkcmFnZ2FibGVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbWFya2Vyc1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogaWNvblBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogcG9pbnQuZmlsbCB8fCAnI0VGNTM1MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZTogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IHBvaW50LnN0cm9rZSB8fCAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBvaW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvblBhdGggPyBpY29uIDogbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQocG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXV0by1jb25maWcgb2Ygem9vbSBhbmQgY2VudGVyXHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2F0Y2ggZm9yIGxvY2F0aW9uIGNoYW5nZXNcclxuICAgICAgICAgICAgaWYgKHRvQm9vbGVhbigkYXR0cnMucGlwUmViaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUucGlwTG9jYXRpb25Qb3MoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLW1hcCcpO1xyXG4gICAgICAgICAgICBpZiAoc3RyZXRjaE1hcCkgJG1hcENvbnRhaW5lci5hZGRDbGFzcygnc3RyZXRjaCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnBpcExvY2F0aW9uUG9zKCkgfHwgJHNjb3BlLnBpcExvY2F0aW9uUG9zaXRpb25zKCkpICR0aW1lb3V0KGdlbmVyYXRlTWFwLCAyMDApO1xyXG4gICAgICAgICAgICBlbHNlIGNsZWFyTWFwKCk7XHJcbiAgICAgICAgfV1cclxuICAgICk7XHJcblxyXG59KSgpO1xyXG5cclxuIiwi77u/Ly8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zJywgWyAgICAgICAgXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uJyxcclxuICAgICAgICAncGlwTG9jYXRpb25NYXAnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbklwJyxcclxuICAgICAgICAncGlwTG9jYXRpb25FZGl0RGlhbG9nJyxcclxuICAgICAgICAncGlwTG9jYXRpb25FZGl0JyxcclxuICAgICAgICAncGlwTG9jYXRpb25zLlRyYW5zbGF0ZSdcclxuICAgIF0pO1xyXG4gICAgXHJcbn0pKCk7XHJcblxyXG5cclxuIiwiKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbl9kaWFsb2cuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyBsYXlvdXQtY29sdW1uXCIgbWQtdGhlbWU9XCJ7eyRjdHJsLnRoZW1lfX1cIj48ZGl2IGNsYXNzPVwicGlwLWhlYWRlciBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1zdGFydC1zdGFydFwiPjxtZC1wcm9ncmVzcy1saW5lYXIgbmctc2hvdz1cIiRjdHJsLnRyYW5zYWN0aW9uLmJ1c3koKVwiIG1kLW1vZGU9XCJpbmRldGVybWluYXRlXCIgY2xhc3M9XCJwaXAtcHJvZ3Jlc3MtdG9wXCI+PC9tZC1wcm9ncmVzcy1saW5lYXI+PGgzIGNsYXNzPVwiZmxleFwiPnt7IFxcJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fTwvaDM+PC9kaXY+PGRpdiBjbGFzcz1cInBpcC1mb290ZXJcIj48ZGl2IGNsYXNzPVwibGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25BZGRQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyA9PSBudWxsXCIgbmctZGlzYWJsZWQ9XCIkY3RybC50cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9BRERfUElOXFwnIH19XCI+e3sgOjpcXCdMT0NBVElPTl9BRERfUElOXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25SZW1vdmVQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyAhPSBudWxsXCIgbmctZGlzYWJsZWQ9XCIkY3RybC50cmFuc2FjdGlvbi5idXN5KClcIiBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9SRU1PVkVfUElOXFwnIH19XCI+e3sgOjpcXCdMT0NBVElPTl9SRU1PVkVfUElOXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PC9kaXY+PGRpdiBjbGFzcz1cImZsZXhcIj48L2Rpdj48ZGl2IGNsYXNzPVwibGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlclwiPjxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5vbkNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnQ0FOQ0VMXFwnIH19XCI+e3sgOjpcXCdDQU5DRUxcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCIkY3RybC5vbkFwcGx5KClcIiBuZy1kaXNhYmxlZD1cIiRjdHJsLnRyYW5zYWN0aW9uLmJ1c3koKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0FQUExZXFwnIH19XCI+e3sgOjpcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtYm9keVwiPjxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtem9vbS1pblwiIG5nLWNsaWNrPVwiJGN0cmwub25ab29tSW4oKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fSU5cXCcgfX1cIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtem9vbS1vdXRcIiBuZy1jbGljaz1cIiRjdHJsLm9uWm9vbU91dCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fWk9PTV9PVVRcXCcgfX1cIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOm1pbnVzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXNldC1sb2NhdGlvblwiIG5nLWNsaWNrPVwiJGN0cmwub25TZXRMb2NhdGlvbigpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fU0VUX0xPQ0FUSU9OXFwnIH19XCIgbmctc2hvdz1cInN1cHBvcnRTZXRcIiBuZy1kaXNhYmxlZD1cInRyYW5zYWN0aW9uLmJ1c3koKVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dGFyZ2V0XCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjwvZGl2PjwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLm1pbi5qcy5tYXBcbiJdfQ==