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
Object.defineProperty(exports, "__esModule", { value: true });
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
var LocationDialogParams = (function () {
    function LocationDialogParams() {
    }
    return LocationDialogParams;
}());
exports.LocationDialogParams = LocationDialogParams;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipLocationEditDialog', ['ngMaterial', 'pipLocations.Templates']);
require("./LocationDialog");
},{"./LocationDialog":5}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipLocations.Templates');
} catch (e) {
  module = angular.module('pipLocations.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location/location.html',
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
  $templateCache.put('location_dialog/locationDialog.html',
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
  $templateCache.put('location_edit/locationEdit.html',
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



},{}]},{},[12,1,2,4,7,8,6,9,10,11,3])(12)
});

//# sourceMappingURL=pip-webui-locations.js.map
