(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).locations = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
{
    translateFilter.$inject = ['$injector'];
    function translateFilter($injector) {
        var pipTranslate = $injector.has('pipTranslate')
            ? $injector.get('pipTranslate') : null;
        return function (key) {
            return pipTranslate ? pipTranslate.translate(key) || key : key;
        };
    }
    angular
        .module('pipLocations.Translate', [])
        .filter('translate', translateFilter);
}
},{}],2:[function(require,module,exports){
angular.module('pipLocations', [
    'pipLocation',
    'pipLocationMap',
    'pipLocationIp',
    'pipLocationEditDialog',
    'pipLocationEdit',
    'pipLocations.Translate'
]);
},{}],3:[function(require,module,exports){
{
    var LocationBindings = {
        pipLocationName: '<',
        pipLocationPos: '<',
        pipShowLocationIcon: '<',
        pipCollapse: '<',
        pipRebind: '<',
        pipDisabled: '<',
        pipLocationResize: '&'
    };
    var LocationBindingsChanges = (function () {
        function LocationBindingsChanges() {
        }
        return LocationBindingsChanges;
    }());
    var LocationController = (function () {
        LocationController.$inject = ['$element', '$timeout', '$scope'];
        function LocationController($element, $timeout, $scope) {
            "ngInject";
            this.$element = $element;
            this.$timeout = $timeout;
            this.$scope = $scope;
            this.showMap = true;
            $element.addClass('pip-location');
        }
        LocationController.prototype.$postLink = function () {
            var _this = this;
            this.$timeout(function () {
                _this.name = _this.$element.find('.pip-location-name');
                _this.mapContainer = _this.$element.find('.pip-location-container');
                if (_this.pipCollapse === true) {
                    _this.mapContainer.hide();
                    _this.showMap = false;
                    _this.name.click(function (event) {
                        event.stopPropagation();
                        if (_this.pipDisabled)
                            return;
                        _this.showMap = !_this.showMap;
                        _this.mapContainer[_this.showMap ? 'show' : 'hide']();
                        if (_this.showMap)
                            _this.generateMap();
                        if (!_this.$scope.$$phase)
                            _this.$scope.$apply();
                    });
                }
                _this.redrawMap();
            });
        };
        LocationController.prototype.redrawMap = function () {
            if (!this.mapContainer)
                return;
            if (this.pipLocationPos && this.showMap === true) {
                this.generateMap();
            }
            else {
                this.clearMap();
            }
        };
        LocationController.prototype.$onChanges = function (changes) {
            this.pipRebind = changes.pipRebind
                ? changes.pipRebind.currentValue || false : false;
            this.pipShowLocationIcon = changes.pipShowLocationIcon
                ? changes.pipShowLocationIcon.currentValue || false : false;
            this.pipCollapse = changes.pipCollapse
                ? changes.pipCollapse.currentValue || false : false;
            this.pipDisabled = changes.pipDisabled
                ? changes.pipDisabled.currentValue || false : false;
            if (this.pipRebind) {
                this.pipLocationName = changes.pipLocationName
                    ? changes.pipLocationName.currentValue : null;
                this.pipLocationPos = changes.pipLocationPos
                    ? changes.pipLocationPos.currentValue : null;
                this.redrawMap();
            }
        };
        LocationController.prototype.clearMap = function () {
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = null;
            this.mapContainer.hide();
        };
        LocationController.prototype.generateMap = function () {
            var location = this.pipLocationPos;
            if (this.showMap === false
                || location == null
                || location.coordinates == null
                || location.coordinates.length < 0) {
                this.clearMap();
                return;
            }
            var coordinates = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = $('<div></div>');
            this.mapContainer.show();
            this.mapControl.appendTo(this.mapContainer);
            var mapOptions = {
                center: coordinates,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggable: false
            }, map = new google.maps.Map(this.mapControl[0], mapOptions);
            new google.maps.Marker({
                position: coordinates,
                map: map
            });
        };
        ;
        return LocationController;
    }());
    var LocationComponent = {
        bindings: LocationBindings,
        templateUrl: 'location/Location.html',
        controller: LocationController
    };
    angular
        .module("pipLocation", [])
        .component('pipLocation', LocationComponent);
}
},{}],4:[function(require,module,exports){
"use strict";
},{}],5:[function(require,module,exports){
"use strict";
{
    var LocationEditDialogController_1 = (function () {
        function LocationEditDialogController_1($scope, $rootScope, $timeout, $mdDialog, locationPos, locationName) {
            var _this = this;
            this.$scope = $scope;
            this.$mdDialog = $mdDialog;
            this._map = null;
            this._marker = null;
            this.onSetLocation = function () {
                var _this = this;
                if (this._map === null)
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
            this.theme = $rootScope['$theme'];
            this.locationPos = locationPos && locationPos.type == 'Point' &&
                locationPos.coordinates && locationPos.coordinates.length == 2 ?
                locationPos : null;
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
                $timeout(function () {
                    google.maps.event.trigger(_this._map, 'resize');
                }, 1000);
            }, 0);
            $scope.$on('pipLayoutResized', function () {
                if (_this._map == null)
                    return;
                google.maps.event.trigger(_this._map, 'resize');
            });
        }
        LocationEditDialogController_1.prototype.createMarker = function (coordinates) {
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
        LocationEditDialogController_1.prototype.changeLocation = function (coordinates, tid) {
            var _this = this;
            this.locationPos = {
                type: 'Point',
                coordinates: [coordinates.lat(), coordinates.lng()]
            };
            this.locationName = null;
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                latLng: coordinates
            }, function (results, status) {
                if (results && results.length > 0) {
                    _this.locationName = results[0].formatted_address;
                }
                _this.$scope.$apply();
            });
        };
        LocationEditDialogController_1.prototype.onAddPin = function () {
            if (this._map === null)
                return;
            var coordinates = this._map.getCenter();
            this._marker = this.createMarker(coordinates);
            this.changeLocation(coordinates, null);
        };
        LocationEditDialogController_1.prototype.onRemovePin = function () {
            if (this._map === null)
                return;
            this._marker = this.createMarker(null);
            this.locationPos = null;
            this.locationName = null;
        };
        LocationEditDialogController_1.prototype.onZoomIn = function () {
            if (this._map === null)
                return;
            var zoom = this._map.getZoom();
            this._map.setZoom(zoom + 1);
        };
        LocationEditDialogController_1.prototype.onZoomOut = function () {
            if (this._map === null)
                return;
            var zoom = this._map.getZoom();
            this._map.setZoom(zoom > 1 ? zoom - 1 : zoom);
        };
        LocationEditDialogController_1.prototype.onCancel = function () {
            this.$mdDialog.cancel();
        };
        LocationEditDialogController_1.prototype.onApply = function () {
            this.$mdDialog.hide({
                location: this.locationPos,
                locationPos: this.locationPos,
                locationName: this.locationName
            });
        };
        return LocationEditDialogController_1;
    }());
    var LocationDialogService = (function () {
        LocationDialogService.$inject = ['$mdDialog'];
        function LocationDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        LocationDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                controller: LocationEditDialogController_1,
                controllerAs: '$ctrl',
                templateUrl: 'location_dialog/LocationDialog.html',
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
    var LocationDialogRun = function ($injector) {
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
    };
    LocationDialogRun.$inject = ['$injector'];
    angular
        .module('pipLocationEditDialog')
        .run(LocationDialogRun)
        .service('pipLocationEditDialog', LocationDialogService);
}
},{}],6:[function(require,module,exports){
"use strict";
var LocationDialogParams = (function () {
    function LocationDialogParams() {
    }
    return LocationDialogParams;
}());
exports.LocationDialogParams = LocationDialogParams;
},{}],7:[function(require,module,exports){
"use strict";
angular.module('pipLocationEditDialog', ['ngMaterial', 'pipLocations.Templates']);
require("./LocationDialog");
},{"./LocationDialog":5}],8:[function(require,module,exports){
"use strict";
{
    var LocationEditBindings = {
        pipLocationName: '=',
        pipLocationPos: '=',
        pipLocationHolder: '=',
        ngDisabled: '<',
        pipChanged: '&'
    };
    var LocationEditBindingsChanges = (function () {
        function LocationEditBindingsChanges() {
        }
        return LocationEditBindingsChanges;
    }());
    var LocationEditController = (function () {
        function LocationEditController($element, $scope, pipLocationEditDialog) {
            var _this = this;
            this.$element = $element;
            this.$scope = $scope;
            this.pipLocationEditDialog = pipLocationEditDialog;
            this.defineCoordinatesDebounced = _.debounce(function () {
                _this.defineCoordinates;
            }, 2000);
        }
        LocationEditController.prototype.$postLink = function () {
            var _this = this;
            this.$element.find('md-input-container').attr('md-no-float', (!!this.pipLocationHolder).toString());
            this.empty = this.$element.children('.pip-location-empty');
            this.mapContainer = this.$element.children('.pip-location-container');
            this.mapControl = null;
            this.$scope.$watch('$ctrl.pipLocationName', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    _this.defineCoordinatesDebounced();
                }
            });
            this.$scope.$watch('$ctrl.pipLocationPos', function () {
                _this.generateMap();
            });
            this.$element.addClass('pip-location-edit');
            if (this.pipLocationPos) {
                this.generateMap();
            }
            else {
                this.clearMap();
            }
        };
        LocationEditController.prototype.$onChanges = function (changes) {
            this.ngDisabled = changes.ngDisabled ? changes.ngDisabled.currentValue : false;
        };
        LocationEditController.prototype.clearMap = function () {
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = null;
            this.mapContainer.hide();
            this.empty.show();
        };
        LocationEditController.prototype.generateMap = function () {
            var location = this.pipLocationPos;
            if (location == null || location.coordinates == null || location.coordinates.length < 0) {
                this.clearMap();
                return;
            }
            var coordinates = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
            if (this.mapControl)
                this.mapControl.remove();
            this.mapContainer.show();
            this.empty.hide();
            this.mapControl = $('<div></div>');
            this.mapControl.appendTo(this.mapContainer);
            var mapOptions = {
                center: coordinates,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggable: false
            }, map = new google.maps.Map(this.mapControl[0], mapOptions), marker = new google.maps.Marker({
                position: coordinates,
                map: map
            });
        };
        LocationEditController.prototype.defineCoordinates = function () {
            var locationName = this.pipLocationName;
            if (locationName == '') {
                this.pipLocationPos = null;
                this.clearMap();
                this.$scope.$apply();
                return;
            }
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                address: locationName
            }, function (results, status) {
                this.$scope.$apply(function () {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results === null || results.length === 0) {
                            this.pipLocationPos = null;
                            this.clearMap();
                            return;
                        }
                        var geometry = results[0].geometry || {}, location_1 = geometry.location || {};
                        if (location_1.lat === null || location_1.lng === null) {
                            this.pipLocationPos = null;
                            this.clearMap();
                            return;
                        }
                        this.pipLocationPos = {
                            type: 'Point',
                            coordinates: {
                                latitude: location_1.lat(),
                                longtitude: location_1.lng()
                            }
                        };
                        this.generateMap();
                    }
                    else {
                        this.pipLocationPos = null;
                        this.clearMap();
                    }
                });
            });
        };
        ;
        LocationEditController.prototype.onSetLocation = function () {
            var _this = this;
            if (this.ngDisabled)
                return;
            this.pipLocationEditDialog.show({
                locationName: this.pipLocationName,
                locationPos: this.pipLocationPos
            }, function (result) {
                var location = result.location, locationName = result.locationName;
                if (_this.pipLocationPos && _this.pipLocationPos.type == 'Point' &&
                    _this.pipLocationPos.coordinates.length == 2 &&
                    location && location.coordinates.length == 2 &&
                    (_this.pipLocationPos.coordinates[0] - location.coordinates[0]) < 0.0001 &&
                    (_this.pipLocationPos.coordinates[1] - location.coordinates[1]) < 0.0001 &&
                    (locationName === _this.pipLocationName)) {
                    return;
                }
                _this.pipLocationPos = location;
                _this.pipLocationName = locationName;
                if (locationName === null && location !== null) {
                    _this.pipLocationName =
                        '(' + result.location.coordinates[0] +
                            ',' + result.location.coordinates[1] + ')';
                }
                _this.pipChanged();
                _this.mapContainer[0].focus();
            });
        };
        ;
        LocationEditController.prototype.onMapClick = function ($event) {
            if (this.ngDisabled)
                return;
            this.mapContainer[0].focus();
            this.onSetLocation();
        };
        ;
        LocationEditController.prototype.onMapKeyPress = function ($event) {
            if (this.ngDisabled)
                return;
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                this.onSetLocation();
            }
        };
        ;
        return LocationEditController;
    }());
    var LocationEdit = {
        bindings: LocationEditBindings,
        templateUrl: 'location_edit/LocationEdit.html',
        controller: LocationEditController
    };
    angular
        .module("pipLocationEdit", ['pipLocationEditDialog'])
        .component('pipLocationEdit', LocationEdit);
}
},{}],9:[function(require,module,exports){
{
    var LocationIpBindings = {
        pipIpaddress: '<',
        pipExtraInfo: '&',
        pipRebind: '<'
    };
    var LocationIpBindingsChanges = (function () {
        function LocationIpBindingsChanges() {
        }
        return LocationIpBindingsChanges;
    }());
    var LocationIpController = (function () {
        function LocationIpController($element, $http) {
            this.$http = $http;
            this.mapContainer = $element.children('.pip-location-container');
            $element.addClass('pip-location-ip');
            this.defineCoordinates();
        }
        LocationIpController.prototype.$onChanges = function (changes) {
            this.pipRebind = changes.pipRebind ? changes.pipRebind.currentValue || false : false;
            if (this.pipRebind === true) {
                this.pipIpaddress = changes.pipIpaddress ? changes.pipIpaddress.currentValue : this.pipIpaddress;
                this.defineCoordinates();
            }
        };
        LocationIpController.prototype.clearMap = function () {
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = null;
        };
        LocationIpController.prototype.generateMap = function (latitude, longitude) {
            if (latitude == null || longitude == null) {
                this.clearMap();
                return;
            }
            var coordinates = new google.maps.LatLng(latitude, longitude);
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = $('<div></div>');
            this.mapControl.appendTo(this.mapContainer);
            var mapOptions = {
                center: coordinates,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggable: false
            }, map = new google.maps.Map(this.mapControl[0], mapOptions);
            new google.maps.Marker({
                position: coordinates,
                map: map
            });
        };
        LocationIpController.prototype.defineCoordinates = function () {
            var _this = this;
            var ipAddress = this.pipIpaddress;
            if (ipAddress == '') {
                this.clearMap();
                return;
            }
            this.$http.get('https://freegeoip.net/json/' + ipAddress)
                .success(function (response) {
                if (response != null &&
                    response.latitude != null &&
                    response.longitude != null) {
                    _this.generateMap(response.latitude, response.longitude);
                    if (_this.pipExtraInfo) {
                        var extraInfo = {
                            city: response.city,
                            regionCode: response.regionCode,
                            region: response.regionName,
                            zipCode: response.zipCode,
                            countryCode: response.countryCode,
                            country: response.countryName
                        };
                        _this.pipExtraInfo({
                            extraInfo: extraInfo
                        });
                    }
                }
                else {
                    _this.clearMap();
                }
            })
                .error(function (response) {
                _this.clearMap();
            });
        };
        return LocationIpController;
    }());
    var LocationIp = {
        bindings: LocationIpBindings,
        template: '<div class="pip-location-container"></div>',
        controller: LocationIpController
    };
    angular
        .module("pipLocationIp", [])
        .component('pipLocationIp', LocationIp);
}
},{}],10:[function(require,module,exports){
{
    var LocationMapBindings = {
        pipLocationPos: '<',
        pipLocationPositions: '<',
        pipIconPath: '<',
        pipDraggable: '<',
        pipStretch: '<',
        pipRebind: '<'
    };
    var LocationMapBindingsChanges = (function () {
        function LocationMapBindingsChanges() {
        }
        return LocationMapBindingsChanges;
    }());
    var LocationMapController = (function () {
        function LocationMapController($element) {
            this.$element = $element;
            this.mapControl = null;
            this.mapContainer = $element.children('.pip-location-container');
            $element.addClass('pip-location-map');
        }
        LocationMapController.prototype.$onChanges = function (changes) {
            this.pipRebind = changes.pipRebind ? changes.pipRebind.currentValue || false : false;
            this.pipDraggable = changes.pipDraggable ? changes.pipDraggable.currentValue || false : false;
            this.pipStretch = changes.pipStretch ? changes.pipStretch.currentValue || false : false;
            if (this.pipStretch === true) {
                this.mapContainer.addClass('stretch');
            }
            else {
                this.mapContainer.removeClass('stretch');
            }
            if (this.pipRebind === true) {
                this.pipLocationPos = changes.pipLocationPos ? changes.pipLocationPos.currentValue : this.pipLocationPos;
                this.pipLocationPositions = changes.pipLocationPositions ? changes.pipLocationPositions.currentValue : this.pipLocationPos;
                this.pipIconPath = changes.pipIconPath ? changes.pipIconPath.currentValue : this.pipIconPath;
                this.generateMap();
            }
        };
        LocationMapController.prototype.clearMap = function () {
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = null;
        };
        LocationMapController.prototype.checkLocation = function (loc) {
            return !(loc == null || loc.coordinates == null || loc.coordinates.length < 0);
        };
        LocationMapController.prototype.determineCoordinates = function (loc) {
            var point = new google.maps.LatLng(loc.coordinates[0], loc.coordinates[1]);
            point.fill = loc.fill;
            point.stroke = loc.stroke;
            return point;
        };
        LocationMapController.prototype.generateMap = function () {
            var _this = this;
            var location = this.pipLocationPos, locations = this.pipLocationPositions, points = [], draggable = this.pipDraggable || false;
            if (this.checkLocation(location)) {
                points.push(this.determineCoordinates(location));
            }
            else {
                if (locations && locations.length && locations.length > 0) {
                    _.each(locations, function (loc) {
                        if (_this.checkLocation(loc)) {
                            points.push(_this.determineCoordinates(loc));
                        }
                    });
                }
            }
            if (points.length === 0) {
                this.clearMap();
                return;
            }
            if (this.mapControl)
                this.mapControl.remove();
            this.mapControl = $('<div></div>');
            this.mapControl.appendTo(this.mapContainer);
            var mapOptions = {
                center: points[0],
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: draggable,
                draggable: draggable
            }, map = new google.maps.Map(this.mapControl[0], mapOptions), bounds = new google.maps.LatLngBounds();
            _.each(points, function (point) {
                var icon = {
                    path: _this.pipIconPath,
                    fillColor: point.fill || '#EF5350',
                    fillOpacity: 1,
                    scale: 1,
                    strokeColor: point.stroke || 'white',
                    strokeWeight: 5
                };
                new google.maps.Marker({
                    position: point,
                    map: map,
                    icon: _this.pipIconPath ? icon : null
                });
                bounds.extend(point);
            });
            if (points.length > 1)
                map.fitBounds(bounds);
        };
        return LocationMapController;
    }());
    var LocationMap = {
        bindings: LocationMapBindings,
        template: '<div class="pip-location-container"></div>',
        controller: LocationMapController
    };
    angular
        .module("pipLocationMap", [])
        .component('pipLocationMap', LocationMap);
}
},{}],11:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipLocations.Templates');
} catch (e) {
  module = angular.module('pipLocations.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location/Location.html',
    '<div class="pip-location-name location-collapse" ng-click="$ctrl.pipLocationResize()" ng-if="!$ctrl.pipCollapse"\n' +
    '    ng-class="$ctrl.pipShowLocationIcon ? \'pip-location-icon-space\' : \'\'">\n' +
    '    <md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="$ctrl.pipShowLocationIcon"></md-icon>\n' +
    '    <span class="pip-location-text">{{$ctrl.pipLocationName}}</span>\n' +
    '</div>\n' +
    '\n' +
    '<md-button class="pip-location-name" ng-click="$ctrl.pipLocationResize()" ng-if="$ctrl.pipCollapse"\n' +
    '    ng-class="$ctrl.pipShowLocationIcon ? \'pip-location-icon-space\' : \'\'">\n' +
    '    <div class="layout-align-start-center layout-row w-stretch">\n' +
    '        <md-icon md-svg-icon="icons:location" class="flex-fixed pip-icon" ng-if="$ctrl.pipShowLocationIcon"></md-icon>\n' +
    '        <span class="pip-location-text flex">{{$ctrl.pipLocationName}}</span>\n' +
    '        <md-icon md-svg-icon="icons:triangle-down" class="flex-fixed" ng-show="!$ctrl.showMap"></md-icon>\n' +
    '        <md-icon md-svg-icon="icons:triangle-up" class="flex-fixed" ng-show="$ctrl.showMap"></md-icon>\n' +
    '    </div>\n' +
    '</md-button>\n' +
    '\n' +
    '<div class="pip-location-container">\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipLocations.Templates');
} catch (e) {
  module = angular.module('pipLocations.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location_dialog/LocationDialog.html',
    '<md-dialog class="pip-dialog pip-location-edit-dialog layout-column" md-theme="{{$ctrl.theme}}">\n' +
    '\n' +
    '    <div class="pip-header layout-column layout-align-start-start">\n' +
    '        <md-progress-linear ng-show="$ctrl.transaction.busy()" md-mode="indeterminate" class="pip-progress-top">\n' +
    '        </md-progress-linear>\n' +
    '        <h3 class="flex">{{ \'LOCATION_SET_LOCATION\' | translate }}</h3>\n' +
    '    </div>\n' +
    '    <div class="pip-footer">\n' +
    '        <div class="layout-row layout-align-start-center">\n' +
    '            <md-button class="md-accent" ng-click="$ctrl.onAddPin()" ng-show="$ctrl.locationPos == null"\n' +
    '                ng-disabled="$ctrl.transaction.busy()" aria-label="{{ ::\'LOCATION_ADD_PIN\'  }}">\n' +
    '                {{ ::\'LOCATION_ADD_PIN\' | translate }}\n' +
    '            </md-button>\n' +
    '            <md-button class="md-accent" ng-click="$ctrl.onRemovePin()" ng-show="$ctrl.locationPos != null"\n' +
    '                ng-disabled="$ctrl.transaction.busy()" aria-label="{{ ::\'LOCATION_REMOVE_PIN\'  }}">\n' +
    '                {{ ::\'LOCATION_REMOVE_PIN\' | translate }}\n' +
    '            </md-button>\n' +
    '        </div>\n' +
    '        <div class="flex"></div>\n' +
    '        <div class="layout-row layout-align-end-center">\n' +
    '            <md-button ng-click="$ctrl.onCancel()" aria-label="{{ ::\'CANCEL\'  }}">\n' +
    '                {{ ::\'CANCEL\' | translate }}\n' +
    '            </md-button>\n' +
    '            <md-button class="md-accent" ng-click="$ctrl.onApply()" ng-disabled="$ctrl.transaction.busy()"\n' +
    '                aria-label="{{ ::\'APPLY\'  }}">\n' +
    '                {{ ::\'APPLY\' | translate }}\n' +
    '            </md-button>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="pip-body">\n' +
    '        <div class="pip-location-container"></div>\n' +
    '        <md-button class="md-icon-button md-fab pip-zoom-in" ng-click="$ctrl.onZoomIn()"\n' +
    '                   aria-label="{{ ::\'LOCATION_ZOOM_IN\'  }}">\n' +
    '            <md-icon md-svg-icon="icons:plus"></md-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button md-fab pip-zoom-out" ng-click="$ctrl.onZoomOut()"\n' +
    '                   aria-label="{{ ::\'LOCATION_ZOOM_OUT\'  }}">\n' +
    '            <md-icon md-svg-icon="icons:minus"></md-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button md-fab pip-set-location" ng-click="$ctrl.onSetLocation()"\n' +
    '                   aria-label="{{ ::\'LOCATION_SET_LOCATION\'  }}"\n' +
    '                   ng-show="supportSet" ng-disabled="transaction.busy()">\n' +
    '            <md-icon md-svg-icon="icons:target"></md-icon>\n' +
    '        </md-button>\n' +
    '    </div>\n' +
    '</md-dialog>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('pipLocations.Templates');
} catch (e) {
  module = angular.module('pipLocations.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location_edit/LocationEdit.html',
    '<md-input-container class="md-block">\n' +
    '    <label>{{ \'LOCATION\' | translate }}</label>\n' +
    '    <input ng-model="$ctrl.pipLocationName" ng-disabled="$ctrl.ngDisabled"/>\n' +
    '</md-input-container>\n' +
    '<div class="pip-location-empty" layout="column" layout-align="center center">\n' +
    '    <md-button class="md-raised" ng-disabled="$ctrl.ngDisabled" ng-click="$ctrl.onSetLocation()"\n' +
    '            aria-label="LOCATION_ADD_LOCATION">\n' +
    '            <span class="icon-location"></span> {{\'LOCATION_ADD_LOCATION\' | translate }}\n' +
    '    </md-button>\n' +
    '</div>\n' +
    '<div class="pip-location-container" tabindex="{{ $ctrl.ngDisabled ? -1 : 0 }}" \n' +
    '    ng-click="$ctrl.onMapClick($event)" ng-keypress="$ctrl.onMapKeyPress($event)">\n' +
    '</div>');
}]);
})();



},{}]},{},[11,1,2,4,7,5,6,8,9,10,3])(11)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL1RyYW5zbGF0ZUZpbHRlci50cyIsInNyYy9pbmRleC50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvTG9jYXRpb25EaWFsb2cudHMiLCJzcmMvbG9jYXRpb25fZGlhbG9nL0xvY2F0aW9uRGlhbG9nUGFyYW1zLnRzIiwic3JjL2xvY2F0aW9uX2RpYWxvZy9pbmRleC50cyIsInNyYy9sb2NhdGlvbl9lZGl0L0xvY2F0aW9uRWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9Mb2NhdGlvbklwLnRzIiwic3JjL2xvY2F0aW9uX21hcC9Mb2NhdGlvbk1hcC50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsQ0FBQztJQUNHLHlCQUF5QixTQUFTO1FBQzlCLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO2NBQzFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxVQUFVLEdBQUc7WUFDaEIsTUFBTSxDQUFDLFlBQVksR0FBSSxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDcEUsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztJQUVELE9BQU87U0FDRixNQUFNLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDO1NBQ3BDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDOUMsQ0FBQzs7QUNiQSxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtJQUM1QixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGVBQWU7SUFDZix1QkFBdUI7SUFDdkIsaUJBQWlCO0lBQ2pCLHdCQUF3QjtD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIntcclxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZUZpbHRlcigkaW5qZWN0b3IpIHtcclxuICAgICAgICBsZXQgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlJykgXHJcbiAgICAgICAgICAgID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwVHJhbnNsYXRlICA/IHBpcFRyYW5zbGF0ZS50cmFuc2xhdGUoa2V5KSB8fCBrZXkgOiBrZXk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJywgW10pXHJcbiAgICAgICAgLmZpbHRlcigndHJhbnNsYXRlJywgdHJhbnNsYXRlRmlsdGVyKTtcclxufSIsIu+7v2FuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMnLCBbXHJcbiAgICAncGlwTG9jYXRpb24nLFxyXG4gICAgJ3BpcExvY2F0aW9uTWFwJyxcclxuICAgICdwaXBMb2NhdGlvbklwJyxcclxuICAgICdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLFxyXG4gICAgJ3BpcExvY2F0aW9uRWRpdCcsXHJcbiAgICAncGlwTG9jYXRpb25zLlRyYW5zbGF0ZSdcclxuXSk7Iiwie1xyXG4gICAgaW50ZXJmYWNlIElMb2NhdGlvbkJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogYW55O1xyXG4gICAgICAgIHBpcENvbGxhcHNlOiBhbnk7XHJcbiAgICAgICAgcGlwUmViaW5kOiBhbnk7XHJcbiAgICAgICAgcGlwRGlzYWJsZWQ6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblJlc2l6ZTogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uQmluZGluZ3M6IElMb2NhdGlvbkJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogJzwnLFxyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPCcsXHJcbiAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogJzwnLFxyXG4gICAgICAgIHBpcENvbGxhcHNlOiAnPCcsXHJcbiAgICAgICAgcGlwUmViaW5kOiAnPCcsXHJcbiAgICAgICAgcGlwRGlzYWJsZWQ6ICc8JyxcclxuICAgICAgICBwaXBMb2NhdGlvblJlc2l6ZTogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25CaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJTG9jYXRpb25CaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IG5nLklDaGFuZ2VzT2JqZWN0IDwgc3RyaW5nID4gO1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgICAgICBwaXBTaG93TG9jYXRpb25JY29uOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwQ29sbGFwc2U6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBwaXBSZWJpbmQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuICAgICAgICBwaXBEaXNhYmxlZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvblJlc2l6ZTogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTG9jYXRpb25CaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHB1YmxpYyBwaXBTaG93TG9jYXRpb25JY29uOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBwaXBDb2xsYXBzZTogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwUmViaW5kOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBwaXBEaXNhYmxlZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgc2hvd01hcDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUmVzaXplOiBGdW5jdGlvbjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBuYW1lOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRyb2w6IEpRdWVyeTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogbmcuSVNjb3BlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIFwibmdJbmplY3RcIjtcclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gdGhpcy4kZWxlbWVudC5maW5kKCcucGlwLWxvY2F0aW9uLW5hbWUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gdGhpcy4kZWxlbWVudC5maW5kKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBpcENvbGxhcHNlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd01hcCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHVzZXIgY2xpY2tcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hbWUuY2xpY2soKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBEaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dNYXAgPSAhdGhpcy5zaG93TWFwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lclt0aGlzLnNob3dNYXAgPyAnc2hvdycgOiAnaGlkZSddKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dNYXApIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLiRzY29wZS4kJHBoYXNlKSB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZHJhd01hcCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVkcmF3TWFwKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwQ29udGFpbmVyKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcExvY2F0aW9uUG9zICYmIHRoaXMuc2hvd01hcCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBMb2NhdGlvbkJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBpcFJlYmluZCA9IGNoYW5nZXMucGlwUmViaW5kIFxyXG4gICAgICAgICAgICAgICAgPyBjaGFuZ2VzLnBpcFJlYmluZC5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5waXBTaG93TG9jYXRpb25JY29uID0gY2hhbmdlcy5waXBTaG93TG9jYXRpb25JY29uIFxyXG4gICAgICAgICAgICAgICAgPyBjaGFuZ2VzLnBpcFNob3dMb2NhdGlvbkljb24uY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwQ29sbGFwc2UgPSBjaGFuZ2VzLnBpcENvbGxhcHNlIFxyXG4gICAgICAgICAgICAgICAgPyBjaGFuZ2VzLnBpcENvbGxhcHNlLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcERpc2FibGVkID0gY2hhbmdlcy5waXBEaXNhYmxlZCBcclxuICAgICAgICAgICAgICAgID8gY2hhbmdlcy5waXBEaXNhYmxlZC5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcFJlYmluZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvbk5hbWUgPSBjaGFuZ2VzLnBpcExvY2F0aW9uTmFtZSBcclxuICAgICAgICAgICAgICAgICAgICA/IGNoYW5nZXMucGlwTG9jYXRpb25OYW1lLmN1cnJlbnRWYWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gY2hhbmdlcy5waXBMb2NhdGlvblBvcyBcclxuICAgICAgICAgICAgICAgICAgICA/IGNoYW5nZXMucGlwTG9jYXRpb25Qb3MuY3VycmVudFZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkcmF3TWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5waXBMb2NhdGlvblBvcztcclxuXHJcbiAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dNYXAgPT09IGZhbHNlIFxyXG4gICAgICAgICAgICAgICAgfHwgbG9jYXRpb24gPT0gbnVsbCBcclxuICAgICAgICAgICAgICAgIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGwgXHJcbiAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbC5hcHBlbmRUbyh0aGlzLm1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICBjb25zdFxyXG4gICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLm1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uQ29tcG9uZW50OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTG9jYXRpb25CaW5kaW5ncyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvY2F0aW9uL0xvY2F0aW9uLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uQ29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKFwicGlwTG9jYXRpb25cIiwgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTG9jYXRpb24nLCBMb2NhdGlvbkNvbXBvbmVudCk7XHJcbn0iLCJpbXBvcnQgeyBJTG9jYXRpb25EaWFsb2dTZXJ2aWNlIH0gZnJvbSAnLi9JTG9jYXRpb25EaWFsb2dTZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9jYXRpb25EaWFsb2dQYXJhbXMgfSBmcm9tICcuL0xvY2F0aW9uRGlhbG9nUGFyYW1zJztcclxuXHJcbntcclxuICAgIGNsYXNzIExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXIge1xyXG4gICAgICAgIHByaXZhdGUgX21hcCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBfbWFya2VyID0gbnVsbDtcclxuXHJcbiAgICAgICAgcHVibGljIHRoZW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIGxvY2F0aW9uUG9zO1xyXG4gICAgICAgIHB1YmxpYyBsb2NhdGlvbk5hbWU7XHJcbiAgICAgICAgcHVibGljIHN1cHBvcnRTZXQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBuZy5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAgICAgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZSxcclxuICAgICAgICAgICAgbG9jYXRpb25Qb3M6IGFueSxcclxuICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBzdHJpbmdcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy50aGVtZSA9ICRyb290U2NvcGVbJyR0aGVtZSddO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zID0gbG9jYXRpb25Qb3MgJiYgbG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnICYmXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvcy5jb29yZGluYXRlcyAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMiA/XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvcyA6IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnN1cHBvcnRTZXQgPSBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24gIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFdhaXQgdW50aWwgZGlhbG9nIGlzIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXBDb250YWluZXIgPSAkKCcucGlwLWxvY2F0aW9uLWVkaXQtZGlhbG9nIC5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyXHJcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzLmxvY2F0aW9uUG9zID9cclxuICAgICAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuY2VudGVyID0gY29vcmRpbmF0ZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucy56b29tID0gMTI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBDb250YWluZXJbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpeCByZXNpemluZyBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIodGhpcy5fbWFwLCAncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdwaXBMYXlvdXRSZXNpemVkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuX21hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFya2VyKSB0aGlzLl9tYXJrZXIuc2V0TWFwKG51bGwpO1xyXG4gICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IHRoaXMuX21hcCxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRoaXNNYXJrZXIgPSB0aGlzLl9tYXJrZXI7XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzTWFya2VyLCAnZHJhZ2VuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzTWFya2VyLmdldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXJrZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCB0aWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW2Nvb3JkaW5hdGVzLmxhdCgpLCBjb29yZGluYXRlcy5sbmcoKV1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbk5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAvLyBSZWFkIGFkZHJlc3NcclxuICAgICAgICAgICAgY29uc3QgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7XHJcbiAgICAgICAgICAgICAgICBsYXRMbmc6IGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIH0sIChyZXN1bHRzLCBzdGF0dXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcG9zaXRpdmUgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRGVzY3JpYmUgdXNlciBhY3Rpb25zXHJcbiAgICAgICAgcHVibGljIG9uQWRkUGluKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblJlbW92ZVBpbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSB0aGlzLmNyZWF0ZU1hcmtlcihudWxsKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblpvb21JbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oem9vbSArIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uWm9vbU91dCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oem9vbSA+IDEgPyB6b29tIC0gMSA6IHpvb20pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgICAgICAocG9zaXRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcocG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLCBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSB0aGlzLmNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFwLnNldENlbnRlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oMTIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbkNhbmNlbCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kbWREaWFsb2cuY2FuY2VsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25BcHBseSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiB0aGlzLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLmxvY2F0aW9uTmFtZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG9jYXRpb25EaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUxvY2F0aW9uRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgc2hvdyhwYXJhbXM6IExvY2F0aW9uRGlhbG9nUGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2s/LCBjYW5jZWxDYWxsYmFjaz8pIHtcclxuICAgICAgICAgICAgdGhpcy4kbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICckY3RybCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2NhdGlvbl9kaWFsb2cvTG9jYXRpb25EaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogcGFyYW1zLmxvY2F0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6IHBhcmFtcy5sb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25EaWFsb2dSdW4gPSBmdW5jdGlvbigkaW5qZWN0b3I6IG5nLmF1dG8uSUluamVjdG9yU2VydmljZSkge1xyXG4gICAgICAgIGxldCBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGUnKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICdBZGQgbG9jYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICdTZXQgbG9jYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAnQWRkIHBpbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fUkVNT1ZFX1BJTic6ICdSZW1vdmUgcGluJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdydScsIHtcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfTE9DQVRJT04nOiAn0JTQvtCx0LDQstC40YLRjCDQvNC10YHRgtC+0L/QvtC70L7QttC10L3QuNC1JyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9TRVRfTE9DQVRJT04nOiAn0J7Qv9GA0LXQtNC10LvQuNGC0Ywg0L/QvtC70L7QttC10L3QuNC1JyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfUElOJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0YLQvtGH0LrRgycsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fUkVNT1ZFX1BJTic6ICfQo9Cx0YDQsNGC0Ywg0YLQvtGH0LrRgydcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwTG9jYXRpb25FZGl0RGlhbG9nJylcclxuICAgICAgICAucnVuKExvY2F0aW9uRGlhbG9nUnVuKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLCBMb2NhdGlvbkRpYWxvZ1NlcnZpY2UpO1xyXG59IiwiZXhwb3J0IGNsYXNzIExvY2F0aW9uRGlhbG9nUGFyYW1zIHtcclxuICAgIC8vIExvY2F0aW9ucyBwb3NpdGlvblxyXG4gICAgbG9jYXRpb25Qb3M6IGFueTtcclxuICAgIC8vIExvY2F0aW9uIG5hbWVcclxuICAgIGxvY2F0aW9uTmFtZTogc3RyaW5nO1xyXG59IiwiYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFsnbmdNYXRlcmlhbCcsICdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJ10pO1xyXG5cclxuaW1wb3J0ICcuL0xvY2F0aW9uRGlhbG9nJyIsImltcG9ydCB7IElMb2NhdGlvbkRpYWxvZ1NlcnZpY2UgfSBmcm9tICcuLi9sb2NhdGlvbl9kaWFsb2cvSUxvY2F0aW9uRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUxvY2F0aW9uRWRpdEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6IGFueTtcclxuICAgICAgICBuZ0Rpc2FibGVkOiBhbnk7XHJcbiAgICAgICAgcGlwQ2hhbmdlZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uRWRpdEJpbmRpbmdzOiBJTG9jYXRpb25FZGl0QmluZGluZ3MgPSB7XHJcbiAgICAgICAgcGlwTG9jYXRpb25OYW1lOiAnPScsXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6ICc9JyxcclxuICAgICAgICBwaXBMb2NhdGlvbkhvbGRlcjogJz0nLFxyXG4gICAgICAgIG5nRGlzYWJsZWQ6ICc8JyxcclxuICAgICAgICBwaXBDaGFuZ2VkOiAnJidcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbkVkaXRCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJTG9jYXRpb25FZGl0QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25OYW1lOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvbkhvbGRlcjogYW55O1xyXG4gICAgICAgIHBpcENoYW5nZWQ6IGFueTtcclxuXHJcbiAgICAgICAgbmdEaXNhYmxlZDogbmcuSUNoYW5nZXNPYmplY3Q8Ym9vbGVhbj47XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25FZGl0Q29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTG9jYXRpb25FZGl0QmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvbk5hbWU6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Ib2xkZXI6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIG5nRGlzYWJsZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHBpcENoYW5nZWQ6IEZ1bmN0aW9uO1xyXG5cclxuICAgICAgICBwcml2YXRlIGVtcHR5OiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRyb2w6IGFueTtcclxuICAgICAgICBwcml2YXRlIGRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkOiBGdW5jdGlvbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSBwaXBMb2NhdGlvbkVkaXREaWFsb2c6IElMb2NhdGlvbkRpYWxvZ1NlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZCA9IF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlc1xyXG4gICAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnbWQtaW5wdXQtY29udGFpbmVyJykuYXR0cignbWQtbm8tZmxvYXQnLCAoISF0aGlzLnBpcExvY2F0aW9uSG9sZGVyKS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgLy8gU2V0IGNvbnRhaW5lcnNcclxuICAgICAgICAgICAgdGhpcy5lbXB0eSA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tZW1wdHknKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHdhdGNoZXJzXHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgnJGN0cmwucGlwTG9jYXRpb25OYW1lJyxcclxuICAgICAgICAgICAgICAgIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgIT09IG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXNEZWJvdW5jZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgnJGN0cmwucGlwTG9jYXRpb25Qb3MnLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24tZWRpdCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBMb2NhdGlvblBvcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBMb2NhdGlvbkVkaXRCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5uZ0Rpc2FibGVkID0gY2hhbmdlcy5uZ0Rpc2FibGVkID8gY2hhbmdlcy5uZ0Rpc2FibGVkLmN1cnJlbnRWYWx1ZSA6IGZhbHNlOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBUb2dnbGUgY29udHJvbCB2aXNpYmlsaXR5XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbXB0eS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMucGlwTG9jYXRpb25Qb3M7XHJcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzID09IG51bGwgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRvZ2dsZSBjb250cm9sIHZpc2liaWxpdHlcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVtcHR5LmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBtYXBcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sLmFwcGVuZFRvKHRoaXMubWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKSxcclxuICAgICAgICAgICAgICAgIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbk5hbWUgPSB0aGlzLnBpcExvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbk5hbWUgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoe1xyXG4gICAgICAgICAgICAgICAgYWRkcmVzczogbG9jYXRpb25OYW1lXHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBlbXB0eSByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzID09PSBudWxsIHx8IHJlc3VsdHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSByZXN1bHRzWzBdLmdlb21ldHJ5IHx8IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSBnZW9tZXRyeS5sb2NhdGlvbiB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBlbXB0eSByZXN1bHRzIGFnYWluXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbi5sYXQgPT09IG51bGwgfHwgbG9jYXRpb24ubG5nID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiBsb2NhdGlvbi5sYXQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25ndGl0dWRlOiBsb2NhdGlvbi5sbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgb25TZXRMb2NhdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmdEaXNhYmxlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvbkVkaXREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLnBpcExvY2F0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogdGhpcy5waXBMb2NhdGlvblBvc1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IHJlc3VsdC5sb2NhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lID0gcmVzdWx0LmxvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRG8gbm90IGNoYW5nZSBhbnl0aGluZyBpZiBsb2NhdGlvbiBpcyBhYm91dCB0aGUgc2FtZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBpcExvY2F0aW9uUG9zICYmIHRoaXMucGlwTG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMubGVuZ3RoID09IDIgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gJiYgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoID09IDIgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMF0gLSBsb2NhdGlvbi5jb29yZGluYXRlc1swXSkgPCAwLjAwMDEgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMucGlwTG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV0gLSBsb2NhdGlvbi5jb29yZGluYXRlc1sxXSkgPCAwLjAwMDEgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGxvY2F0aW9uTmFtZSA9PT0gdGhpcy5waXBMb2NhdGlvbk5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBsb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uTmFtZSA9IGxvY2F0aW9uTmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uTmFtZSA9PT0gbnVsbCAmJiBsb2NhdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uTmFtZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyByZXN1bHQubG9jYXRpb24uY29vcmRpbmF0ZXNbMF0gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJywnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdICsgJyknO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcENoYW5nZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lclswXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbk1hcENsaWNrKCRldmVudCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5uZ0Rpc2FibGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lclswXS5mb2N1cygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2V0TG9jYXRpb24oKTtcclxuICAgICAgICAgICAgLy8kZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIG9uTWFwS2V5UHJlc3MoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5nRGlzYWJsZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmICgkZXZlbnQua2V5Q29kZSA9PSAxMyB8fCAkZXZlbnQua2V5Q29kZSA9PSAzMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAvLyRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25FZGl0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTG9jYXRpb25FZGl0QmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2NhdGlvbl9lZGl0L0xvY2F0aW9uRWRpdC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBMb2NhdGlvbkVkaXRDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoXCJwaXBMb2NhdGlvbkVkaXRcIiwgWydwaXBMb2NhdGlvbkVkaXREaWFsb2cnXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBMb2NhdGlvbkVkaXQnLCBMb2NhdGlvbkVkaXQpO1xyXG5cclxufSIsImRlY2xhcmUgbGV0IGdvb2dsZTogYW55O1xyXG5cclxue1xyXG4gICAgaW50ZXJmYWNlIElMb2NhdGlvbklwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwSXBhZGRyZXNzOiBhbnk7XHJcbiAgICAgICAgcGlwRXh0cmFJbmZvOiBhbnk7XHJcbiAgICAgICAgcGlwUmViaW5kOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25JcEJpbmRpbmdzOiBJTG9jYXRpb25JcEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcElwYWRkcmVzczogJzwnLFxyXG4gICAgICAgIHBpcEV4dHJhSW5mbzogJyYnLFxyXG4gICAgICAgIHBpcFJlYmluZDogJzwnXHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElJcFJlc3BvbnNlSW5mbyB7XHJcbiAgICAgICAgY2l0eTogc3RyaW5nO1xyXG4gICAgICAgIHJlZ2lvbkNvZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgICAgICByZWdpb25OYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgemlwQ29kZTogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgICAgIGNvdW50cnlDb2RlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICAgICAgY291bnRyeU5hbWU6IHN0cmluZztcclxuICAgICAgICBsYXRpdHVkZTogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgICAgIGxvbmdpdHVkZTogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uSXBCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJTG9jYXRpb25JcEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcEV4dHJhSW5mbzogYW55O1xyXG5cclxuICAgICAgICBwaXBJcGFkZHJlc3M6IG5nLklDaGFuZ2VzT2JqZWN0IDwgc3RyaW5nID4gO1xyXG4gICAgICAgIHBpcFJlYmluZDogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID5cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbklwQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTG9jYXRpb25JcEJpbmRpbmdzIHtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udHJvbDogYW55O1xyXG5cclxuICAgICAgICBwdWJsaWMgcGlwRXh0cmFJbmZvOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcElwYWRkcmVzczogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBwaXBSZWJpbmQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgICAgICBwcml2YXRlICRodHRwOiBuZy5JSHR0cFNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1pcCcpO1xyXG4gICAgICAgICAgICB0aGlzLmRlZmluZUNvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBMb2NhdGlvbklwQmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlwUmViaW5kID0gY2hhbmdlcy5waXBSZWJpbmQgPyBjaGFuZ2VzLnBpcFJlYmluZC5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcFJlYmluZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBJcGFkZHJlc3MgPSBjaGFuZ2VzLnBpcElwYWRkcmVzcyA/IGNoYW5nZXMucGlwSXBhZGRyZXNzLmN1cnJlbnRWYWx1ZSA6IHRoaXMucGlwSXBhZGRyZXNzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcChsYXRpdHVkZSwgbG9uZ2l0dWRlKSB7XHJcbiAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIGlmIChsYXRpdHVkZSA9PSBudWxsIHx8IGxvbmdpdHVkZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgIGxhdGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgbG9uZ2l0dWRlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbC5hcHBlbmRUbyh0aGlzLm1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICBjb25zdFxyXG4gICAgICAgICAgICAgICAgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLm1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGVmaW5lQ29vcmRpbmF0ZXMoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlwQWRkcmVzcyA9IHRoaXMucGlwSXBhZGRyZXNzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlwQWRkcmVzcyA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRodHRwLmdldCgnaHR0cHM6Ly9mcmVlZ2VvaXAubmV0L2pzb24vJyArIGlwQWRkcmVzcylcclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKChyZXNwb25zZTogSUlwUmVzcG9uc2VJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICE9IG51bGwgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubGF0aXR1ZGUgIT0gbnVsbCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5sb25naXR1ZGUgIT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcChyZXNwb25zZS5sYXRpdHVkZSwgcmVzcG9uc2UubG9uZ2l0dWRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBpcEV4dHJhSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0cmFJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHk6IHJlc3BvbnNlLmNpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uQ29kZTogcmVzcG9uc2UucmVnaW9uQ29kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IHJlc3BvbnNlLnJlZ2lvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgemlwQ29kZTogcmVzcG9uc2UuemlwQ29kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogcmVzcG9uc2UuY291bnRyeUNvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeTogcmVzcG9uc2UuY291bnRyeU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcEV4dHJhSW5mbyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFJbmZvOiBleHRyYUluZm9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZXJyb3IoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uSXA6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBMb2NhdGlvbklwQmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25JcENvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZShcInBpcExvY2F0aW9uSXBcIiwgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTG9jYXRpb25JcCcsIExvY2F0aW9uSXApO1xyXG59Iiwie1xyXG5cclxuICAgIGludGVyZmFjZSBJTG9jYXRpb25NYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zaXRpb25zOiBhbnk7XHJcbiAgICAgICAgcGlwSWNvblBhdGg6IGFueTtcclxuICAgICAgICBwaXBEcmFnZ2FibGU6IGFueTtcclxuICAgICAgICBwaXBTdHJldGNoOiBhbnk7XHJcbiAgICAgICAgcGlwUmViaW5kOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25NYXBCaW5kaW5nczogSUxvY2F0aW9uTWFwQmluZGluZ3MgPSB7XHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6ICc8JyxcclxuICAgICAgICBwaXBMb2NhdGlvblBvc2l0aW9uczogJzwnLFxyXG4gICAgICAgIHBpcEljb25QYXRoOiAnPCcsXHJcbiAgICAgICAgcGlwRHJhZ2dhYmxlOiAnPCcsXHJcbiAgICAgICAgcGlwU3RyZXRjaDogJzwnLFxyXG4gICAgICAgIHBpcFJlYmluZDogJzwnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25NYXBCaW5kaW5nc0NoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJTG9jYXRpb25NYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvblBvczogbmcuSUNoYW5nZXNPYmplY3Q8YW55PjtcclxuICAgICAgICBwaXBMb2NhdGlvblBvc2l0aW9uczogbmcuSUNoYW5nZXNPYmplY3Q8YW55PjtcclxuICAgICAgICBwaXBJY29uUGF0aDogbmcuSUNoYW5nZXNPYmplY3Q8c3RyaW5nPjtcclxuICAgICAgICBwaXBEcmFnZ2FibGU6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgICAgIHBpcFN0cmV0Y2g6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgICAgIHBpcFJlYmluZDogbmcuSUNoYW5nZXNPYmplY3Q8Ym9vbGVhbj47XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25NYXBDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIElMb2NhdGlvbk1hcEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3NpdGlvbnM6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwSWNvblBhdGg6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwRHJhZ2dhYmxlOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBwaXBTdHJldGNoOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBwaXBSZWJpbmQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250cm9sOiBhbnkgPSBudWxsO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24tbWFwJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBMb2NhdGlvbk1hcEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBpcFJlYmluZCA9IGNoYW5nZXMucGlwUmViaW5kID8gY2hhbmdlcy5waXBSZWJpbmQuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwRHJhZ2dhYmxlID0gY2hhbmdlcy5waXBEcmFnZ2FibGUgPyBjaGFuZ2VzLnBpcERyYWdnYWJsZS5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5waXBTdHJldGNoID0gY2hhbmdlcy5waXBTdHJldGNoID8gY2hhbmdlcy5waXBTdHJldGNoLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwU3RyZXRjaCA9PT0gdHJ1ZSkgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLmFkZENsYXNzKCdzdHJldGNoJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5yZW1vdmVDbGFzcygnc3RyZXRjaCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBSZWJpbmQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zID8gY2hhbmdlcy5waXBMb2NhdGlvblBvcy5jdXJyZW50VmFsdWUgOiB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvc2l0aW9ucyA9IGNoYW5nZXMucGlwTG9jYXRpb25Qb3NpdGlvbnMgPyBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zaXRpb25zLmN1cnJlbnRWYWx1ZSA6IHRoaXMucGlwTG9jYXRpb25Qb3M7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcEljb25QYXRoID0gY2hhbmdlcy5waXBJY29uUGF0aCA/IGNoYW5nZXMucGlwSWNvblBhdGguY3VycmVudFZhbHVlIDogdGhpcy5waXBJY29uUGF0aDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNoZWNrTG9jYXRpb24obG9jKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhKGxvYyA9PSBudWxsIHx8IGxvYy5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvYy5jb29yZGluYXRlcy5sZW5ndGggPCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcG9pbnQuZmlsbCA9IGxvYy5maWxsO1xyXG4gICAgICAgICAgICBwb2ludC5zdHJva2UgPSBsb2Muc3Ryb2tlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLnBpcExvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25zID0gdGhpcy5waXBMb2NhdGlvblBvc2l0aW9ucyxcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlID0gdGhpcy5waXBEcmFnZ2FibGUgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja0xvY2F0aW9uKGxvY2F0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2godGhpcy5kZXRlcm1pbmVDb29yZGluYXRlcyhsb2NhdGlvbikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9ucyAmJiBsb2NhdGlvbnMubGVuZ3RoICYmIGxvY2F0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5lYWNoKGxvY2F0aW9ucywgKGxvYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0xvY2F0aW9uKGxvYykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHRoaXMuZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wuYXBwZW5kVG8odGhpcy5tYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXBcclxuICAgICAgICAgICAgY29uc3QgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHBvaW50c1swXSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZHJhZ2dhYmxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZHJhZ2dhYmxlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLm1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpLFxyXG4gICAgICAgICAgICAgICAgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIG1hcmtlcnNcclxuICAgICAgICAgICAgXy5lYWNoKHBvaW50cywgKHBvaW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpY29uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMucGlwSWNvblBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBwb2ludC5maWxsIHx8ICcjRUY1MzUwJyxcclxuICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMSxcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMSxcclxuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogcG9pbnQuc3Ryb2tlIHx8ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiA1XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb2ludCxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiB0aGlzLnBpcEljb25QYXRoID8gaWNvbiA6IG51bGxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChwb2ludCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQXV0by1jb25maWcgb2Ygem9vbSBhbmQgY2VudGVyXHJcbiAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbk1hcDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExvY2F0aW9uTWFwQmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25NYXBDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoXCJwaXBMb2NhdGlvbk1hcFwiLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBMb2NhdGlvbk1hcCcsIExvY2F0aW9uTWFwKTtcclxufSIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbi9Mb2NhdGlvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1uYW1lIGxvY2F0aW9uLWNvbGxhcHNlXCIgbmctY2xpY2s9XCIkY3RybC5waXBMb2NhdGlvblJlc2l6ZSgpXCIgbmctaWY9XCIhJGN0cmwucGlwQ29sbGFwc2VcIlxcbicgK1xuICAgICcgICAgbmctY2xhc3M9XCIkY3RybC5waXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj5cXG4nICtcbiAgICAnICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cInBpcC1sb2NhdGlvbi10ZXh0XCI+e3skY3RybC5waXBMb2NhdGlvbk5hbWV9fTwvc3Bhbj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8bWQtYnV0dG9uIGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWVcIiBuZy1jbGljaz1cIiRjdHJsLnBpcExvY2F0aW9uUmVzaXplKClcIiBuZy1pZj1cIiRjdHJsLnBpcENvbGxhcHNlXCJcXG4nICtcbiAgICAnICAgIG5nLWNsYXNzPVwiJGN0cmwucGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ3BpcC1sb2NhdGlvbi1pY29uLXNwYWNlXFwnIDogXFwnXFwnXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwibGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBsYXlvdXQtcm93IHctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dCBmbGV4XCI+e3skY3RybC5waXBMb2NhdGlvbk5hbWV9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLWRvd25cIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1zaG93PVwiISRjdHJsLnNob3dNYXBcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp0cmlhbmdsZS11cFwiIGNsYXNzPVwiZmxleC1maXhlZFwiIG5nLXNob3c9XCIkY3RybC5zaG93TWFwXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb25fZGlhbG9nL0xvY2F0aW9uRGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgbGF5b3V0LWNvbHVtblwiIG1kLXRoZW1lPVwie3skY3RybC50aGVtZX19XCI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1oZWFkZXIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3RhcnQtc3RhcnRcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtcHJvZ3Jlc3MtbGluZWFyIG5nLXNob3c9XCIkY3RybC50cmFuc2FjdGlvbi5idXN5KClcIiBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicGlwLXByb2dyZXNzLXRvcFwiPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtcHJvZ3Jlc3MtbGluZWFyPlxcbicgK1xuICAgICcgICAgICAgIDxoMyBjbGFzcz1cImZsZXhcIj57eyBcXCdMT0NBVElPTl9TRVRfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2gzPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicGlwLWZvb3RlclwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXJcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25BZGRQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyA9PSBudWxsXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25SZW1vdmVQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyAhPSBudWxsXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleFwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5vbkNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnQ0FOQ0VMXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgOjpcXCdDQU5DRUxcXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQXBwbHkoKVwiIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0FQUExZXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgOjpcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1ib2R5XCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC16b29tLWluXCIgbmctY2xpY2s9XCIkY3RybC5vblpvb21JbigpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fSU5cXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1c1wiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC16b29tLW91dFwiIG5nLWNsaWNrPVwiJGN0cmwub25ab29tT3V0KClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fWk9PTV9PVVRcXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXNcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtc2V0LWxvY2F0aW9uXCIgbmctY2xpY2s9XCIkY3RybC5vblNldExvY2F0aW9uKClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fU0VUX0xPQ0FUSU9OXFwnICB9fVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICBuZy1zaG93PVwic3VwcG9ydFNldFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dGFyZ2V0XCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbl9lZGl0L0xvY2F0aW9uRWRpdC5odG1sJyxcbiAgICAnPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cIm1kLWJsb2NrXCI+XFxuJyArXG4gICAgJyAgICA8bGFiZWw+e3sgXFwnTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2xhYmVsPlxcbicgK1xuICAgICcgICAgPGlucHV0IG5nLW1vZGVsPVwiJGN0cmwucGlwTG9jYXRpb25OYW1lXCIgbmctZGlzYWJsZWQ9XCIkY3RybC5uZ0Rpc2FibGVkXCIvPlxcbicgK1xuICAgICc8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1lbXB0eVwiIGxheW91dD1cImNvbHVtblwiIGxheW91dC1hbGlnbj1cImNlbnRlciBjZW50ZXJcIj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1yYWlzZWRcIiBuZy1kaXNhYmxlZD1cIiRjdHJsLm5nRGlzYWJsZWRcIiBuZy1jbGljaz1cIiRjdHJsLm9uU2V0TG9jYXRpb24oKVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJMT0NBVElPTl9BRERfTE9DQVRJT05cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWxvY2F0aW9uXCI+PC9zcGFuPiB7e1xcJ0xPQ0FUSU9OX0FERF9MT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiIHRhYmluZGV4PVwie3sgJGN0cmwubmdEaXNhYmxlZCA/IC0xIDogMCB9fVwiIFxcbicgK1xuICAgICcgICAgbmctY2xpY2s9XCIkY3RybC5vbk1hcENsaWNrKCRldmVudClcIiBuZy1rZXlwcmVzcz1cIiRjdHJsLm9uTWFwS2V5UHJlc3MoJGV2ZW50KVwiPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1sb2NhdGlvbnMtaHRtbC5qcy5tYXBcbiJdfQ==