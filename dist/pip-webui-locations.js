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
            this.pipRebind = changes.pipRebind ? changes.pipRebind.currentValue || false : false;
            this.pipShowLocationIcon = changes.pipShowLocationIcon ? changes.pipShowLocationIcon.currentValue || false : false;
            this.pipCollapse = changes.pipCollapse ? changes.pipCollapse.currentValue || false : false;
            this.pipDisabled = changes.pipDisabled ? changes.pipDisabled.currentValue || false : false;
            if (this.pipRebind) {
                this.pipLocationName = changes.pipLocationName ? changes.pipLocationName.currentValue : null;
                this.pipLocationPos = changes.pipLocationPos ? changes.pipLocationPos.currentValue : null;
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
            if (this.showMap === false || location == null || location.coordinates == null || location.coordinates.length < 0) {
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
        templateUrl: 'location/location.html',
        controller: LocationController
    };
    angular.module("pipLocation", [])
        .component('pipLocation', LocationComponent);
}
},{}],3:[function(require,module,exports){
"use strict";
},{}],4:[function(require,module,exports){
"use strict";
var LocationEditDialogController = (function () {
    function LocationEditDialogController($scope, $rootScope, $timeout, $mdDialog, locationPos, locationName) {
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
    LocationEditDialogController.prototype.onAddPin = function () {
        if (this._map === null)
            return;
        var coordinates = this._map.getCenter();
        this._marker = this.createMarker(coordinates);
        this.changeLocation(coordinates, null);
    };
    LocationEditDialogController.prototype.onRemovePin = function () {
        if (this._map === null)
            return;
        this._marker = this.createMarker(null);
        this.locationPos = null;
        this.locationName = null;
    };
    LocationEditDialogController.prototype.onZoomIn = function () {
        if (this._map === null)
            return;
        var zoom = this._map.getZoom();
        this._map.setZoom(zoom + 1);
    };
    LocationEditDialogController.prototype.onZoomOut = function () {
        if (this._map === null)
            return;
        var zoom = this._map.getZoom();
        this._map.setZoom(zoom > 1 ? zoom - 1 : zoom);
    };
    LocationEditDialogController.prototype.onCancel = function () {
        this.$mdDialog.cancel();
    };
    LocationEditDialogController.prototype.onApply = function () {
        this.$mdDialog.hide({
            location: this.locationPos,
            locationPos: this.locationPos,
            locationName: this.locationName
        });
    };
    return LocationEditDialogController;
}());
exports.LocationEditDialogController = LocationEditDialogController;
{
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
    angular.module('pipLocationEditDialog')
        .run(LocationDialogRun);
}
},{}],5:[function(require,module,exports){
"use strict";
var locationDialog_1 = require("./locationDialog");
{
    var LocationDialogService = (function () {
        LocationDialogService.$inject = ['$mdDialog'];
        function LocationDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        LocationDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                controller: locationDialog_1.LocationEditDialogController,
                controllerAs: '$ctrl',
                templateUrl: 'location_dialog/locationDialog.html',
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
    angular.module('pipLocationEditDialog')
        .service('pipLocationEditDialog', LocationDialogService);
}
},{"./locationDialog":7}],6:[function(require,module,exports){
"use strict";
angular.module('pipLocationEditDialog', ['ngMaterial', 'pipLocations.Templates']);
require("./locationDialog");
require("./locationDialogService");
},{"./locationDialog":7,"./locationDialogService":8}],7:[function(require,module,exports){
"use strict";
var LocationEditDialogController = (function () {
    function LocationEditDialogController($scope, $rootScope, $timeout, $mdDialog, locationPos, locationName) {
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
    LocationEditDialogController.prototype.onAddPin = function () {
        if (this._map === null)
            return;
        var coordinates = this._map.getCenter();
        this._marker = this.createMarker(coordinates);
        this.changeLocation(coordinates, null);
    };
    LocationEditDialogController.prototype.onRemovePin = function () {
        if (this._map === null)
            return;
        this._marker = this.createMarker(null);
        this.locationPos = null;
        this.locationName = null;
    };
    LocationEditDialogController.prototype.onZoomIn = function () {
        if (this._map === null)
            return;
        var zoom = this._map.getZoom();
        this._map.setZoom(zoom + 1);
    };
    LocationEditDialogController.prototype.onZoomOut = function () {
        if (this._map === null)
            return;
        var zoom = this._map.getZoom();
        this._map.setZoom(zoom > 1 ? zoom - 1 : zoom);
    };
    LocationEditDialogController.prototype.onCancel = function () {
        this.$mdDialog.cancel();
    };
    LocationEditDialogController.prototype.onApply = function () {
        this.$mdDialog.hide({
            location: this.locationPos,
            locationPos: this.locationPos,
            locationName: this.locationName
        });
    };
    return LocationEditDialogController;
}());
exports.LocationEditDialogController = LocationEditDialogController;
{
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
    angular.module('pipLocationEditDialog')
        .run(LocationDialogRun);
}
},{}],8:[function(require,module,exports){
"use strict";
var locationDialog_1 = require("./locationDialog");
{
    var LocationDialogService = (function () {
        LocationDialogService.$inject = ['$mdDialog'];
        function LocationDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        LocationDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                controller: locationDialog_1.LocationEditDialogController,
                controllerAs: '$ctrl',
                templateUrl: 'location_dialog/locationDialog.html',
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
    angular.module('pipLocationEditDialog')
        .service('pipLocationEditDialog', LocationDialogService);
}
},{"./locationDialog":7}],9:[function(require,module,exports){
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
        templateUrl: 'location_edit/locationEdit.html',
        controller: LocationEditController
    };
    angular.module("pipLocationEdit", ['pipLocationEditDialog'])
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
    angular.module("pipLocationIp", [])
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
    angular.module("pipLocationMap", [])
        .component('pipLocationMap', LocationMap);
}
},{}],12:[function(require,module,exports){
angular.module('pipLocations', [
    'pipLocation',
    'pipLocationMap',
    'pipLocationIp',
    'pipLocationEditDialog',
    'pipLocationEdit',
    'pipLocations.Translate'
]);
},{}],13:[function(require,module,exports){
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



},{}]},{},[13,1,3,6,4,5,9,10,11,2,12])(13)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9Mb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvTG9jYXRpb25EaWFsb2cudHMiLCJzcmMvbG9jYXRpb25fZGlhbG9nL0xvY2F0aW9uRGlhbG9nU2VydmljZS50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvaW5kZXgudHMiLCJzcmMvbG9jYXRpb25fZGlhbG9nL2xvY2F0aW9uRGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbkRpYWxvZ1NlcnZpY2UudHMiLCJzcmMvbG9jYXRpb25fZWRpdC9Mb2NhdGlvbkVkaXQudHMiLCJzcmMvbG9jYXRpb25faXAvTG9jYXRpb25JcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvTG9jYXRpb25NYXAudHMiLCJzcmMvbG9jYXRpb25zLnRzIiwidGVtcC9waXAtd2VidWktbG9jYXRpb25zLWh0bWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5RCxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxVQUFVLFNBQVM7UUFDOUMsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7Y0FDMUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFM0MsTUFBTSxDQUFDLFVBQVUsR0FBRztZQUNoQixNQUFNLENBQUMsWUFBWSxHQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNwRSxDQUFDLENBQUE7SUFDTCxDQUFDLENBQUMsQ0FBQztB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJywgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZmlsdGVyKCd0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpIFxyXG4gICAgICAgICAgICA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcFRyYW5zbGF0ZSAgPyBwaXBUcmFuc2xhdGUudHJhbnNsYXRlKGtleSkgfHwga2V5IDoga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIntcclxuICAgIGludGVyZmFjZSBJTG9jYXRpb25CaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246IGFueTtcclxuICAgICAgICBwaXBDb2xsYXBzZTogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgICAgIHBpcERpc2FibGVkOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkJpbmRpbmdzOiBJTG9jYXRpb25CaW5kaW5ncyA9IHtcclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6ICc8JyxcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogJzwnLFxyXG4gICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246ICc8JyxcclxuICAgICAgICBwaXBDb2xsYXBzZTogJzwnLFxyXG4gICAgICAgIHBpcFJlYmluZDogJzwnLFxyXG4gICAgICAgIHBpcERpc2FibGVkOiAnPCcsXHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6ICcmJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25OYW1lOiBuZy5JQ2hhbmdlc09iamVjdCA8IHN0cmluZyA+IDtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHBpcENvbGxhcHNlOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwUmViaW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwRGlzYWJsZWQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbkNvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uQmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvbk5hbWU6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwU2hvd0xvY2F0aW9uSWNvbjogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwQ29sbGFwc2U6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHBpcFJlYmluZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwRGlzYWJsZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHNob3dNYXA6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvblJlc2l6ZTogRnVuY3Rpb247XHJcblxyXG4gICAgICAgIHByaXZhdGUgbmFtZTogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250cm9sOiBKUXVlcnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBpcC1sb2NhdGlvbi1uYW1lJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBDb2xsYXBzZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dNYXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB1c2VyIGNsaWNrXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lLmNsaWNrKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGlwRGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93TWFwID0gIXRoaXMuc2hvd01hcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbdGhpcy5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93TWFwKSB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy4kc2NvcGUuJCRwaGFzZSkgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWRyYXdNYXAoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlZHJhd01hcCgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcENvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBMb2NhdGlvblBvcyAmJiB0aGlzLnNob3dNYXAgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25CaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5waXBSZWJpbmQgPSBjaGFuZ2VzLnBpcFJlYmluZCA/IGNoYW5nZXMucGlwUmViaW5kLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcFNob3dMb2NhdGlvbkljb24gPSBjaGFuZ2VzLnBpcFNob3dMb2NhdGlvbkljb24gPyBjaGFuZ2VzLnBpcFNob3dMb2NhdGlvbkljb24uY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwQ29sbGFwc2UgPSBjaGFuZ2VzLnBpcENvbGxhcHNlID8gY2hhbmdlcy5waXBDb2xsYXBzZS5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5waXBEaXNhYmxlZCA9IGNoYW5nZXMucGlwRGlzYWJsZWQgPyBjaGFuZ2VzLnBpcERpc2FibGVkLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwUmViaW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uTmFtZSA9IGNoYW5nZXMucGlwTG9jYXRpb25OYW1lID8gY2hhbmdlcy5waXBMb2NhdGlvbk5hbWUuY3VycmVudFZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zID8gY2hhbmdlcy5waXBMb2NhdGlvblBvcy5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWRyYXdNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG5cclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd01hcCA9PT0gZmFsc2UgfHwgbG9jYXRpb24gPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sLmFwcGVuZFRvKHRoaXMubWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgIGNvbnN0XHJcbiAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKHRoaXMubWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25Db21wb25lbnQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBMb2NhdGlvbkJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9jYXRpb24vbG9jYXRpb24uaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25Db250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvblwiLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBMb2NhdGlvbicsIExvY2F0aW9uQ29tcG9uZW50KTtcclxufSIsImV4cG9ydCBjbGFzcyBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyIHtcclxuICAgICAgICBwcml2YXRlIF9tYXAgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgX21hcmtlciA9IG51bGw7XHJcblxyXG4gICAgICAgIHB1YmxpYyB0aGVtZTogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBsb2NhdGlvblBvcztcclxuICAgICAgICBwdWJsaWMgbG9jYXRpb25OYW1lO1xyXG4gICAgICAgIHB1YmxpYyBzdXBwb3J0U2V0OiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UsXHJcbiAgICAgICAgICAgIGxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICBsb2NhdGlvbk5hbWU6IHN0cmluZ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLnRoZW1lID0gJHJvb3RTY29wZVsnJHRoZW1lJ107XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSBsb2NhdGlvblBvcyAmJiBsb2NhdGlvblBvcy50eXBlID09ICdQb2ludCcgJiZcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzICYmIGxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyID9cclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zIDogbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc3VwcG9ydFNldCA9IG5hdmlnYXRvci5nZW9sb2NhdGlvbiAhPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCB1bnRpbCBkaWFsb2cgaXMgaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1hcENvbnRhaW5lciA9ICQoJy5waXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXJcclxuICAgICAgICAgICAgICAgIGxldCBjb29yZGluYXRlcyA9IHRoaXMubG9jYXRpb25Qb3MgP1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICAgICAgbGV0IG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuY2VudGVyID0gY29vcmRpbmF0ZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucy56b29tID0gMTI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBDb250YWluZXJbMF0sIG1hcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpeCByZXNpemluZyBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIodGhpcy5fbWFwLCAncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdwaXBMYXlvdXRSZXNpemVkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuX21hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZU1hcmtlcihjb29yZGluYXRlcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFya2VyKSB0aGlzLl9tYXJrZXIuc2V0TWFwKG51bGwpO1xyXG4gICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IHRoaXMuX21hcCxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRoaXNNYXJrZXIgPSB0aGlzLl9tYXJrZXI7XHJcbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzTWFya2VyLCAnZHJhZ2VuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzTWFya2VyLmdldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXJrZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCB0aWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXHJcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW2Nvb3JkaW5hdGVzLmxhdCgpLCBjb29yZGluYXRlcy5sbmcoKV1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbk5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAvLyBSZWFkIGFkZHJlc3NcclxuICAgICAgICAgICAgY29uc3QgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7XHJcbiAgICAgICAgICAgICAgICBsYXRMbmc6IGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIH0sIChyZXN1bHRzLCBzdGF0dXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcG9zaXRpdmUgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRGVzY3JpYmUgdXNlciBhY3Rpb25zXHJcbiAgICAgICAgcHVibGljIG9uQWRkUGluKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblJlbW92ZVBpbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSB0aGlzLmNyZWF0ZU1hcmtlcihudWxsKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblpvb21JbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oem9vbSArIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uWm9vbU91dCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oem9vbSA+IDEgPyB6b29tIC0gMSA6IHpvb20pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uU2V0TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgICAgICAocG9zaXRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcocG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLCBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSB0aGlzLmNyZWF0ZU1hcmtlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFwLnNldENlbnRlcihjb29yZGluYXRlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFwLnNldFpvb20oMTIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbkNhbmNlbCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kbWREaWFsb2cuY2FuY2VsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25BcHBseSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiB0aGlzLmxvY2F0aW9uUG9zLFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLmxvY2F0aW9uTmFtZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbntcclxuICAgIGNvbnN0IExvY2F0aW9uRGlhbG9nUnVuID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGUnKSA6IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfTE9DQVRJT04nOiAnQWRkIGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9TRVRfTE9DQVRJT04nOiAnU2V0IGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfUElOJzogJ0FkZCBwaW4nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAnUmVtb3ZlIHBpbidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0LzQtdGB0YLQvtC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ9Ce0L/RgNC10LTQtdC70LjRgtGMINC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICfQlNC+0LHQsNCy0LjRgtGMINGC0L7Rh9C60YMnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAn0KPQsdGA0LDRgtGMINGC0L7Rh9C60YMnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycpXHJcbiAgICAgICAgLnJ1bihMb2NhdGlvbkRpYWxvZ1J1bik7XHJcbn0iLCJpbXBvcnQge1xyXG4gICAgTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlclxyXG59IGZyb20gJy4vbG9jYXRpb25EaWFsb2cnO1xyXG5cclxuaW1wb3J0IHsgSUxvY2F0aW9uRGlhbG9nU2VydmljZSB9IGZyb20gJy4vSUxvY2F0aW9uRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcbiAgICBjbGFzcyBMb2NhdGlvbkRpYWxvZ1NlcnZpY2UgaW1wbGVtZW50cyBJTG9jYXRpb25EaWFsb2dTZXJ2aWNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICAgICApIHt9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzaG93KHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrPywgY2FuY2VsQ2FsbGJhY2s/KSB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnJGN0cmwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbG9jYXRpb25fZGlhbG9nL2xvY2F0aW9uRGlhbG9nLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWU6IHBhcmFtcy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiBwYXJhbXMubG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2socmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmNlbENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLCBMb2NhdGlvbkRpYWxvZ1NlcnZpY2UpO1xyXG59IiwiYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFsnbmdNYXRlcmlhbCcsICdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJ10pO1xyXG5cclxuaW1wb3J0ICcuL2xvY2F0aW9uRGlhbG9nJztcclxuaW1wb3J0ICcuL2xvY2F0aW9uRGlhbG9nU2VydmljZSciLCJleHBvcnQgY2xhc3MgTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICAgICAgcHJpdmF0ZSBfbWFwID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIF9tYXJrZXIgPSBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgdGhlbWU6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgbG9jYXRpb25Qb3M7XHJcbiAgICAgICAgcHVibGljIGxvY2F0aW9uTmFtZTtcclxuICAgICAgICBwdWJsaWMgc3VwcG9ydFNldDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IG5nLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlLFxyXG4gICAgICAgICAgICBsb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBzdHJpbmdcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy50aGVtZSA9ICRyb290U2NvcGVbJyR0aGVtZSddO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zID0gbG9jYXRpb25Qb3MgJiYgbG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnICYmXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvcy5jb29yZGluYXRlcyAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMiA/XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvcyA6IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnN1cHBvcnRTZXQgPSBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24gIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFdhaXQgdW50aWwgZGlhbG9nIGlzIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXBDb250YWluZXIgPSAkKCcucGlwLWxvY2F0aW9uLWVkaXQtZGlhbG9nIC5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyXHJcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzLmxvY2F0aW9uUG9zID9cclxuICAgICAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIGxldCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGNvb3JkaW5hdGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuem9vbSA9IDEyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQ29udGFpbmVyWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGaXggcmVzaXppbmcgaXNzdWVcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuX21hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTGF5b3V0UmVzaXplZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcih0aGlzLl9tYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcmtlcikgdGhpcy5fbWFya2VyLnNldE1hcChudWxsKTtcclxuICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiB0aGlzLl9tYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aGlzTWFya2VyID0gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkaW5hdGVzID0gdGhpc01hcmtlci5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgdGlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtjb29yZGluYXRlcy5sYXQoKSwgY29vcmRpbmF0ZXMubG5nKCldXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgICAgIGNvbnN0IGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoe1xyXG4gICAgICAgICAgICAgICAgbGF0TG5nOiBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICB9LCAocmVzdWx0cywgc3RhdHVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHBvc2l0aXZlIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERlc2NyaWJlIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgIHB1YmxpYyBvbkFkZFBpbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25SZW1vdmVQaW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIobnVsbCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25ab29tSW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblpvb21PdXQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gPiAxID8gem9vbSAtIDEgOiB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblNldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAgICAgKHBvc2l0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRDZW50ZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKDEyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bUFnZTogMCxcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25DYW5jZWwoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uQXBwbHkoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogdGhpcy5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5sb2NhdGlvbk5hbWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG57XHJcbiAgICBjb25zdCBMb2NhdGlvbkRpYWxvZ1J1biA9IGZ1bmN0aW9uKCRpbmplY3RvcjogbmcuYXV0by5JSW5qZWN0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAocGlwVHJhbnNsYXRlKSB7XHJcbiAgICAgICAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygnZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ0FkZCBsb2NhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ1NldCBsb2NhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICdBZGQgcGluJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ1JlbW92ZSBwaW4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICfQlNC+0LHQsNCy0LjRgtGMINC80LXRgdGC0L7Qv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICfQntC/0YDQtdC00LXQu9C40YLRjCDQv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAn0JTQvtCx0LDQstC40YLRjCDRgtC+0YfQutGDJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ9Cj0LHRgNCw0YLRjCDRgtC+0YfQutGDJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnKVxyXG4gICAgICAgIC5ydW4oTG9jYXRpb25EaWFsb2dSdW4pO1xyXG59IiwiaW1wb3J0IHtcclxuICAgIExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXJcclxufSBmcm9tICcuL2xvY2F0aW9uRGlhbG9nJztcclxuXHJcbmltcG9ydCB7IElMb2NhdGlvbkRpYWxvZ1NlcnZpY2UgfSBmcm9tICcuL0lMb2NhdGlvbkRpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgY2xhc3MgTG9jYXRpb25EaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUxvY2F0aW9uRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgc2hvdyhwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaz8sIGNhbmNlbENhbGxiYWNrPykge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJyRjdHJsJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbkRpYWxvZy5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBwYXJhbXMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogcGFyYW1zLmxvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25FZGl0RGlhbG9nJylcclxuICAgICAgICAuc2VydmljZSgncGlwTG9jYXRpb25FZGl0RGlhbG9nJywgTG9jYXRpb25EaWFsb2dTZXJ2aWNlKTtcclxufSIsImltcG9ydCB7IElMb2NhdGlvbkRpYWxvZ1NlcnZpY2UgfSBmcm9tICcuLi9sb2NhdGlvbl9kaWFsb2cvSUxvY2F0aW9uRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcblxyXG4gICAgaW50ZXJmYWNlIElMb2NhdGlvbkVkaXRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uSG9sZGVyOiBhbnk7XHJcbiAgICAgICAgbmdEaXNhYmxlZDogYW55O1xyXG4gICAgICAgIHBpcENoYW5nZWQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkVkaXRCaW5kaW5nczogSUxvY2F0aW9uRWRpdEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICBuZ0Rpc2FibGVkOiAnPCcsXHJcbiAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25FZGl0QmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uRWRpdEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6IGFueTtcclxuICAgICAgICBwaXBDaGFuZ2VkOiBhbnk7XHJcblxyXG4gICAgICAgIG5nRGlzYWJsZWQ6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uRWRpdENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uRWRpdEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25OYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uSG9sZGVyOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBuZ0Rpc2FibGVkOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBwaXBDaGFuZ2VkOiBGdW5jdGlvbjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBlbXB0eTogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250cm9sOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBkZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZDogRnVuY3Rpb247XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgcGlwTG9jYXRpb25FZGl0RGlhbG9nOiBJTG9jYXRpb25EaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXNEZWJvdW5jZWQgPSBfLmRlYm91bmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ21kLWlucHV0LWNvbnRhaW5lcicpLmF0dHIoJ21kLW5vLWZsb2F0JywgKCEhdGhpcy5waXBMb2NhdGlvbkhvbGRlcikudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIC8vIFNldCBjb250YWluZXJzXHJcbiAgICAgICAgICAgIHRoaXMuZW1wdHkgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWVtcHR5Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB3YXRjaGVyc1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goJyRjdHJsLnBpcExvY2F0aW9uTmFtZScsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUsIG9sZFZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goJyRjdHJsLnBpcExvY2F0aW9uUG9zJyxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLWVkaXQnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwTG9jYXRpb25Qb3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25FZGl0QmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmdEaXNhYmxlZCA9IGNoYW5nZXMubmdEaXNhYmxlZCA/IGNoYW5nZXMubmdEaXNhYmxlZC5jdXJyZW50VmFsdWUgOiBmYWxzZTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gVG9nZ2xlIGNvbnRyb2wgdmlzaWJpbGl0eVxyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1wdHkuc2hvdygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24gPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBUb2dnbGUgY29udHJvbCB2aXNpYmlsaXR5XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbXB0eS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFwXHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbC5hcHBlbmRUbyh0aGlzLm1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKHRoaXMubWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyksXHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkZWZpbmVDb29yZGluYXRlcygpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb25OYW1lID0gdGhpcy5waXBMb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xyXG4gICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcclxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGxvY2F0aW9uTmFtZVxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyA9PT0gbnVsbCB8fCByZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeSB8fCB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gZ2VvbWV0cnkubG9jYXRpb24gfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0cyBhZ2FpblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24ubGF0ID09PSBudWxsIHx8IGxvY2F0aW9uLmxuZyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZTogbG9jYXRpb24ubGF0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ3RpdHVkZTogbG9jYXRpb24ubG5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIG9uU2V0TG9jYXRpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5nRGlzYWJsZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25FZGl0RGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5waXBMb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6IHRoaXMucGlwTG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSByZXN1bHQubG9jYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCBjaGFuZ2UgYW55dGhpbmcgaWYgbG9jYXRpb24gaXMgYWJvdXQgdGhlIHNhbWVcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBMb2NhdGlvblBvcyAmJiB0aGlzLnBpcExvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50JyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uICYmIGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0pIDwgMC4wMDAxICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMV0pIDwgMC4wMDAxICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChsb2NhdGlvbk5hbWUgPT09IHRoaXMucGlwTG9jYXRpb25OYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbk5hbWUgPT09IG51bGwgJiYgbG9jYXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvbk5hbWUgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcsJyArIHJlc3VsdC5sb2NhdGlvbi5jb29yZGluYXRlc1sxXSArICcpJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBDaGFuZ2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgb25NYXBDbGljaygkZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmdEaXNhYmxlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbk1hcEtleVByZXNzKCRldmVudCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5uZ0Rpc2FibGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZiAoJGV2ZW50LmtleUNvZGUgPT0gMTMgfHwgJGV2ZW50LmtleUNvZGUgPT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25TZXRMb2NhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgLy8kZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uRWRpdDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExvY2F0aW9uRWRpdEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9jYXRpb25fZWRpdC9sb2NhdGlvbkVkaXQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25FZGl0Q29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25FZGl0XCIsIFsncGlwTG9jYXRpb25FZGl0RGlhbG9nJ10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTG9jYXRpb25FZGl0JywgTG9jYXRpb25FZGl0KTtcclxuXHJcbn0iLCJkZWNsYXJlIGxldCBnb29nbGU6IGFueTtcclxuXHJcbntcclxuICAgIGludGVyZmFjZSBJTG9jYXRpb25JcEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcElwYWRkcmVzczogYW55O1xyXG4gICAgICAgIHBpcEV4dHJhSW5mbzogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uSXBCaW5kaW5nczogSUxvY2F0aW9uSXBCaW5kaW5ncyA9IHtcclxuICAgICAgICBwaXBJcGFkZHJlc3M6ICc8JyxcclxuICAgICAgICBwaXBFeHRyYUluZm86ICcmJyxcclxuICAgICAgICBwaXBSZWJpbmQ6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBJSXBSZXNwb25zZUluZm8ge1xyXG4gICAgICAgIGNpdHk6IHN0cmluZztcclxuICAgICAgICByZWdpb25Db2RlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICAgICAgcmVnaW9uTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHppcENvZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgICAgICBjb3VudHJ5Q29kZTogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgICAgIGNvdW50cnlOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgbGF0aXR1ZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgICAgICBsb25naXR1ZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbklwQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uSXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBFeHRyYUluZm86IGFueTtcclxuXHJcbiAgICAgICAgcGlwSXBhZGRyZXNzOiBuZy5JQ2hhbmdlc09iamVjdCA8IHN0cmluZyA+IDtcclxuICAgICAgICBwaXBSZWJpbmQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25JcENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uSXBCaW5kaW5ncyB7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRyb2w6IGFueTtcclxuXHJcbiAgICAgICAgcHVibGljIHBpcEV4dHJhSW5mbzogYW55O1xyXG4gICAgICAgIHB1YmxpYyBwaXBJcGFkZHJlc3M6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwUmViaW5kOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkaHR0cDogbmcuSUh0dHBTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24taXAnKTtcclxuICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25JcEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBpcFJlYmluZCA9IGNoYW5nZXMucGlwUmViaW5kID8gY2hhbmdlcy5waXBSZWJpbmQuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBSZWJpbmQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwSXBhZGRyZXNzID0gY2hhbmdlcy5waXBJcGFkZHJlc3MgPyBjaGFuZ2VzLnBpcElwYWRkcmVzcy5jdXJyZW50VmFsdWUgOiB0aGlzLnBpcElwYWRkcmVzcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAobGF0aXR1ZGUsIGxvbmdpdHVkZSkge1xyXG4gICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBpZiAobGF0aXR1ZGUgPT0gbnVsbCB8fCBsb25naXR1ZGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wuYXBwZW5kVG8odGhpcy5tYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICBjb25zdCBpcEFkZHJlc3MgPSB0aGlzLnBpcElwYWRkcmVzcztcclxuXHJcbiAgICAgICAgICAgIGlmIChpcEFkZHJlc3MgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kaHR0cC5nZXQoJ2h0dHBzOi8vZnJlZWdlb2lwLm5ldC9qc29uLycgKyBpcEFkZHJlc3MpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcygocmVzcG9uc2U6IElJcFJlc3BvbnNlSW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAhPSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmxhdGl0dWRlICE9IG51bGwgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubG9uZ2l0dWRlICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAocmVzcG9uc2UubGF0aXR1ZGUsIHJlc3BvbnNlLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBFeHRyYUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiByZXNwb25zZS5jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbkNvZGU6IHJlc3BvbnNlLnJlZ2lvbkNvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiByZXNwb25zZS5yZWdpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHppcENvZGU6IHJlc3BvbnNlLnppcENvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IHJlc3BvbnNlLmNvdW50cnlDb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IHJlc3BvbnNlLmNvdW50cnlOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBFeHRyYUluZm8oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhSW5mbzogZXh0cmFJbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbklwOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTG9jYXRpb25JcEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uSXBDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvbklwXCIsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcExvY2F0aW9uSXAnLCBMb2NhdGlvbklwKTtcclxufSIsIntcclxuXHJcbiAgICBpbnRlcmZhY2UgSUxvY2F0aW9uTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvc2l0aW9uczogYW55O1xyXG4gICAgICAgIHBpcEljb25QYXRoOiBhbnk7XHJcbiAgICAgICAgcGlwRHJhZ2dhYmxlOiBhbnk7XHJcbiAgICAgICAgcGlwU3RyZXRjaDogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uTWFwQmluZGluZ3M6IElMb2NhdGlvbk1hcEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPCcsXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3NpdGlvbnM6ICc8JyxcclxuICAgICAgICBwaXBJY29uUGF0aDogJzwnLFxyXG4gICAgICAgIHBpcERyYWdnYWJsZTogJzwnLFxyXG4gICAgICAgIHBpcFN0cmV0Y2g6ICc8JyxcclxuICAgICAgICBwaXBSZWJpbmQ6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uTWFwQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3NpdGlvbnM6IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcbiAgICAgICAgcGlwSWNvblBhdGg6IG5nLklDaGFuZ2VzT2JqZWN0PHN0cmluZz47XHJcbiAgICAgICAgcGlwRHJhZ2dhYmxlOiBuZy5JQ2hhbmdlc09iamVjdDxib29sZWFuPjtcclxuICAgICAgICBwaXBTdHJldGNoOiBuZy5JQ2hhbmdlc09iamVjdDxib29sZWFuPjtcclxuICAgICAgICBwaXBSZWJpbmQ6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uTWFwQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTG9jYXRpb25NYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUG9zaXRpb25zOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcEljb25QYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIHBpcERyYWdnYWJsZTogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwU3RyZXRjaDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwUmViaW5kOiBib29sZWFuO1xyXG5cclxuICAgICAgICBwcml2YXRlIG1hcENvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udHJvbDogYW55ID0gbnVsbDtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLW1hcCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25NYXBCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5waXBSZWJpbmQgPSBjaGFuZ2VzLnBpcFJlYmluZCA/IGNoYW5nZXMucGlwUmViaW5kLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcERyYWdnYWJsZSA9IGNoYW5nZXMucGlwRHJhZ2dhYmxlID8gY2hhbmdlcy5waXBEcmFnZ2FibGUuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwU3RyZXRjaCA9IGNoYW5nZXMucGlwU3RyZXRjaCA/IGNoYW5nZXMucGlwU3RyZXRjaC5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcFN0cmV0Y2ggPT09IHRydWUpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5hZGRDbGFzcygnc3RyZXRjaCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3N0cmV0Y2gnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwUmViaW5kID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gY2hhbmdlcy5waXBMb2NhdGlvblBvcyA/IGNoYW5nZXMucGlwTG9jYXRpb25Qb3MuY3VycmVudFZhbHVlIDogdGhpcy5waXBMb2NhdGlvblBvcztcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3NpdGlvbnMgPSBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zaXRpb25zID8gY2hhbmdlcy5waXBMb2NhdGlvblBvc2l0aW9ucy5jdXJyZW50VmFsdWUgOiB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBJY29uUGF0aCA9IGNoYW5nZXMucGlwSWNvblBhdGggPyBjaGFuZ2VzLnBpcEljb25QYXRoLmN1cnJlbnRWYWx1ZSA6IHRoaXMucGlwSWNvblBhdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjaGVja0xvY2F0aW9uKGxvYykge1xyXG4gICAgICAgICAgICByZXR1cm4gIShsb2MgPT0gbnVsbCB8fCBsb2MuY29vcmRpbmF0ZXMgPT0gbnVsbCB8fCBsb2MuY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRldGVybWluZUNvb3JkaW5hdGVzKGxvYykge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHBvaW50LmZpbGwgPSBsb2MuZmlsbDtcclxuICAgICAgICAgICAgcG9pbnQuc3Ryb2tlID0gbG9jLnN0cm9rZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5waXBMb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9ucyA9IHRoaXMucGlwTG9jYXRpb25Qb3NpdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBwb2ludHMgPSBbXSxcclxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZSA9IHRoaXMucGlwRHJhZ2dhYmxlIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tMb2NhdGlvbihsb2NhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHRoaXMuZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jYXRpb24pKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbnMgJiYgbG9jYXRpb25zLmxlbmd0aCAmJiBsb2NhdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZWFjaChsb2NhdGlvbnMsIChsb2MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tMb2NhdGlvbihsb2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaCh0aGlzLmRldGVybWluZUNvb3JkaW5hdGVzKGxvYykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sLmFwcGVuZFRvKHRoaXMubWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBwb2ludHNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGRyYWdnYWJsZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGRyYWdnYWJsZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKSxcclxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBtYXJrZXJzXHJcbiAgICAgICAgICAgIF8uZWFjaChwb2ludHMsIChwb2ludCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWNvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiB0aGlzLnBpcEljb25QYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogcG9pbnQuZmlsbCB8fCAnI0VGNTM1MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IHBvaW50LnN0cm9rZSB8fCAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogNVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9pbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5waXBJY29uUGF0aCA/IGljb24gOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQocG9pbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEF1dG8tY29uZmlnIG9mIHpvb20gYW5kIGNlbnRlclxyXG4gICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25NYXA6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBMb2NhdGlvbk1hcEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uTWFwQ29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25NYXBcIiwgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTG9jYXRpb25NYXAnLCBMb2NhdGlvbk1hcCk7XHJcbn0iLCLvu78vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zJywgW1xyXG4gICAgJ3BpcExvY2F0aW9uJyxcclxuICAgICdwaXBMb2NhdGlvbk1hcCcsXHJcbiAgICAncGlwTG9jYXRpb25JcCcsXHJcbiAgICAncGlwTG9jYXRpb25FZGl0RGlhbG9nJyxcclxuICAgICdwaXBMb2NhdGlvbkVkaXQnLFxyXG4gICAgJ3BpcExvY2F0aW9ucy5UcmFuc2xhdGUnXHJcbl0pOyIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbi9sb2NhdGlvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1uYW1lIGxvY2F0aW9uLWNvbGxhcHNlXCIgbmctY2xpY2s9XCIkY3RybC5waXBMb2NhdGlvblJlc2l6ZSgpXCIgbmctaWY9XCIhJGN0cmwucGlwQ29sbGFwc2VcIlxcbicgK1xuICAgICcgICAgbmctY2xhc3M9XCIkY3RybC5waXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj5cXG4nICtcbiAgICAnICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cInBpcC1sb2NhdGlvbi10ZXh0XCI+e3skY3RybC5waXBMb2NhdGlvbk5hbWV9fTwvc3Bhbj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8bWQtYnV0dG9uIGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWVcIiBuZy1jbGljaz1cIiRjdHJsLnBpcExvY2F0aW9uUmVzaXplKClcIiBuZy1pZj1cIiRjdHJsLnBpcENvbGxhcHNlXCJcXG4nICtcbiAgICAnICAgIG5nLWNsYXNzPVwiJGN0cmwucGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ3BpcC1sb2NhdGlvbi1pY29uLXNwYWNlXFwnIDogXFwnXFwnXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwibGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBsYXlvdXQtcm93IHctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dCBmbGV4XCI+e3skY3RybC5waXBMb2NhdGlvbk5hbWV9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLWRvd25cIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1zaG93PVwiISRjdHJsLnNob3dNYXBcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp0cmlhbmdsZS11cFwiIGNsYXNzPVwiZmxleC1maXhlZFwiIG5nLXNob3c9XCIkY3RybC5zaG93TWFwXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb25fZWRpdC9sb2NhdGlvbkVkaXQuaHRtbCcsXG4gICAgJzxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJtZC1ibG9ja1wiPlxcbicgK1xuICAgICcgICAgPGxhYmVsPnt7IFxcJ0xPQ0FUSU9OXFwnIHwgdHJhbnNsYXRlIH19PC9sYWJlbD5cXG4nICtcbiAgICAnICAgIDxpbnB1dCBuZy1tb2RlbD1cIiRjdHJsLnBpcExvY2F0aW9uTmFtZVwiIG5nLWRpc2FibGVkPVwiJGN0cmwubmdEaXNhYmxlZFwiLz5cXG4nICtcbiAgICAnPC9tZC1pbnB1dC1jb250YWluZXI+XFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tZW1wdHlcIiBsYXlvdXQ9XCJjb2x1bW5cIiBsYXlvdXQtYWxpZ249XCJjZW50ZXIgY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtcmFpc2VkXCIgbmctZGlzYWJsZWQ9XCIkY3RybC5uZ0Rpc2FibGVkXCIgbmctY2xpY2s9XCIkY3RybC5vblNldExvY2F0aW9uKClcIlxcbicgK1xuICAgICcgICAgICAgICAgICBhcmlhLWxhYmVsPVwiTE9DQVRJT05fQUREX0xPQ0FUSU9OXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbi1sb2NhdGlvblwiPjwvc3Bhbj4ge3tcXCdMT0NBVElPTl9BRERfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIiB0YWJpbmRleD1cInt7ICRjdHJsLm5nRGlzYWJsZWQgPyAtMSA6IDAgfX1cIiBcXG4nICtcbiAgICAnICAgIG5nLWNsaWNrPVwiJGN0cmwub25NYXBDbGljaygkZXZlbnQpXCIgbmcta2V5cHJlc3M9XCIkY3RybC5vbk1hcEtleVByZXNzKCRldmVudClcIj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb25fZGlhbG9nL2xvY2F0aW9uRGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgbGF5b3V0LWNvbHVtblwiIG1kLXRoZW1lPVwie3skY3RybC50aGVtZX19XCI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1oZWFkZXIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3RhcnQtc3RhcnRcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtcHJvZ3Jlc3MtbGluZWFyIG5nLXNob3c9XCIkY3RybC50cmFuc2FjdGlvbi5idXN5KClcIiBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicGlwLXByb2dyZXNzLXRvcFwiPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtcHJvZ3Jlc3MtbGluZWFyPlxcbicgK1xuICAgICcgICAgICAgIDxoMyBjbGFzcz1cImZsZXhcIj57eyBcXCdMT0NBVElPTl9TRVRfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2gzPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicGlwLWZvb3RlclwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXJcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25BZGRQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyA9PSBudWxsXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25SZW1vdmVQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyAhPSBudWxsXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleFwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5vbkNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnQ0FOQ0VMXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgOjpcXCdDQU5DRUxcXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQXBwbHkoKVwiIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0FQUExZXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgOjpcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1ib2R5XCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC16b29tLWluXCIgbmctY2xpY2s9XCIkY3RybC5vblpvb21JbigpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fSU5cXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1c1wiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC16b29tLW91dFwiIG5nLWNsaWNrPVwiJGN0cmwub25ab29tT3V0KClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fWk9PTV9PVVRcXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXNcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtc2V0LWxvY2F0aW9uXCIgbmctY2xpY2s9XCIkY3RybC5vblNldExvY2F0aW9uKClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fU0VUX0xPQ0FUSU9OXFwnICB9fVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICBuZy1zaG93PVwic3VwcG9ydFNldFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dGFyZ2V0XCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1sb2NhdGlvbnMtaHRtbC5qcy5tYXBcbiJdfQ==