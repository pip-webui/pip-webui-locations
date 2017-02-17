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

//# sourceMappingURL=pip-webui-locations.js.map
