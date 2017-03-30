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
        pipIconPath: '<',
        pipInteractive: '<',
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
            this.pipInteractive = changes.pipInteractive ? changes.pipInteractive.currentValue || false : false;
            this.pipStretch = changes.pipStretch ? changes.pipStretch.currentValue || false : false;
            if (this.pipStretch === true) {
                this.mapContainer.addClass('stretch');
            }
            else {
                this.mapContainer.removeClass('stretch');
            }
            if (this.pipRebind === true) {
                this.pipLocationPos = changes.pipLocationPos ? changes.pipLocationPos.currentValue : this.pipLocationPos;
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
            var locations = this.pipLocationPos, points = [], interactive = this.pipInteractive || false;
            if (this.checkLocation(locations) && !_.isArray(locations)) {
                points.push(this.determineCoordinates(locations));
            }
            else {
                if (locations && _.isArray(locations) && locations.length > 0) {
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
                scrollwheel: interactive,
                draggable: interactive
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL1RyYW5zbGF0ZUZpbHRlci50cyIsInNyYy9pbmRleC50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvTG9jYXRpb25EaWFsb2cudHMiLCJzcmMvbG9jYXRpb25fZGlhbG9nL0xvY2F0aW9uRGlhbG9nUGFyYW1zLnRzIiwic3JjL2xvY2F0aW9uX2RpYWxvZy9pbmRleC50cyIsInNyYy9sb2NhdGlvbl9lZGl0L0xvY2F0aW9uRWRpdC50cyIsInNyYy9sb2NhdGlvbl9pcC9Mb2NhdGlvbklwLnRzIiwic3JjL2xvY2F0aW9uX21hcC9Mb2NhdGlvbk1hcC50cyIsInRlbXAvcGlwLXdlYnVpLWxvY2F0aW9ucy1odG1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsQ0FBQztJQUNHLHlCQUF5QixTQUFTO1FBQzlCLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO2NBQzFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxVQUFVLEdBQUc7WUFDaEIsTUFBTSxDQUFDLFlBQVksR0FBSSxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDcEUsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztJQUVELE9BQU87U0FDRixNQUFNLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDO1NBQ3BDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDOUMsQ0FBQzs7QUNiQSxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtJQUM1QixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGVBQWU7SUFDZix1QkFBdUI7SUFDdkIsaUJBQWlCO0lBQ2pCLHdCQUF3QjtDQUMzQixDQUFDLENBQUM7O0FDUEgsQ0FBQztJQWFHLElBQU0sZ0JBQWdCLEdBQXNCO1FBQ3hDLGVBQWUsRUFBRSxHQUFHO1FBQ3BCLGNBQWMsRUFBRSxHQUFHO1FBQ25CLG1CQUFtQixFQUFFLEdBQUc7UUFDeEIsV0FBVyxFQUFFLEdBQUc7UUFDaEIsU0FBUyxFQUFFLEdBQUc7UUFDZCxXQUFXLEVBQUUsR0FBRztRQUNoQixpQkFBaUIsRUFBRSxHQUFHO0tBQ3pCLENBQUE7SUFFRDtRQUFBO1FBV0EsQ0FBQztRQUFELDhCQUFDO0lBQUQsQ0FYQSxBQVdDLElBQUE7SUFFRDtRQWNJLDRCQUNZLFFBQWdCLEVBQ2hCLFFBQTRCLEVBQzVCLE1BQWlCO1lBRXpCLFVBQVUsQ0FBQztZQUpILGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFDNUIsV0FBTSxHQUFOLE1BQU0sQ0FBVztZQVZ0QixZQUFPLEdBQVksSUFBSSxDQUFDO1lBYzNCLFFBQVEsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVNLHNDQUFTLEdBQWhCO1lBQUEsaUJBc0JDO1lBckJHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ1YsS0FBSSxDQUFDLElBQUksR0FBRyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNyRCxLQUFJLENBQUMsWUFBWSxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBRWxFLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDNUIsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDekIsS0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7b0JBR3JCLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSzt3QkFDbEIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDOzRCQUFDLE1BQU0sQ0FBQzt3QkFDN0IsS0FBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUM7d0JBQzdCLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQzt3QkFDcEQsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQzs0QkFBQyxLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3JDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7NEJBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDbkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFFRCxLQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU8sc0NBQVMsR0FBakI7WUFDSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBRy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixDQUFDO1FBQ0wsQ0FBQztRQUVNLHVDQUFVLEdBQWpCLFVBQWtCLE9BQWdDO1lBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVM7a0JBQzVCLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDdEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxtQkFBbUI7a0JBQ2hELE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNoRSxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXO2tCQUNoQyxPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3hELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVc7a0JBQ2hDLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFeEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWU7c0JBQ3hDLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYztzQkFDdEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7UUFFTyxxQ0FBUSxHQUFoQjtZQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFTyx3Q0FBVyxHQUFuQjtZQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFHckMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLO21CQUNuQixRQUFRLElBQUksSUFBSTttQkFDaEIsUUFBUSxDQUFDLFdBQVcsSUFBSSxJQUFJO21CQUM1QixRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFHRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUN0QyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUN2QixRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUMxQixDQUFDO1lBR0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRzVDLElBQ0ksVUFBVSxHQUFHO2dCQUNULE1BQU0sRUFBRSxXQUFXO2dCQUNuQixJQUFJLEVBQUUsRUFBRTtnQkFDUixTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFDeEMsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsc0JBQXNCLEVBQUUsSUFBSTtnQkFDNUIsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLFNBQVMsRUFBRSxLQUFLO2FBQ25CLEVBQ0QsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNuQixRQUFRLEVBQUUsV0FBVztnQkFDckIsR0FBRyxFQUFFLEdBQUc7YUFDWCxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUEsQ0FBQztRQUNOLHlCQUFDO0lBQUQsQ0EvSEEsQUErSEMsSUFBQTtJQUVELElBQU0saUJBQWlCLEdBQXlCO1FBQzVDLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsV0FBVyxFQUFFLHdCQUF3QjtRQUNyQyxVQUFVLEVBQUUsa0JBQWtCO0tBQ2pDLENBQUE7SUFFRCxPQUFPO1NBQ0YsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7U0FDekIsU0FBUyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3JELENBQUM7Ozs7O0FDM0tELENBQUM7SUFDRztRQVNJLHdDQUNZLE1BQWlCLEVBQ3pCLFVBQWdDLEVBQ2hDLFFBQWlDLEVBQ3pCLFNBQTBDLEVBQ2xELFdBQWdCLEVBQ2hCLFlBQW9CO1lBTnhCLGlCQW1EQztZQWxEVyxXQUFNLEdBQU4sTUFBTSxDQUFXO1lBR2pCLGNBQVMsR0FBVCxTQUFTLENBQWlDO1lBWjlDLFNBQUksR0FBRyxJQUFJLENBQUM7WUFDWixZQUFPLEdBQUcsSUFBSSxDQUFDO1lBaUloQixrQkFBYSxHQUFHO2dCQUFBLGlCQWtCdEI7Z0JBakJHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFFL0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FDcEMsVUFBQyxRQUFRO29CQUNMLElBQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDaEcsS0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUM5QyxLQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDakMsS0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3RCLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxDQUFDLEVBQ0Q7b0JBQ0ksS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxFQUFFO29CQUNDLFVBQVUsRUFBRSxDQUFDO29CQUNiLGtCQUFrQixFQUFFLElBQUk7b0JBQ3hCLE9BQU8sRUFBRSxJQUFJO2lCQUNoQixDQUFDLENBQUM7WUFDWCxDQUFDLENBQUE7WUFwSUcsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLElBQUksSUFBSSxPQUFPO2dCQUN6RCxXQUFXLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQzlELFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQztZQUdoRCxRQUFRLENBQUM7Z0JBQ0wsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JBRTFFLElBQUksV0FBVyxHQUFHLEtBQUksQ0FBQyxXQUFXO29CQUM5QixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUNsQixLQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDL0IsS0FBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQ2xDLEdBQUcsSUFBSSxDQUFDO2dCQUdiLElBQU0sVUFBVSxHQUFHO29CQUNmLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BDLElBQUksRUFBRSxDQUFDO29CQUNQLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO29CQUN4QyxnQkFBZ0IsRUFBRSxJQUFJO2lCQUN6QixDQUFBO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN0QixVQUFVLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztvQkFDaEMsVUFBVSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRUQsS0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDN0QsS0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUc5QyxRQUFRLENBQUM7b0JBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25ELENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNiLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVOLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFFUCxDQUFDO1FBRU8scURBQVksR0FBcEIsVUFBcUIsV0FBVztZQUFoQyxpQkFvQkM7WUFuQkcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDbEMsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZCxTQUFTLEVBQUUsSUFBSTtvQkFDZixTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSTtpQkFDeEMsQ0FBQyxDQUFDO2dCQUVILElBQUksWUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxZQUFVLEVBQUUsU0FBUyxFQUFFO29CQUNqRCxJQUFJLFdBQVcsR0FBRyxZQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzNDLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN4QixDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVPLHVEQUFjLEdBQXRCLFVBQXVCLFdBQVcsRUFBRSxHQUFHO1lBQXZDLGlCQWtCQztZQWpCRyxJQUFJLENBQUMsV0FBVyxHQUFHO2dCQUNmLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDdEQsQ0FBQztZQUNGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBRXpCLElBQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUNiLE1BQU0sRUFBRSxXQUFXO2FBQ3RCLEVBQUUsVUFBQyxPQUFPLEVBQUUsTUFBTTtnQkFFZixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxLQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDckQsQ0FBQztnQkFFRCxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQztRQUVNLGlEQUFRLEdBQWY7WUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFFL0IsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVNLG9EQUFXLEdBQWxCO1lBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBRU0saURBQVEsR0FBZjtZQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMvQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRU0sa0RBQVMsR0FBaEI7WUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDL0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQXNCTSxpREFBUSxHQUFmO1lBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0sZ0RBQU8sR0FBZDtZQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUNoQixRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzFCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO2FBQ2xDLENBQUMsQ0FBQTtRQUNOLENBQUM7UUFDTCxxQ0FBQztJQUFELENBbEtBLEFBa0tDLElBQUE7SUFFRDtRQUNJLCtCQUNZLFNBQTBDO1lBQTFDLGNBQVMsR0FBVCxTQUFTLENBQWlDO1FBQ25ELENBQUM7UUFFRyxvQ0FBSSxHQUFYLFVBQVksTUFBNEIsRUFBRSxlQUFnQixFQUFFLGNBQWU7WUFDdkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osVUFBVSxFQUFFLDhCQUE0QjtnQkFDeEMsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLFdBQVcsRUFBRSxxQ0FBcUM7Z0JBQ2xELE1BQU0sRUFBRTtvQkFDSixZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7b0JBQ2pDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztpQkFDbEM7Z0JBQ0QsbUJBQW1CLEVBQUUsSUFBSTthQUM1QixDQUFDO2lCQUNELElBQUksQ0FBQyxVQUFDLE1BQU07Z0JBQ1QsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztvQkFDbEIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO1lBQ0wsQ0FBQyxFQUFFO2dCQUNDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLGNBQWMsRUFBRSxDQUFDO2dCQUNyQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0wsNEJBQUM7SUFBRCxDQTFCQSxBQTBCQyxJQUFBO0lBRUQsSUFBTSxpQkFBaUIsR0FBRyxVQUFTLFNBQW1DO1FBQ2xFLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFeEYsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNMLFlBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUMxQyx1QkFBdUIsRUFBRSxjQUFjO2dCQUN2Qyx1QkFBdUIsRUFBRSxjQUFjO2dCQUN2QyxrQkFBa0IsRUFBRSxTQUFTO2dCQUM3QixxQkFBcUIsRUFBRSxZQUFZO2FBQ3RDLENBQUMsQ0FBQztZQUNPLFlBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUMxQyx1QkFBdUIsRUFBRSx5QkFBeUI7Z0JBQ2xELHVCQUF1QixFQUFFLHNCQUFzQjtnQkFDL0Msa0JBQWtCLEVBQUUsZ0JBQWdCO2dCQUNwQyxxQkFBcUIsRUFBRSxjQUFjO2FBQ3hDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDLENBQUE7SUFHRCxPQUFPO1NBQ0YsTUFBTSxDQUFDLHVCQUF1QixDQUFDO1NBQy9CLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztTQUN0QixPQUFPLENBQUMsdUJBQXVCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUNqRSxDQUFDOzs7QUM1TkQ7SUFBQTtJQUtBLENBQUM7SUFBRCwyQkFBQztBQUFELENBTEEsQUFLQyxJQUFBO0FBTFksb0RBQW9COzs7QUNBakMsT0FBTyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLFlBQVksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7QUFFbEYsNEJBQXlCOzs7QUNBekIsQ0FBQztJQVdHLElBQU0sb0JBQW9CLEdBQTBCO1FBQ2hELGVBQWUsRUFBRSxHQUFHO1FBQ3BCLGNBQWMsRUFBRSxHQUFHO1FBQ25CLGlCQUFpQixFQUFFLEdBQUc7UUFDdEIsVUFBVSxFQUFFLEdBQUc7UUFDZixVQUFVLEVBQUUsR0FBRztLQUNsQixDQUFBO0lBRUQ7UUFBQTtRQVNBLENBQUM7UUFBRCxrQ0FBQztJQUFELENBVEEsQUFTQyxJQUFBO0lBRUQ7UUFZSSxnQ0FDWSxRQUFnQixFQUNoQixNQUFpQixFQUNqQixxQkFBNkM7WUFIekQsaUJBUUM7WUFQVyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVc7WUFDakIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUVyRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFDekMsS0FBSSxDQUFDLGlCQUFpQixDQUFBO1lBQzFCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSwwQ0FBUyxHQUFoQjtZQUFBLGlCQThCQztZQTdCRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUVwRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBR3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUN0QyxVQUFDLFFBQVEsRUFBRSxRQUFRO2dCQUNmLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN4QixLQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztnQkFDdEMsQ0FBQztZQUNMLENBQUMsQ0FDSixDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQ3JDO2dCQUNJLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QixDQUFDLENBQ0osQ0FBQztZQUdGLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFHNUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDO1FBRU0sMkNBQVUsR0FBakIsVUFBa0IsT0FBb0M7WUFDbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUNuRixDQUFDO1FBRU8seUNBQVEsR0FBaEI7WUFFSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFHdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTyw0Q0FBVyxHQUFuQjtZQUVJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsV0FBVyxJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFHRCxJQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUN0QyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUN2QixRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUMxQixDQUFDO1lBR0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRzlDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUdsQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFHNUMsSUFBTSxVQUFVLEdBQUc7Z0JBQ1gsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLElBQUksRUFBRSxFQUFFO2dCQUNSLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO2dCQUN4QyxnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixzQkFBc0IsRUFBRSxJQUFJO2dCQUM1QixXQUFXLEVBQUUsS0FBSztnQkFDbEIsU0FBUyxFQUFFLEtBQUs7YUFDbkIsRUFDRCxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxFQUN6RCxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLEdBQUcsRUFBRSxHQUFHO2FBQ1gsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVPLGtEQUFpQixHQUF6QjtZQUNJLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFFMUMsRUFBRSxDQUFDLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMzQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDNUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDYixPQUFPLEVBQUUsWUFBWTthQUN4QixFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU07Z0JBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO29CQUVmLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUUzQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7NEJBQzNCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDaEIsTUFBTSxDQUFDO3dCQUNYLENBQUM7d0JBRUQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQ3RDLFVBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQzt3QkFHdkMsRUFBRSxDQUFDLENBQUMsVUFBUSxDQUFDLEdBQUcsS0FBSyxJQUFJLElBQUksVUFBUSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUNqRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzs0QkFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNoQixNQUFNLENBQUM7d0JBQ1gsQ0FBQzt3QkFFRCxJQUFJLENBQUMsY0FBYyxHQUFHOzRCQUNsQixJQUFJLEVBQUUsT0FBTzs0QkFDYixXQUFXLEVBQUU7Z0NBQ1QsUUFBUSxFQUFFLFVBQVEsQ0FBQyxHQUFHLEVBQUU7Z0NBQ3hCLFVBQVUsRUFBRSxVQUFRLENBQUMsR0FBRyxFQUFFOzZCQUM3Qjt5QkFDSixDQUFDO3dCQUNGLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDdkIsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzt3QkFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNwQixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUEsQ0FBQztRQUVLLDhDQUFhLEdBQXBCO1lBQUEsaUJBa0NDO1lBakNHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBRTVCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3hCLFlBQVksRUFBRSxJQUFJLENBQUMsZUFBZTtnQkFDbEMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjO2FBQ25DLEVBQ0QsVUFBQyxNQUFNO2dCQUNILElBQ0ksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQzFCLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUd2QyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsY0FBYyxJQUFJLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLE9BQU87b0JBQzFELEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUMzQyxRQUFRLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDNUMsQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTTtvQkFDdkUsQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTTtvQkFDdkUsQ0FBQyxZQUFZLEtBQUssS0FBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDO2dCQUNYLENBQUM7Z0JBRUQsS0FBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7Z0JBQy9CLEtBQUksQ0FBQyxlQUFlLEdBQUcsWUFBWSxDQUFDO2dCQUVwQyxFQUFFLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM3QyxLQUFJLENBQUMsZUFBZTt3QkFDaEIsR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDcEMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDbkQsQ0FBQztnQkFDRCxLQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2xCLEtBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakMsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDO1FBQUEsQ0FBQztRQUVLLDJDQUFVLEdBQWpCLFVBQWtCLE1BQU07WUFDcEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFFNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFekIsQ0FBQztRQUFBLENBQUM7UUFFSyw4Q0FBYSxHQUFwQixVQUFxQixNQUFNO1lBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBRTVCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXpCLENBQUM7UUFDTCxDQUFDO1FBQUEsQ0FBQztRQUNOLDZCQUFDO0lBQUQsQ0FyTkEsQUFxTkMsSUFBQTtJQUVELElBQU0sWUFBWSxHQUF5QjtRQUN2QyxRQUFRLEVBQUUsb0JBQW9CO1FBQzlCLFdBQVcsRUFBRSxpQ0FBaUM7UUFDOUMsVUFBVSxFQUFFLHNCQUFzQjtLQUNyQyxDQUFBO0lBRUQsT0FBTztTQUNGLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDcEQsU0FBUyxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXBELENBQUM7O0FDL1BELENBQUM7SUFTRyxJQUFNLGtCQUFrQixHQUF3QjtRQUM1QyxZQUFZLEVBQUUsR0FBRztRQUNqQixZQUFZLEVBQUUsR0FBRztRQUNqQixTQUFTLEVBQUUsR0FBRztLQUNqQixDQUFBO0lBYUQ7UUFBQTtRQU9BLENBQUM7UUFBRCxnQ0FBQztJQUFELENBUEEsQUFPQyxJQUFBO0lBRUQ7UUFRSSw4QkFDSSxRQUFnQixFQUNSLEtBQXNCO1lBQXRCLFVBQUssR0FBTCxLQUFLLENBQWlCO1lBRTlCLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ2pFLFFBQVEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0seUNBQVUsR0FBakIsVUFBa0IsT0FBa0M7WUFDaEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFckYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDakcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDN0IsQ0FBQztRQUNMLENBQUM7UUFFTyx1Q0FBUSxHQUFoQjtZQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRU8sMENBQVcsR0FBbkIsVUFBb0IsUUFBUSxFQUFFLFNBQVM7WUFFbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixNQUFNLENBQUM7WUFDWCxDQUFDO1lBR0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDcEMsUUFBUSxFQUNSLFNBQVMsQ0FDWixDQUFDO1lBR0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUc1QyxJQUNJLFVBQVUsR0FBRztnQkFDVCxNQUFNLEVBQUUsV0FBVztnQkFDbkIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87Z0JBQ3hDLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLHNCQUFzQixFQUFFLElBQUk7Z0JBQzVCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixTQUFTLEVBQUUsS0FBSzthQUNuQixFQUNELEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFOUQsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLEdBQUcsRUFBRSxHQUFHO2FBQ1gsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLGdEQUFpQixHQUF6QjtZQUFBLGlCQW9DQztZQW5DRyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBRXBDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsR0FBRyxTQUFTLENBQUM7aUJBQ3BELE9BQU8sQ0FBQyxVQUFDLFFBQXlCO2dCQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSTtvQkFDaEIsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJO29CQUN6QixRQUFRLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRTdCLEtBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRXhELEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO3dCQUNwQixJQUFNLFNBQVMsR0FBRzs0QkFDZCxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7NEJBQ25CLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTs0QkFDL0IsTUFBTSxFQUFFLFFBQVEsQ0FBQyxVQUFVOzRCQUMzQixPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87NEJBQ3pCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVzs0QkFDakMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxXQUFXO3lCQUNoQyxDQUFDO3dCQUNGLEtBQUksQ0FBQyxZQUFZLENBQUM7NEJBQ2QsU0FBUyxFQUFFLFNBQVM7eUJBQ3ZCLENBQUMsQ0FBQztvQkFDUCxDQUFDO2dCQUNMLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osS0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxVQUFDLFFBQVE7Z0JBQ1osS0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUNMLDJCQUFDO0lBQUQsQ0ExR0EsQUEwR0MsSUFBQTtJQUVELElBQU0sVUFBVSxHQUF5QjtRQUNyQyxRQUFRLEVBQUUsa0JBQWtCO1FBQzVCLFFBQVEsRUFBRSw0Q0FBNEM7UUFDdEQsVUFBVSxFQUFFLG9CQUFvQjtLQUNuQyxDQUFBO0lBRUQsT0FBTztTQUNGLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO1NBQzNCLFNBQVMsQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDaEQsQ0FBQzs7QUMxSkQsQ0FBQztJQVlHLElBQU0sbUJBQW1CLEdBQXlCO1FBQzlDLGNBQWMsRUFBRSxHQUFHO1FBQ25CLFdBQVcsRUFBRSxHQUFHO1FBQ2hCLGNBQWMsRUFBRSxHQUFHO1FBQ25CLFVBQVUsRUFBRSxHQUFHO1FBQ2YsU0FBUyxFQUFFLEdBQUc7S0FDakIsQ0FBQTtJQUVEO1FBQUE7UUFRQSxDQUFDO1FBQUQsaUNBQUM7SUFBRCxDQVJBLEFBUUMsSUFBQTtJQUVEO1FBVUksK0JBQ1ksUUFBZ0I7WUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUhwQixlQUFVLEdBQVEsSUFBSSxDQUFDO1lBSzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ2pFLFFBQVEsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU0sMENBQVUsR0FBakIsVUFBa0IsT0FBbUM7WUFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDckYsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDcEcsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFeEYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsQ0FBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7Z0JBQ3pHLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUU3RixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkIsQ0FBQztRQUNMLENBQUM7UUFFTyx3Q0FBUSxHQUFoQjtZQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRU8sNkNBQWEsR0FBckIsVUFBc0IsR0FBRztZQUNyQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVPLG9EQUFvQixHQUE1QixVQUE2QixHQUFHO1lBQzVCLElBQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQ2hDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2xCLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQ3JCLENBQUM7WUFFRixLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDdEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBRTFCLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVPLDJDQUFXLEdBQW5CO1lBQUEsaUJBOERDO1lBN0RHLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQ2pDLE1BQU0sR0FBRyxFQUFFLEVBQ1gsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxDQUFDO1lBRy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RCxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFDLEdBQUc7d0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNoRCxDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFDTCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFHRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRzVDLElBQU0sVUFBVSxHQUFHO2dCQUNYLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLEVBQUUsRUFBRTtnQkFDUixTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFDeEMsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsc0JBQXNCLEVBQUUsSUFBSTtnQkFDNUIsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLFNBQVMsRUFBRSxXQUFXO2FBQ3pCLEVBQ0QsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsRUFDekQsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUc1QyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFDLEtBQUs7Z0JBQ2pCLElBQU0sSUFBSSxHQUFHO29CQUNULElBQUksRUFBRSxLQUFJLENBQUMsV0FBVztvQkFDdEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksU0FBUztvQkFDbEMsV0FBVyxFQUFFLENBQUM7b0JBQ2QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsV0FBVyxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksT0FBTztvQkFDcEMsWUFBWSxFQUFFLENBQUM7aUJBQ2xCLENBQUM7Z0JBRUYsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDbkIsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsR0FBRyxFQUFFLEdBQUc7b0JBQ1IsSUFBSSxFQUFFLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLElBQUk7aUJBQ3ZDLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBR0gsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0wsNEJBQUM7SUFBRCxDQXpIQSxBQXlIQyxJQUFBO0lBRUQsSUFBTSxXQUFXLEdBQXlCO1FBQ3RDLFFBQVEsRUFBRSxtQkFBbUI7UUFDN0IsUUFBUSxFQUFFLDRDQUE0QztRQUN0RCxVQUFVLEVBQUUscUJBQXFCO0tBQ3BDLENBQUE7SUFFRCxPQUFPO1NBQ0YsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQztTQUM1QixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEQsQ0FBQzs7QUNsS0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ7XHJcbiAgICBmdW5jdGlvbiB0cmFuc2xhdGVGaWx0ZXIoJGluamVjdG9yKSB7XHJcbiAgICAgICAgbGV0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpIFxyXG4gICAgICAgICAgICA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcFRyYW5zbGF0ZSAgPyBwaXBUcmFuc2xhdGUudHJhbnNsYXRlKGtleSkgfHwga2V5IDoga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwTG9jYXRpb25zLlRyYW5zbGF0ZScsIFtdKVxyXG4gICAgICAgIC5maWx0ZXIoJ3RyYW5zbGF0ZScsIHRyYW5zbGF0ZUZpbHRlcik7XHJcbn0iLCLvu79hbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zJywgW1xyXG4gICAgJ3BpcExvY2F0aW9uJyxcclxuICAgICdwaXBMb2NhdGlvbk1hcCcsXHJcbiAgICAncGlwTG9jYXRpb25JcCcsXHJcbiAgICAncGlwTG9jYXRpb25FZGl0RGlhbG9nJyxcclxuICAgICdwaXBMb2NhdGlvbkVkaXQnLFxyXG4gICAgJ3BpcExvY2F0aW9ucy5UcmFuc2xhdGUnXHJcbl0pOyIsIntcclxuICAgIGludGVyZmFjZSBJTG9jYXRpb25CaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246IGFueTtcclxuICAgICAgICBwaXBDb2xsYXBzZTogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgICAgIHBpcERpc2FibGVkOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkJpbmRpbmdzOiBJTG9jYXRpb25CaW5kaW5ncyA9IHtcclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6ICc8JyxcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogJzwnLFxyXG4gICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246ICc8JyxcclxuICAgICAgICBwaXBDb2xsYXBzZTogJzwnLFxyXG4gICAgICAgIHBpcFJlYmluZDogJzwnLFxyXG4gICAgICAgIHBpcERpc2FibGVkOiAnPCcsXHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6ICcmJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25OYW1lOiBuZy5JQ2hhbmdlc09iamVjdCA8IHN0cmluZyA+IDtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHBpcENvbGxhcHNlOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwUmViaW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwRGlzYWJsZWQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbkNvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uQmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvbk5hbWU6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwU2hvd0xvY2F0aW9uSWNvbjogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwQ29sbGFwc2U6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHBpcFJlYmluZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwRGlzYWJsZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHNob3dNYXA6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvblJlc2l6ZTogRnVuY3Rpb247XHJcblxyXG4gICAgICAgIHByaXZhdGUgbmFtZTogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250cm9sOiBKUXVlcnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBpcC1sb2NhdGlvbi1uYW1lJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBDb2xsYXBzZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dNYXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB1c2VyIGNsaWNrXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lLmNsaWNrKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGlwRGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93TWFwID0gIXRoaXMuc2hvd01hcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbdGhpcy5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93TWFwKSB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy4kc2NvcGUuJCRwaGFzZSkgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWRyYXdNYXAoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlZHJhd01hcCgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcENvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBMb2NhdGlvblBvcyAmJiB0aGlzLnNob3dNYXAgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25CaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5waXBSZWJpbmQgPSBjaGFuZ2VzLnBpcFJlYmluZCBcclxuICAgICAgICAgICAgICAgID8gY2hhbmdlcy5waXBSZWJpbmQuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwU2hvd0xvY2F0aW9uSWNvbiA9IGNoYW5nZXMucGlwU2hvd0xvY2F0aW9uSWNvbiBcclxuICAgICAgICAgICAgICAgID8gY2hhbmdlcy5waXBTaG93TG9jYXRpb25JY29uLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcENvbGxhcHNlID0gY2hhbmdlcy5waXBDb2xsYXBzZSBcclxuICAgICAgICAgICAgICAgID8gY2hhbmdlcy5waXBDb2xsYXBzZS5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5waXBEaXNhYmxlZCA9IGNoYW5nZXMucGlwRGlzYWJsZWQgXHJcbiAgICAgICAgICAgICAgICA/IGNoYW5nZXMucGlwRGlzYWJsZWQuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBSZWJpbmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25OYW1lID0gY2hhbmdlcy5waXBMb2NhdGlvbk5hbWUgXHJcbiAgICAgICAgICAgICAgICAgICAgPyBjaGFuZ2VzLnBpcExvY2F0aW9uTmFtZS5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IGNoYW5nZXMucGlwTG9jYXRpb25Qb3MgXHJcbiAgICAgICAgICAgICAgICAgICAgPyBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zLmN1cnJlbnRWYWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZHJhd01hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdlbmVyYXRlTWFwKCkge1xyXG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMucGlwTG9jYXRpb25Qb3M7XHJcblxyXG4gICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93TWFwID09PSBmYWxzZSBcclxuICAgICAgICAgICAgICAgIHx8IGxvY2F0aW9uID09IG51bGwgXHJcbiAgICAgICAgICAgICAgICB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsIFxyXG4gICAgICAgICAgICAgICAgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wuYXBwZW5kVG8odGhpcy5tYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkNvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExvY2F0aW9uQmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2NhdGlvbi9Mb2NhdGlvbi5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBMb2NhdGlvbkNvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZShcInBpcExvY2F0aW9uXCIsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcExvY2F0aW9uJywgTG9jYXRpb25Db21wb25lbnQpO1xyXG59IiwiaW1wb3J0IHsgSUxvY2F0aW9uRGlhbG9nU2VydmljZSB9IGZyb20gJy4vSUxvY2F0aW9uRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCB7IExvY2F0aW9uRGlhbG9nUGFyYW1zIH0gZnJvbSAnLi9Mb2NhdGlvbkRpYWxvZ1BhcmFtcyc7XHJcblxyXG57XHJcbiAgICBjbGFzcyBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyIHtcclxuICAgICAgICBwcml2YXRlIF9tYXAgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgX21hcmtlciA9IG51bGw7XHJcblxyXG4gICAgICAgIHB1YmxpYyB0aGVtZTogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBsb2NhdGlvblBvcztcclxuICAgICAgICBwdWJsaWMgbG9jYXRpb25OYW1lO1xyXG4gICAgICAgIHB1YmxpYyBzdXBwb3J0U2V0OiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgICAgICAgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UsXHJcbiAgICAgICAgICAgIGxvY2F0aW9uUG9zOiBhbnksXHJcbiAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogc3RyaW5nXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGhlbWUgPSAkcm9vdFNjb3BlWyckdGhlbWUnXTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcyA9IGxvY2F0aW9uUG9zICYmIGxvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50JyAmJlxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMgJiYgbG9jYXRpb25Qb3MuY29vcmRpbmF0ZXMubGVuZ3RoID09IDIgP1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25Qb3MgOiBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IGxvY2F0aW9uTmFtZTtcclxuICAgICAgICAgICAgdGhpcy5zdXBwb3J0U2V0ID0gbmF2aWdhdG9yLmdlb2xvY2F0aW9uICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IHVudGlsIGRpYWxvZyBpcyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWFwQ29udGFpbmVyID0gJCgnLnBpcC1sb2NhdGlvbi1lZGl0LWRpYWxvZyAucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlclxyXG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkaW5hdGVzID0gdGhpcy5sb2NhdGlvblBvcyA/XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvblBvcy5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGNvb3JkaW5hdGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuem9vbSA9IDEyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQ29udGFpbmVyWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGaXggcmVzaXppbmcgaXNzdWVcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuX21hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTGF5b3V0UmVzaXplZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcih0aGlzLl9tYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcmtlcikgdGhpcy5fbWFya2VyLnNldE1hcChudWxsKTtcclxuICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiB0aGlzLl9tYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aGlzTWFya2VyID0gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkaW5hdGVzID0gdGhpc01hcmtlci5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgdGlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtjb29yZGluYXRlcy5sYXQoKSwgY29vcmRpbmF0ZXMubG5nKCldXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgICAgIGNvbnN0IGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoe1xyXG4gICAgICAgICAgICAgICAgbGF0TG5nOiBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICB9LCAocmVzdWx0cywgc3RhdHVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHBvc2l0aXZlIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERlc2NyaWJlIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgIHB1YmxpYyBvbkFkZFBpbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25SZW1vdmVQaW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIobnVsbCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25ab29tSW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblpvb21PdXQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gPiAxID8gem9vbSAtIDEgOiB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblNldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAgICAgKHBvc2l0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRDZW50ZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKDEyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bUFnZTogMCxcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25DYW5jZWwoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uQXBwbHkoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogdGhpcy5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5sb2NhdGlvbk5hbWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvY2F0aW9uRGlhbG9nU2VydmljZSBpbXBsZW1lbnRzIElMb2NhdGlvbkRpYWxvZ1NlcnZpY2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgICAgICkge31cclxuXHJcbiAgICAgICAgcHVibGljIHNob3cocGFyYW1zOiBMb2NhdGlvbkRpYWxvZ1BhcmFtcywgc3VjY2Vzc0NhbGxiYWNrPywgY2FuY2VsQ2FsbGJhY2s/KSB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnJGN0cmwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbG9jYXRpb25fZGlhbG9nL0xvY2F0aW9uRGlhbG9nLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWU6IHBhcmFtcy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiBwYXJhbXMubG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2socmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmNlbENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uRGlhbG9nUnVuID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGUnKSA6IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfTE9DQVRJT04nOiAnQWRkIGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9TRVRfTE9DQVRJT04nOiAnU2V0IGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9BRERfUElOJzogJ0FkZCBwaW4nLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAnUmVtb3ZlIHBpbidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ9CU0L7QsdCw0LLQuNGC0Ywg0LzQtdGB0YLQvtC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ9Ce0L/RgNC10LTQtdC70LjRgtGMINC/0L7Qu9C+0LbQtdC90LjQtScsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICfQlNC+0LHQsNCy0LjRgtGMINGC0L7Rh9C60YMnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1JFTU9WRV9QSU4nOiAn0KPQsdGA0LDRgtGMINGC0L7Rh9C60YMnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycpXHJcbiAgICAgICAgLnJ1bihMb2NhdGlvbkRpYWxvZ1J1bilcclxuICAgICAgICAuc2VydmljZSgncGlwTG9jYXRpb25FZGl0RGlhbG9nJywgTG9jYXRpb25EaWFsb2dTZXJ2aWNlKTtcclxufSIsImV4cG9ydCBjbGFzcyBMb2NhdGlvbkRpYWxvZ1BhcmFtcyB7XHJcbiAgICAvLyBMb2NhdGlvbnMgcG9zaXRpb25cclxuICAgIGxvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAvLyBMb2NhdGlvbiBuYW1lXHJcbiAgICBsb2NhdGlvbk5hbWU6IHN0cmluZztcclxufSIsImFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLCBbJ25nTWF0ZXJpYWwnLCAncGlwTG9jYXRpb25zLlRlbXBsYXRlcyddKTtcclxuXHJcbmltcG9ydCAnLi9Mb2NhdGlvbkRpYWxvZyciLCJpbXBvcnQgeyBJTG9jYXRpb25EaWFsb2dTZXJ2aWNlIH0gZnJvbSAnLi4vbG9jYXRpb25fZGlhbG9nL0lMb2NhdGlvbkRpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgaW50ZXJmYWNlIElMb2NhdGlvbkVkaXRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uSG9sZGVyOiBhbnk7XHJcbiAgICAgICAgbmdEaXNhYmxlZDogYW55O1xyXG4gICAgICAgIHBpcENoYW5nZWQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkVkaXRCaW5kaW5nczogSUxvY2F0aW9uRWRpdEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICBuZ0Rpc2FibGVkOiAnPCcsXHJcbiAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25FZGl0QmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uRWRpdEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6IGFueTtcclxuICAgICAgICBwaXBDaGFuZ2VkOiBhbnk7XHJcblxyXG4gICAgICAgIG5nRGlzYWJsZWQ6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uRWRpdENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uRWRpdEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25OYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uSG9sZGVyOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBuZ0Rpc2FibGVkOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBwaXBDaGFuZ2VkOiBGdW5jdGlvbjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBlbXB0eTogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250cm9sOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBkZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZDogRnVuY3Rpb247XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgIHByaXZhdGUgcGlwTG9jYXRpb25FZGl0RGlhbG9nOiBJTG9jYXRpb25EaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXNEZWJvdW5jZWQgPSBfLmRlYm91bmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ21kLWlucHV0LWNvbnRhaW5lcicpLmF0dHIoJ21kLW5vLWZsb2F0JywgKCEhdGhpcy5waXBMb2NhdGlvbkhvbGRlcikudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIC8vIFNldCBjb250YWluZXJzXHJcbiAgICAgICAgICAgIHRoaXMuZW1wdHkgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWVtcHR5Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB3YXRjaGVyc1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goJyRjdHJsLnBpcExvY2F0aW9uTmFtZScsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUsIG9sZFZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goJyRjdHJsLnBpcExvY2F0aW9uUG9zJyxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgY2xhc3NcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLWVkaXQnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFZpc3VhbGl6ZSBtYXBcclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwTG9jYXRpb25Qb3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25FZGl0QmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmdEaXNhYmxlZCA9IGNoYW5nZXMubmdEaXNhYmxlZCA/IGNoYW5nZXMubmdEaXNhYmxlZC5jdXJyZW50VmFsdWUgOiBmYWxzZTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gVG9nZ2xlIGNvbnRyb2wgdmlzaWJpbGl0eVxyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1wdHkuc2hvdygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24gPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBUb2dnbGUgY29udHJvbCB2aXNpYmlsaXR5XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbXB0eS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFwXHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbC5hcHBlbmRUbyh0aGlzLm1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcCB3aXRoIHBvaW50IG1hcmtlclxyXG4gICAgICAgICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKHRoaXMubWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyksXHJcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkZWZpbmVDb29yZGluYXRlcygpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb25OYW1lID0gdGhpcy5waXBMb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xyXG4gICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcclxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGxvY2F0aW9uTmFtZVxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyA9PT0gbnVsbCB8fCByZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gcmVzdWx0c1swXS5nZW9tZXRyeSB8fCB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gZ2VvbWV0cnkubG9jYXRpb24gfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgcmVzdWx0cyBhZ2FpblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24ubGF0ID09PSBudWxsIHx8IGxvY2F0aW9uLmxuZyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZTogbG9jYXRpb24ubGF0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ3RpdHVkZTogbG9jYXRpb24ubG5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIG9uU2V0TG9jYXRpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5nRGlzYWJsZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25FZGl0RGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5waXBMb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Qb3M6IHRoaXMucGlwTG9jYXRpb25Qb3NcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gPSByZXN1bHQubG9jYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCBjaGFuZ2UgYW55dGhpbmcgaWYgbG9jYXRpb24gaXMgYWJvdXQgdGhlIHNhbWVcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBMb2NhdGlvblBvcyAmJiB0aGlzLnBpcExvY2F0aW9uUG9zLnR5cGUgPT0gJ1BvaW50JyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uICYmIGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA9PSAyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0pIDwgMC4wMDAxICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLnBpcExvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdIC0gbG9jYXRpb24uY29vcmRpbmF0ZXNbMV0pIDwgMC4wMDAxICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChsb2NhdGlvbk5hbWUgPT09IHRoaXMucGlwTG9jYXRpb25OYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvbk5hbWUgPSBsb2NhdGlvbk5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbk5hbWUgPT09IG51bGwgJiYgbG9jYXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvbk5hbWUgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgcmVzdWx0LmxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcsJyArIHJlc3VsdC5sb2NhdGlvbi5jb29yZGluYXRlc1sxXSArICcpJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBDaGFuZ2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgb25NYXBDbGljaygkZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmdEaXNhYmxlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNldExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbk1hcEtleVByZXNzKCRldmVudCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5uZ0Rpc2FibGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZiAoJGV2ZW50LmtleUNvZGUgPT0gMTMgfHwgJGV2ZW50LmtleUNvZGUgPT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25TZXRMb2NhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgLy8kZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uRWRpdDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExvY2F0aW9uRWRpdEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9jYXRpb25fZWRpdC9Mb2NhdGlvbkVkaXQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25FZGl0Q29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKFwicGlwTG9jYXRpb25FZGl0XCIsIFsncGlwTG9jYXRpb25FZGl0RGlhbG9nJ10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTG9jYXRpb25FZGl0JywgTG9jYXRpb25FZGl0KTtcclxuXHJcbn0iLCJkZWNsYXJlIGxldCBnb29nbGU6IGFueTtcclxuXHJcbntcclxuICAgIGludGVyZmFjZSBJTG9jYXRpb25JcEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcElwYWRkcmVzczogYW55O1xyXG4gICAgICAgIHBpcEV4dHJhSW5mbzogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uSXBCaW5kaW5nczogSUxvY2F0aW9uSXBCaW5kaW5ncyA9IHtcclxuICAgICAgICBwaXBJcGFkZHJlc3M6ICc8JyxcclxuICAgICAgICBwaXBFeHRyYUluZm86ICcmJyxcclxuICAgICAgICBwaXBSZWJpbmQ6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBJSXBSZXNwb25zZUluZm8ge1xyXG4gICAgICAgIGNpdHk6IHN0cmluZztcclxuICAgICAgICByZWdpb25Db2RlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICAgICAgcmVnaW9uTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHppcENvZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgICAgICBjb3VudHJ5Q29kZTogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgICAgIGNvdW50cnlOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgbGF0aXR1ZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgICAgICBsb25naXR1ZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbklwQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uSXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBFeHRyYUluZm86IGFueTtcclxuXHJcbiAgICAgICAgcGlwSXBhZGRyZXNzOiBuZy5JQ2hhbmdlc09iamVjdCA8IHN0cmluZyA+IDtcclxuICAgICAgICBwaXBSZWJpbmQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25JcENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uSXBCaW5kaW5ncyB7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRyb2w6IGFueTtcclxuXHJcbiAgICAgICAgcHVibGljIHBpcEV4dHJhSW5mbzogYW55O1xyXG4gICAgICAgIHB1YmxpYyBwaXBJcGFkZHJlc3M6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwUmViaW5kOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkaHR0cDogbmcuSUh0dHBTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24taXAnKTtcclxuICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25JcEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBpcFJlYmluZCA9IGNoYW5nZXMucGlwUmViaW5kID8gY2hhbmdlcy5waXBSZWJpbmQuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBSZWJpbmQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwSXBhZGRyZXNzID0gY2hhbmdlcy5waXBJcGFkZHJlc3MgPyBjaGFuZ2VzLnBpcElwYWRkcmVzcy5jdXJyZW50VmFsdWUgOiB0aGlzLnBpcElwYWRkcmVzcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAobGF0aXR1ZGUsIGxvbmdpdHVkZSkge1xyXG4gICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBpZiAobGF0aXR1ZGUgPT0gbnVsbCB8fCBsb25naXR1ZGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wuYXBwZW5kVG8odGhpcy5tYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICBjb25zdCBpcEFkZHJlc3MgPSB0aGlzLnBpcElwYWRkcmVzcztcclxuXHJcbiAgICAgICAgICAgIGlmIChpcEFkZHJlc3MgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kaHR0cC5nZXQoJ2h0dHBzOi8vZnJlZWdlb2lwLm5ldC9qc29uLycgKyBpcEFkZHJlc3MpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcygocmVzcG9uc2U6IElJcFJlc3BvbnNlSW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAhPSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmxhdGl0dWRlICE9IG51bGwgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubG9uZ2l0dWRlICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAocmVzcG9uc2UubGF0aXR1ZGUsIHJlc3BvbnNlLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBFeHRyYUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiByZXNwb25zZS5jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbkNvZGU6IHJlc3BvbnNlLnJlZ2lvbkNvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiByZXNwb25zZS5yZWdpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHppcENvZGU6IHJlc3BvbnNlLnppcENvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IHJlc3BvbnNlLmNvdW50cnlDb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IHJlc3BvbnNlLmNvdW50cnlOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBFeHRyYUluZm8oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhSW5mbzogZXh0cmFJbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbklwOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTG9jYXRpb25JcEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uSXBDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoXCJwaXBMb2NhdGlvbklwXCIsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcExvY2F0aW9uSXAnLCBMb2NhdGlvbklwKTtcclxufSIsIntcclxuXHJcbiAgICBpbnRlcmZhY2UgSUxvY2F0aW9uTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwaXBJY29uUGF0aDogYW55O1xyXG4gICAgICAgIHBpcEludGVyYWN0aXZlOiBhbnk7XHJcbiAgICAgICAgcGlwU3RyZXRjaDogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uTWFwQmluZGluZ3M6IElMb2NhdGlvbk1hcEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPCcsXHJcbiAgICAgICAgcGlwSWNvblBhdGg6ICc8JyxcclxuICAgICAgICBwaXBJbnRlcmFjdGl2ZTogJzwnLFxyXG4gICAgICAgIHBpcFN0cmV0Y2g6ICc8JyxcclxuICAgICAgICBwaXBSZWJpbmQ6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uTWFwQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcbiAgICAgICAgcGlwSWNvblBhdGg6IG5nLklDaGFuZ2VzT2JqZWN0PHN0cmluZz47XHJcbiAgICAgICAgcGlwSW50ZXJhY3RpdmU6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgICAgIHBpcFN0cmV0Y2g6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgICAgIHBpcFJlYmluZDogbmcuSUNoYW5nZXNPYmplY3Q8Ym9vbGVhbj47XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25NYXBDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIElMb2NhdGlvbk1hcEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwSWNvblBhdGg6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwSW50ZXJhY3RpdmU6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHBpcFN0cmV0Y2g6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHBpcFJlYmluZDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRyb2w6IGFueSA9IG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnlcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIgPSAkZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1tYXAnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IExvY2F0aW9uTWFwQmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlwUmViaW5kID0gY2hhbmdlcy5waXBSZWJpbmQgPyBjaGFuZ2VzLnBpcFJlYmluZC5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5waXBJbnRlcmFjdGl2ZSA9IGNoYW5nZXMucGlwSW50ZXJhY3RpdmUgPyBjaGFuZ2VzLnBpcEludGVyYWN0aXZlLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcFN0cmV0Y2ggPSBjaGFuZ2VzLnBpcFN0cmV0Y2ggPyBjaGFuZ2VzLnBpcFN0cmV0Y2guY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBTdHJldGNoID09PSB0cnVlKSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuYWRkQ2xhc3MoJ3N0cmV0Y2gnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLnJlbW92ZUNsYXNzKCdzdHJldGNoJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcFJlYmluZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IGNoYW5nZXMucGlwTG9jYXRpb25Qb3MgPyBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zLmN1cnJlbnRWYWx1ZSA6IHRoaXMucGlwTG9jYXRpb25Qb3M7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcEljb25QYXRoID0gY2hhbmdlcy5waXBJY29uUGF0aCA/IGNoYW5nZXMucGlwSWNvblBhdGguY3VycmVudFZhbHVlIDogdGhpcy5waXBJY29uUGF0aDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2xlYXJNYXAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBtYXAgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNoZWNrTG9jYXRpb24obG9jKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhKGxvYyA9PSBudWxsIHx8IGxvYy5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvYy5jb29yZGluYXRlcy5sZW5ndGggPCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgIGxvYy5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcG9pbnQuZmlsbCA9IGxvYy5maWxsO1xyXG4gICAgICAgICAgICBwb2ludC5zdHJva2UgPSBsb2Muc3Ryb2tlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb25zID0gdGhpcy5waXBMb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmUgPSB0aGlzLnBpcEludGVyYWN0aXZlIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tMb2NhdGlvbihsb2NhdGlvbnMpICYmICFfLmlzQXJyYXkobG9jYXRpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2godGhpcy5kZXRlcm1pbmVDb29yZGluYXRlcyhsb2NhdGlvbnMpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbnMgJiYgXy5pc0FycmF5KGxvY2F0aW9ucykgJiYgbG9jYXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBfLmVhY2gobG9jYXRpb25zLCAobG9jKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrTG9jYXRpb24obG9jKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzLnB1c2godGhpcy5kZXRlcm1pbmVDb29yZGluYXRlcyhsb2MpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbC5hcHBlbmRUbyh0aGlzLm1hcENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG1hcFxyXG4gICAgICAgICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogcG9pbnRzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBpbnRlcmFjdGl2ZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGludGVyYWN0aXZlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLm1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpLFxyXG4gICAgICAgICAgICAgICAgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIG1hcmtlcnNcclxuICAgICAgICAgICAgXy5lYWNoKHBvaW50cywgKHBvaW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpY29uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMucGlwSWNvblBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBwb2ludC5maWxsIHx8ICcjRUY1MzUwJyxcclxuICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMSxcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMSxcclxuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogcG9pbnQuc3Ryb2tlIHx8ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiA1XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb2ludCxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiB0aGlzLnBpcEljb25QYXRoID8gaWNvbiA6IG51bGxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChwb2ludCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQXV0by1jb25maWcgb2Ygem9vbSBhbmQgY2VudGVyXHJcbiAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbk1hcDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExvY2F0aW9uTWFwQmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAgICAgY29udHJvbGxlcjogTG9jYXRpb25NYXBDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoXCJwaXBMb2NhdGlvbk1hcFwiLCBbXSlcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBMb2NhdGlvbk1hcCcsIExvY2F0aW9uTWFwKTtcclxufSIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbi9Mb2NhdGlvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1uYW1lIGxvY2F0aW9uLWNvbGxhcHNlXCIgbmctY2xpY2s9XCIkY3RybC5waXBMb2NhdGlvblJlc2l6ZSgpXCIgbmctaWY9XCIhJGN0cmwucGlwQ29sbGFwc2VcIlxcbicgK1xuICAgICcgICAgbmctY2xhc3M9XCIkY3RybC5waXBTaG93TG9jYXRpb25JY29uID8gXFwncGlwLWxvY2F0aW9uLWljb24tc3BhY2VcXCcgOiBcXCdcXCdcIj5cXG4nICtcbiAgICAnICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cInBpcC1sb2NhdGlvbi10ZXh0XCI+e3skY3RybC5waXBMb2NhdGlvbk5hbWV9fTwvc3Bhbj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8bWQtYnV0dG9uIGNsYXNzPVwicGlwLWxvY2F0aW9uLW5hbWVcIiBuZy1jbGljaz1cIiRjdHJsLnBpcExvY2F0aW9uUmVzaXplKClcIiBuZy1pZj1cIiRjdHJsLnBpcENvbGxhcHNlXCJcXG4nICtcbiAgICAnICAgIG5nLWNsYXNzPVwiJGN0cmwucGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ3BpcC1sb2NhdGlvbi1pY29uLXNwYWNlXFwnIDogXFwnXFwnXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwibGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBsYXlvdXQtcm93IHctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bG9jYXRpb25cIiBjbGFzcz1cImZsZXgtZml4ZWQgcGlwLWljb25cIiBuZy1pZj1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb25cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dCBmbGV4XCI+e3skY3RybC5waXBMb2NhdGlvbk5hbWV9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRyaWFuZ2xlLWRvd25cIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1zaG93PVwiISRjdHJsLnNob3dNYXBcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp0cmlhbmdsZS11cFwiIGNsYXNzPVwiZmxleC1maXhlZFwiIG5nLXNob3c9XCIkY3RybC5zaG93TWFwXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb25fZGlhbG9nL0xvY2F0aW9uRGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtbG9jYXRpb24tZWRpdC1kaWFsb2cgbGF5b3V0LWNvbHVtblwiIG1kLXRoZW1lPVwie3skY3RybC50aGVtZX19XCI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1oZWFkZXIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3RhcnQtc3RhcnRcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtcHJvZ3Jlc3MtbGluZWFyIG5nLXNob3c9XCIkY3RybC50cmFuc2FjdGlvbi5idXN5KClcIiBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicGlwLXByb2dyZXNzLXRvcFwiPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtcHJvZ3Jlc3MtbGluZWFyPlxcbicgK1xuICAgICcgICAgICAgIDxoMyBjbGFzcz1cImZsZXhcIj57eyBcXCdMT0NBVElPTl9TRVRfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2gzPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicGlwLWZvb3RlclwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXJcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25BZGRQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyA9PSBudWxsXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnTE9DQVRJT05fQUREX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25SZW1vdmVQaW4oKVwiIG5nLXNob3c9XCIkY3RybC5sb2NhdGlvblBvcyAhPSBudWxsXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnTE9DQVRJT05fUkVNT1ZFX1BJTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleFwiPjwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5vbkNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cInt7IDo6XFwnQ0FOQ0VMXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgOjpcXCdDQU5DRUxcXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQXBwbHkoKVwiIG5nLWRpc2FibGVkPVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0FQUExZXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgOjpcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1ib2R5XCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC16b29tLWluXCIgbmctY2xpY2s9XCIkY3RybC5vblpvb21JbigpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fSU5cXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1c1wiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gbWQtZmFiIHBpcC16b29tLW91dFwiIG5nLWNsaWNrPVwiJGN0cmwub25ab29tT3V0KClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fWk9PTV9PVVRcXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXNcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtc2V0LWxvY2F0aW9uXCIgbmctY2xpY2s9XCIkY3RybC5vblNldExvY2F0aW9uKClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cInt7IDo6XFwnTE9DQVRJT05fU0VUX0xPQ0FUSU9OXFwnICB9fVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICBuZy1zaG93PVwic3VwcG9ydFNldFwiIG5nLWRpc2FibGVkPVwidHJhbnNhY3Rpb24uYnVzeSgpXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dGFyZ2V0XCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2NhdGlvbl9lZGl0L0xvY2F0aW9uRWRpdC5odG1sJyxcbiAgICAnPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cIm1kLWJsb2NrXCI+XFxuJyArXG4gICAgJyAgICA8bGFiZWw+e3sgXFwnTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX08L2xhYmVsPlxcbicgK1xuICAgICcgICAgPGlucHV0IG5nLW1vZGVsPVwiJGN0cmwucGlwTG9jYXRpb25OYW1lXCIgbmctZGlzYWJsZWQ9XCIkY3RybC5uZ0Rpc2FibGVkXCIvPlxcbicgK1xuICAgICc8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1lbXB0eVwiIGxheW91dD1cImNvbHVtblwiIGxheW91dC1hbGlnbj1cImNlbnRlciBjZW50ZXJcIj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1yYWlzZWRcIiBuZy1kaXNhYmxlZD1cIiRjdHJsLm5nRGlzYWJsZWRcIiBuZy1jbGljaz1cIiRjdHJsLm9uU2V0TG9jYXRpb24oKVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJMT0NBVElPTl9BRERfTE9DQVRJT05cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWxvY2F0aW9uXCI+PC9zcGFuPiB7e1xcJ0xPQ0FUSU9OX0FERF9MT0NBVElPTlxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlwLWxvY2F0aW9uLWNvbnRhaW5lclwiIHRhYmluZGV4PVwie3sgJGN0cmwubmdEaXNhYmxlZCA/IC0xIDogMCB9fVwiIFxcbicgK1xuICAgICcgICAgbmctY2xpY2s9XCIkY3RybC5vbk1hcENsaWNrKCRldmVudClcIiBuZy1rZXlwcmVzcz1cIiRjdHJsLm9uTWFwS2V5UHJlc3MoJGV2ZW50KVwiPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1sb2NhdGlvbnMtaHRtbC5qcy5tYXBcbiJdfQ==