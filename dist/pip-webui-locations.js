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
angular.module('pipLocationEditDialog', ['ngMaterial', 'pipLocations.Templates']);
require("./locationDialog");
require("./locationDialogService");
},{"./locationDialog":5,"./locationDialogService":6}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"./locationDialog":5}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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



},{}]},{},[11,1,3,4,5,6,7,8,9,2,10])(11)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVwZW5kZW5jaWVzL3RyYW5zbGF0ZS50cyIsInNyYy9sb2NhdGlvbi9sb2NhdGlvbi50cyIsInNyYy9sb2NhdGlvbl9kaWFsb2cvaW5kZXgudHMiLCJzcmMvbG9jYXRpb25fZGlhbG9nL2xvY2F0aW9uRGlhbG9nLnRzIiwic3JjL2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbkRpYWxvZ1NlcnZpY2UudHMiLCJzcmMvbG9jYXRpb25fZWRpdC9sb2NhdGlvbkVkaXQudHMiLCJzcmMvbG9jYXRpb25faXAvbG9jYXRpb25JcC50cyIsInNyYy9sb2NhdGlvbl9tYXAvbG9jYXRpb25NYXAudHMiLCJzcmMvbG9jYXRpb25zLnRzIiwidGVtcC9waXAtd2VidWktbG9jYXRpb25zLWh0bWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxDQUFDO0lBQ0csWUFBWSxDQUFDO0lBRWIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5RCxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxVQUFVLFNBQVM7UUFDOUMsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7Y0FDMUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFM0MsTUFBTSxDQUFDLFVBQVUsR0FBRztZQUNoQixNQUFNLENBQUMsWUFBWSxHQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNwRSxDQUFDLENBQUE7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxFQUFFLENBQUM7O0FDaEJMLENBQUM7SUFhRyxJQUFNLGdCQUFnQixHQUFzQjtRQUN4QyxlQUFlLEVBQUUsR0FBRztRQUNwQixjQUFjLEVBQUUsR0FBRztRQUNuQixtQkFBbUIsRUFBRSxHQUFHO1FBQ3hCLFdBQVcsRUFBRSxHQUFHO1FBQ2hCLFNBQVMsRUFBRSxHQUFHO1FBQ2QsV0FBVyxFQUFFLEdBQUc7UUFDaEIsaUJBQWlCLEVBQUUsR0FBRztLQUN6QixDQUFBO0lBRUQ7UUFBQTtRQVdBLENBQUM7UUFBRCw4QkFBQztJQUFELENBWEEsQUFXQyxJQUFBO0lBRUQ7UUFjSSw0QkFDWSxRQUFnQixFQUNoQixRQUE0QixFQUM1QixNQUFpQjtZQUV6QixVQUFVLENBQUM7WUFKSCxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ2hCLGFBQVEsR0FBUixRQUFRLENBQW9CO1lBQzVCLFdBQU0sR0FBTixNQUFNLENBQVc7WUFWdEIsWUFBTyxHQUFZLElBQUksQ0FBQztZQWMzQixRQUFRLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTSxzQ0FBUyxHQUFoQjtZQUFBLGlCQXNCQztZQXJCRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNWLEtBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDckQsS0FBSSxDQUFDLFlBQVksR0FBRyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUVsRSxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzVCLEtBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3pCLEtBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUdyQixLQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFDLEtBQUs7d0JBQ2xCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFdBQVcsQ0FBQzs0QkFBQyxNQUFNLENBQUM7d0JBQzdCLEtBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDO3dCQUM3QixLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7d0JBQ3BELEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUM7NEJBQUMsS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUNyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDOzRCQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ25ELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBRUQsS0FBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLHNDQUFTLEdBQWpCO1lBQ0ksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUcvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7UUFFTSx1Q0FBVSxHQUFqQixVQUFrQixPQUFnQztZQUM5QyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuSCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUMzRixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUUzRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDN0YsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDMUYsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLENBQUM7UUFDTCxDQUFDO1FBRU8scUNBQVEsR0FBaEI7WUFFSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU8sd0NBQVcsR0FBbkI7WUFDSSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBR3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLFdBQVcsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEgsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixNQUFNLENBQUM7WUFDWCxDQUFDO1lBR0QsSUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDdEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDdkIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FDMUIsQ0FBQztZQUdGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUc1QyxJQUNJLFVBQVUsR0FBRztnQkFDVCxNQUFNLEVBQUUsV0FBVztnQkFDbkIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87Z0JBQ3hDLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLHNCQUFzQixFQUFFLElBQUk7Z0JBQzVCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixTQUFTLEVBQUUsS0FBSzthQUNuQixFQUNELEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFOUQsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLEdBQUcsRUFBRSxHQUFHO2FBQ1gsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFBLENBQUM7UUFHTix5QkFBQztJQUFELENBeEhBLEFBd0hDLElBQUE7SUFFRCxJQUFNLGlCQUFpQixHQUF5QjtRQUM1QyxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLFdBQVcsRUFBRSx3QkFBd0I7UUFDckMsVUFBVSxFQUFFLGtCQUFrQjtLQUNqQyxDQUFBO0lBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO1NBQzVCLFNBQVMsQ0FBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUNyRCxDQUFDOzs7OztBQ3RLRCxPQUFPLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsWUFBWSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQztBQUVsRiw0QkFBMEI7QUFDMUIsbUNBQWdDOzs7QUNIaEM7SUFTUSxzQ0FDWSxNQUFpQixFQUN6QixVQUFnQyxFQUNoQyxRQUFpQyxFQUN6QixTQUEwQyxFQUNsRCxXQUFXLEVBQ1gsWUFBb0I7UUFOeEIsaUJBbURDO1FBbERXLFdBQU0sR0FBTixNQUFNLENBQVc7UUFHakIsY0FBUyxHQUFULFNBQVMsQ0FBaUM7UUFaOUMsU0FBSSxHQUFHLElBQUksQ0FBQztRQUNaLFlBQU8sR0FBRyxJQUFJLENBQUM7UUFpSWhCLGtCQUFhLEdBQUc7WUFBQSxpQkFrQnRCO1lBakJHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUUvQixTQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUNwQyxVQUFDLFFBQVE7Z0JBQ0wsSUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNoRyxLQUFJLENBQUMsT0FBTyxHQUFHLEtBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzlDLEtBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNqQyxLQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdEIsS0FBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsQ0FBQyxFQUNEO2dCQUNJLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDekIsQ0FBQyxFQUFFO2dCQUNDLFVBQVUsRUFBRSxDQUFDO2dCQUNiLGtCQUFrQixFQUFFLElBQUk7Z0JBQ3hCLE9BQU8sRUFBRSxJQUFJO2FBQ2hCLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQTtRQXBJRyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsSUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLE9BQU87WUFDekQsV0FBVyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQzlELFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQztRQUdoRCxRQUFRLENBQUM7WUFDTCxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsbURBQW1ELENBQUMsQ0FBQztZQUUxRSxJQUFJLFdBQVcsR0FBRyxLQUFJLENBQUMsV0FBVztnQkFDOUIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDbEIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQy9CLEtBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUNsQyxHQUFHLElBQUksQ0FBQztZQUdiLElBQUksVUFBVSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksRUFBRSxDQUFDO2dCQUNQLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO2dCQUN4QyxnQkFBZ0IsRUFBRSxJQUFJO2FBQ3pCLENBQUE7WUFDRCxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsVUFBVSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7Z0JBQ2hDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLENBQUM7WUFFRCxLQUFJLENBQUMsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzdELEtBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUc5QyxRQUFRLENBQUM7Z0JBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRU4sTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBRU8sbURBQVksR0FBcEIsVUFBcUIsV0FBVztRQUFoQyxpQkFvQkM7UUFuQkcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLFFBQVEsRUFBRSxXQUFXO2dCQUNyQixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2QsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUk7YUFDeEMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxZQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsWUFBVSxFQUFFLFNBQVMsRUFBRTtnQkFDakQsSUFBSSxXQUFXLEdBQUcsWUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMzQyxLQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRU8scURBQWMsR0FBdEIsVUFBdUIsV0FBVyxFQUFFLEdBQUc7UUFBdkMsaUJBa0JDO1FBakJHLElBQUksQ0FBQyxXQUFXLEdBQUc7WUFDZixJQUFJLEVBQUUsT0FBTztZQUNiLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEQsQ0FBQztRQUNGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXpCLElBQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2IsTUFBTSxFQUFFLFdBQVc7U0FDdEIsRUFBRSxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBRWYsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEMsS0FBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFDckQsQ0FBQztZQUVELEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRU0sK0NBQVEsR0FBZjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBRS9CLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTSxrREFBVyxHQUFsQjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU0sK0NBQVEsR0FBZjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQy9CLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxnREFBUyxHQUFoQjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQy9CLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFzQk0sK0NBQVEsR0FBZjtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVNLDhDQUFPLEdBQWQ7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNoQixRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDMUIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtTQUNsQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBQ0wsbUNBQUM7QUFBRCxDQWxLSixBQWtLSyxJQUFBO0FBbEtRLG9FQUE0QjtBQW9LekMsQ0FBQztJQUNHLElBQU0saUJBQWlCLEdBQUcsVUFBUyxTQUFtQztRQUNsRSxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRXhGLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDTCxZQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRTtnQkFDMUMsdUJBQXVCLEVBQUUsY0FBYztnQkFDdkMsdUJBQXVCLEVBQUUsY0FBYztnQkFDdkMsa0JBQWtCLEVBQUUsU0FBUztnQkFDN0IscUJBQXFCLEVBQUUsWUFBWTthQUN0QyxDQUFDLENBQUM7WUFDTyxZQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRTtnQkFDMUMsdUJBQXVCLEVBQUUseUJBQXlCO2dCQUNsRCx1QkFBdUIsRUFBRSxzQkFBc0I7Z0JBQy9DLGtCQUFrQixFQUFFLGdCQUFnQjtnQkFDcEMscUJBQXFCLEVBQUUsY0FBYzthQUN4QyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQyxDQUFBO0lBR0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQztTQUNsQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNoQyxDQUFDOzs7QUMzTEQsbURBRTBCO0FBSTFCLENBQUM7SUFDRztRQUNJLCtCQUNZLFNBQTBDO1lBQTFDLGNBQVMsR0FBVCxTQUFTLENBQWlDO1FBQ25ELENBQUM7UUFFRyxvQ0FBSSxHQUFYLFVBQVksTUFBTSxFQUFFLGVBQWdCLEVBQUUsY0FBZTtZQUNqRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDWixVQUFVLEVBQUUsNkNBQTRCO2dCQUN4QyxZQUFZLEVBQUUsT0FBTztnQkFDckIsV0FBVyxFQUFFLHFDQUFxQztnQkFDbEQsTUFBTSxFQUFFO29CQUNKLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtvQkFDakMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO2lCQUNsQztnQkFDRCxtQkFBbUIsRUFBRSxJQUFJO2FBQzVCLENBQUM7aUJBQ0QsSUFBSSxDQUFDLFVBQUMsTUFBTTtnQkFDVCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUNsQixlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVCLENBQUM7WUFDTCxDQUFDLEVBQUU7Z0JBQ0MsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztvQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBQ3JCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFDTCw0QkFBQztJQUFELENBMUJBLEFBMEJDLElBQUE7SUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDO1NBQ2xDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7OztBQ25DRCxDQUFDO0lBWUcsSUFBTSxvQkFBb0IsR0FBMEI7UUFDaEQsZUFBZSxFQUFFLEdBQUc7UUFDcEIsY0FBYyxFQUFFLEdBQUc7UUFDbkIsaUJBQWlCLEVBQUUsR0FBRztRQUN0QixVQUFVLEVBQUUsR0FBRztRQUNmLFVBQVUsRUFBRSxHQUFHO0tBQ2xCLENBQUE7SUFFRDtRQUFBO1FBU0EsQ0FBQztRQUFELGtDQUFDO0lBQUQsQ0FUQSxBQVNDLElBQUE7SUFFRDtRQVlJLGdDQUNZLFFBQWdCLEVBQ2hCLE1BQWlCLEVBQ2pCLHFCQUE2QztZQUh6RCxpQkFRQztZQVBXLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBVztZQUNqQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBRXJELElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUN6QyxLQUFJLENBQUMsaUJBQWlCLENBQUE7WUFDMUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVNLDBDQUFTLEdBQWhCO1lBQUEsaUJBOEJDO1lBN0JHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRXBHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFHdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQ3RDLFVBQUMsUUFBUSxFQUFFLFFBQVE7Z0JBQ2YsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLEtBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO2dCQUN0QyxDQUFDO1lBQ0wsQ0FBQyxDQUNKLENBQUM7WUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFDckM7Z0JBQ0ksS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FDSixDQUFDO1lBR0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUc1QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7UUFFTSwyQ0FBVSxHQUFqQixVQUFrQixPQUFvQztZQUNsRCxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ25GLENBQUM7UUFFTyx5Q0FBUSxHQUFoQjtZQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUd2QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVPLDRDQUFXLEdBQW5CO1lBRUksSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxXQUFXLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxDQUFDO1lBQ1gsQ0FBQztZQUdELElBQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQ3RDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ3ZCLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQzFCLENBQUM7WUFHRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFHOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBR2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUc1QyxJQUFNLFVBQVUsR0FBRztnQkFDWCxNQUFNLEVBQUUsV0FBVztnQkFDbkIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87Z0JBQ3hDLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLHNCQUFzQixFQUFFLElBQUk7Z0JBQzVCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixTQUFTLEVBQUUsS0FBSzthQUNuQixFQUNELEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQ3pELE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUM1QixRQUFRLEVBQUUsV0FBVztnQkFDckIsR0FBRyxFQUFFLEdBQUc7YUFDWCxDQUFDLENBQUM7UUFDWCxDQUFDO1FBRU8sa0RBQWlCLEdBQXpCO1lBQ0ksSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUUxQyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxDQUFDO1lBQ1gsQ0FBQztZQUVELElBQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUNiLE9BQU8sRUFBRSxZQUFZO2FBQ3hCLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTTtnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7b0JBRWYsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBRTNDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMzQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzs0QkFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNoQixNQUFNLENBQUM7d0JBQ1gsQ0FBQzt3QkFFRCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsRUFDdEMsVUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO3dCQUd2QyxFQUFFLENBQUMsQ0FBQyxVQUFRLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxVQUFRLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ2pELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDOzRCQUMzQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7NEJBQ2hCLE1BQU0sQ0FBQzt3QkFDWCxDQUFDO3dCQUVELElBQUksQ0FBQyxjQUFjLEdBQUc7NEJBQ2xCLElBQUksRUFBRSxPQUFPOzRCQUNiLFdBQVcsRUFBRTtnQ0FDVCxRQUFRLEVBQUUsVUFBUSxDQUFDLEdBQUcsRUFBRTtnQ0FDeEIsVUFBVSxFQUFFLFVBQVEsQ0FBQyxHQUFHLEVBQUU7NkJBQzdCO3lCQUNKLENBQUM7d0JBQ0YsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN2QixDQUFDO29CQUNELElBQUksQ0FBQyxDQUFDO3dCQUNGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO3dCQUMzQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3BCLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQSxDQUFDO1FBRUssOENBQWEsR0FBcEI7WUFBQSxpQkFrQ0M7WUFqQ0csRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFFNUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQztnQkFDeEIsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlO2dCQUNsQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWM7YUFDbkMsRUFDRCxVQUFDLE1BQU07Z0JBQ0gsSUFDSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDMUIsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7Z0JBR3ZDLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxjQUFjLElBQUksS0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksT0FBTztvQkFDMUQsS0FBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQzNDLFFBQVEsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUM1QyxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNO29CQUN2RSxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNO29CQUN2RSxDQUFDLFlBQVksS0FBSyxLQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxNQUFNLENBQUM7Z0JBQ1gsQ0FBQztnQkFFRCxLQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztnQkFDL0IsS0FBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUM7Z0JBRXBDLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzdDLEtBQUksQ0FBQyxlQUFlO3dCQUNoQixHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUNwQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUNuRCxDQUFDO2dCQUNELEtBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsS0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxDQUFDLENBQ0osQ0FBQztRQUNOLENBQUM7UUFBQSxDQUFDO1FBRUssMkNBQVUsR0FBakIsVUFBa0IsTUFBTTtZQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUU1QixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUV6QixDQUFDO1FBQUEsQ0FBQztRQUVLLDhDQUFhLEdBQXBCLFVBQXFCLE1BQU07WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFFNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFekIsQ0FBQztRQUNMLENBQUM7UUFBQSxDQUFDO1FBQ04sNkJBQUM7SUFBRCxDQXJOQSxBQXFOQyxJQUFBO0lBRUQsSUFBTSxZQUFZLEdBQXlCO1FBQ3ZDLFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsV0FBVyxFQUFFLGlDQUFpQztRQUM5QyxVQUFVLEVBQUUsc0JBQXNCO0tBQ3JDLENBQUE7SUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsdUJBQXVCLENBQUMsQ0FBQztTQUN2RCxTQUFTLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFcEQsQ0FBQzs7QUMvUEQsQ0FBQztJQVNHLElBQU0sa0JBQWtCLEdBQXdCO1FBQzVDLFlBQVksRUFBRSxHQUFHO1FBQ2pCLFlBQVksRUFBRSxHQUFHO1FBQ2pCLFNBQVMsRUFBRSxHQUFHO0tBQ2pCLENBQUE7SUFhRDtRQUFBO1FBT0EsQ0FBQztRQUFELGdDQUFDO0lBQUQsQ0FQQSxBQU9DLElBQUE7SUFFRDtRQVFJLDhCQUNJLFFBQWdCLEVBQ1IsS0FBc0I7WUFBdEIsVUFBSyxHQUFMLEtBQUssQ0FBaUI7WUFFOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDakUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFTSx5Q0FBVSxHQUFqQixVQUFrQixPQUFrQztZQUNoRCxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUVyRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNqRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM3QixDQUFDO1FBQ0wsQ0FBQztRQUVPLHVDQUFRLEdBQWhCO1lBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFFTywwQ0FBVyxHQUFuQixVQUFvQixRQUFRLEVBQUUsU0FBUztZQUVuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFHRCxJQUFJLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUNwQyxRQUFRLEVBQ1IsU0FBUyxDQUNaLENBQUM7WUFHRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRzVDLElBQ0ksVUFBVSxHQUFHO2dCQUNULE1BQU0sRUFBRSxXQUFXO2dCQUNuQixJQUFJLEVBQUUsRUFBRTtnQkFDUixTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFDeEMsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsc0JBQXNCLEVBQUUsSUFBSTtnQkFDNUIsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLFNBQVMsRUFBRSxLQUFLO2FBQ25CLEVBQ0QsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNuQixRQUFRLEVBQUUsV0FBVztnQkFDckIsR0FBRyxFQUFFLEdBQUc7YUFDWCxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU8sZ0RBQWlCLEdBQXpCO1lBQUEsaUJBb0NDO1lBbkNHLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFFcEMsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxDQUFDO1lBQ1gsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztpQkFDcEQsT0FBTyxDQUFDLFVBQUMsUUFBeUI7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJO29CQUNoQixRQUFRLENBQUMsUUFBUSxJQUFJLElBQUk7b0JBQ3pCLFFBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFN0IsS0FBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFeEQsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3BCLElBQU0sU0FBUyxHQUFHOzRCQUNkLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTs0QkFDbkIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVOzRCQUMvQixNQUFNLEVBQUUsUUFBUSxDQUFDLFVBQVU7NEJBQzNCLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTzs0QkFDekIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXOzRCQUNqQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFdBQVc7eUJBQ2hDLENBQUM7d0JBQ0YsS0FBSSxDQUFDLFlBQVksQ0FBQzs0QkFDZCxTQUFTLEVBQUUsU0FBUzt5QkFDdkIsQ0FBQyxDQUFDO29CQUNQLENBQUM7Z0JBQ0wsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BCLENBQUM7WUFDTCxDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLFVBQUMsUUFBUTtnQkFDWixLQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0wsMkJBQUM7SUFBRCxDQTFHQSxBQTBHQyxJQUFBO0lBRUQsSUFBTSxVQUFVLEdBQXlCO1FBQ3JDLFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsUUFBUSxFQUFFLDRDQUE0QztRQUN0RCxVQUFVLEVBQUUsb0JBQW9CO0tBQ25DLENBQUE7SUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7U0FDOUIsU0FBUyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNoRCxDQUFDOztBQ3pKRCxDQUFDO0lBYUcsSUFBTSxtQkFBbUIsR0FBeUI7UUFDOUMsY0FBYyxFQUFFLEdBQUc7UUFDbkIsb0JBQW9CLEVBQUUsR0FBRztRQUN6QixXQUFXLEVBQUUsR0FBRztRQUNoQixZQUFZLEVBQUUsR0FBRztRQUNqQixVQUFVLEVBQUUsR0FBRztRQUNmLFNBQVMsRUFBRSxHQUFHO0tBQ2pCLENBQUE7SUFFRDtRQUFBO1FBU0EsQ0FBQztRQUFELGlDQUFDO0lBQUQsQ0FUQSxBQVNDLElBQUE7SUFFRDtRQVdJLCtCQUNZLFFBQWdCO1lBQWhCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFIcEIsZUFBVSxHQUFRLElBQUksQ0FBQztZQUszQixJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNqRSxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVNLDBDQUFVLEdBQWpCLFVBQWtCLE9BQW1DO1lBQ2pELElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JGLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzlGLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRXhGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUN6RyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztnQkFDM0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBRTdGLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QixDQUFDO1FBQ0wsQ0FBQztRQUVPLHdDQUFRLEdBQWhCO1lBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFFTyw2Q0FBYSxHQUFyQixVQUFzQixHQUFHO1lBQ3JCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBRU8sb0RBQW9CLEdBQTVCLFVBQTZCLEdBQUc7WUFDNUIsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDaEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDbEIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FDckIsQ0FBQztZQUVGLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztZQUN0QixLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFFMUIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sMkNBQVcsR0FBbkI7WUFBQSxpQkErREM7WUE5REcsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFDaEMsU0FBUyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFDckMsTUFBTSxHQUFHLEVBQUUsRUFDWCxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUM7WUFHM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQyxHQUFHO3dCQUNsQixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDO1lBQ0wsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixNQUFNLENBQUM7WUFDWCxDQUFDO1lBR0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUc1QyxJQUFNLFVBQVUsR0FBRztnQkFDWCxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87Z0JBQ3hDLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLHNCQUFzQixFQUFFLElBQUk7Z0JBQzVCLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixTQUFTLEVBQUUsU0FBUzthQUN2QixFQUNELEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQ3pELE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFHNUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO2dCQUNqQixJQUFNLElBQUksR0FBRztvQkFDVCxJQUFJLEVBQUUsS0FBSSxDQUFDLFdBQVc7b0JBQ3RCLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLFNBQVM7b0JBQ2xDLFdBQVcsRUFBRSxDQUFDO29CQUNkLEtBQUssRUFBRSxDQUFDO29CQUNSLFdBQVcsRUFBRSxLQUFLLENBQUMsTUFBTSxJQUFJLE9BQU87b0JBQ3BDLFlBQVksRUFBRSxDQUFDO2lCQUNsQixDQUFDO2dCQUVGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBQ25CLFFBQVEsRUFBRSxLQUFLO29CQUNmLEdBQUcsRUFBRSxHQUFHO29CQUNSLElBQUksRUFBRSxLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxJQUFJO2lCQUN2QyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUdILEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNMLDRCQUFDO0lBQUQsQ0E1SEEsQUE0SEMsSUFBQTtJQUVELElBQU0sV0FBVyxHQUF5QjtRQUN0QyxRQUFRLEVBQUUsbUJBQW1CO1FBQzdCLFFBQVEsRUFBRSw0Q0FBNEM7UUFDdEQsVUFBVSxFQUFFLHFCQUFxQjtLQUNwQyxDQUFBO0lBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7U0FDL0IsU0FBUyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELENBQUM7O0FDcktELENBQUM7SUFDRyxZQUFZLENBQUM7SUFFYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUMzQixhQUFhO1FBQ2IsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFDZix1QkFBdUI7UUFDdkIsaUJBQWlCO1FBQ2pCLHdCQUF3QjtLQUMzQixDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsRUFBRSxDQUFDOztBQ2RMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgdGhpc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJywgW10pO1xyXG5cclxuICAgIHRoaXNNb2R1bGUuZmlsdGVyKCd0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpIFxyXG4gICAgICAgICAgICA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZScpIDogbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcFRyYW5zbGF0ZSAgPyBwaXBUcmFuc2xhdGUudHJhbnNsYXRlKGtleSkgfHwga2V5IDoga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIntcclxuICAgIGludGVyZmFjZSBJTG9jYXRpb25CaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246IGFueTtcclxuICAgICAgICBwaXBDb2xsYXBzZTogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgICAgIHBpcERpc2FibGVkOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkJpbmRpbmdzOiBJTG9jYXRpb25CaW5kaW5ncyA9IHtcclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6ICc8JyxcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogJzwnLFxyXG4gICAgICAgIHBpcFNob3dMb2NhdGlvbkljb246ICc8JyxcclxuICAgICAgICBwaXBDb2xsYXBzZTogJzwnLFxyXG4gICAgICAgIHBpcFJlYmluZDogJzwnLFxyXG4gICAgICAgIHBpcERpc2FibGVkOiAnPCcsXHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6ICcmJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25OYW1lOiBuZy5JQ2hhbmdlc09iamVjdCA8IHN0cmluZyA+IDtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICAgICAgcGlwU2hvd0xvY2F0aW9uSWNvbjogbmcuSUNoYW5nZXNPYmplY3QgPCBib29sZWFuID4gO1xyXG4gICAgICAgIHBpcENvbGxhcHNlOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwUmViaW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPiA7XHJcbiAgICAgICAgcGlwRGlzYWJsZWQ6IG5nLklDaGFuZ2VzT2JqZWN0IDwgYm9vbGVhbiA+IDtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25SZXNpemU6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBMb2NhdGlvbkNvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSUxvY2F0aW9uQmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvbk5hbWU6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwdWJsaWMgcGlwU2hvd0xvY2F0aW9uSWNvbjogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwQ29sbGFwc2U6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHBpcFJlYmluZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwRGlzYWJsZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIHNob3dNYXA6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvblJlc2l6ZTogRnVuY3Rpb247XHJcblxyXG4gICAgICAgIHByaXZhdGUgbmFtZTogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250cm9sOiBKUXVlcnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBcIm5nSW5qZWN0XCI7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjbGFzc1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBpcC1sb2NhdGlvbi1uYW1lJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBpcC1sb2NhdGlvbi1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBDb2xsYXBzZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dNYXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB1c2VyIGNsaWNrXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lLmNsaWNrKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGlwRGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93TWFwID0gIXRoaXMuc2hvd01hcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXJbdGhpcy5zaG93TWFwID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93TWFwKSB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy4kc2NvcGUuJCRwaGFzZSkgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWRyYXdNYXAoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlZHJhd01hcCgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcENvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gVmlzdWFsaXplIG1hcFxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBMb2NhdGlvblBvcyAmJiB0aGlzLnNob3dNYXAgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25CaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5waXBSZWJpbmQgPSBjaGFuZ2VzLnBpcFJlYmluZCA/IGNoYW5nZXMucGlwUmViaW5kLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcFNob3dMb2NhdGlvbkljb24gPSBjaGFuZ2VzLnBpcFNob3dMb2NhdGlvbkljb24gPyBjaGFuZ2VzLnBpcFNob3dMb2NhdGlvbkljb24uY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwQ29sbGFwc2UgPSBjaGFuZ2VzLnBpcENvbGxhcHNlID8gY2hhbmdlcy5waXBDb2xsYXBzZS5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5waXBEaXNhYmxlZCA9IGNoYW5nZXMucGlwRGlzYWJsZWQgPyBjaGFuZ2VzLnBpcERpc2FibGVkLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwUmViaW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uTmFtZSA9IGNoYW5nZXMucGlwTG9jYXRpb25OYW1lID8gY2hhbmdlcy5waXBMb2NhdGlvbk5hbWUuY3VycmVudFZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zID8gY2hhbmdlcy5waXBMb2NhdGlvblBvcy5jdXJyZW50VmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWRyYXdNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZW5lcmF0ZU1hcCgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG5cclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd01hcCA9PT0gZmFsc2UgfHwgbG9jYXRpb24gPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcyA9PSBudWxsIHx8IGxvY2F0aW9uLmNvb3JkaW5hdGVzLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIG1hcCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1swXSxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY29udHJvbFxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXBDb250cm9sKSB0aGlzLm1hcENvbnRyb2wucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9ICQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sLmFwcGVuZFRvKHRoaXMubWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwIHdpdGggcG9pbnQgbWFya2VyXHJcbiAgICAgICAgICAgIGNvbnN0XHJcbiAgICAgICAgICAgICAgICBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKHRoaXMubWFwQ29udHJvbFswXSwgbWFwT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkNvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgYmluZGluZ3M6IExvY2F0aW9uQmluZGluZ3MsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2NhdGlvbi9sb2NhdGlvbi5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBMb2NhdGlvbkNvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uXCIsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcExvY2F0aW9uJywgTG9jYXRpb25Db21wb25lbnQpO1xyXG59IiwiYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9uRWRpdERpYWxvZycsIFsnbmdNYXRlcmlhbCcsICdwaXBMb2NhdGlvbnMuVGVtcGxhdGVzJ10pO1xyXG5cclxuaW1wb3J0ICcuL2xvY2F0aW9uRGlhbG9nJztcclxuaW1wb3J0ICcuL2xvY2F0aW9uRGlhbG9nU2VydmljZSciLCJleHBvcnQgY2xhc3MgTG9jYXRpb25FZGl0RGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICAgICAgcHJpdmF0ZSBfbWFwID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIF9tYXJrZXIgPSBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgdGhlbWU6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgbG9jYXRpb25Qb3M7XHJcbiAgICAgICAgcHVibGljIGxvY2F0aW9uTmFtZTtcclxuICAgICAgICBwdWJsaWMgc3VwcG9ydFNldDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IG5nLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlLFxyXG4gICAgICAgICAgICBsb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBzdHJpbmdcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy50aGVtZSA9ICRyb290U2NvcGVbJyR0aGVtZSddO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zID0gbG9jYXRpb25Qb3MgJiYgbG9jYXRpb25Qb3MudHlwZSA9PSAnUG9pbnQnICYmXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvcy5jb29yZGluYXRlcyAmJiBsb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMiA/XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvcyA6IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnN1cHBvcnRTZXQgPSBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24gIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFdhaXQgdW50aWwgZGlhbG9nIGlzIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXBDb250YWluZXIgPSAkKCcucGlwLWxvY2F0aW9uLWVkaXQtZGlhbG9nIC5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyXHJcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSB0aGlzLmxvY2F0aW9uUG9zID9cclxuICAgICAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUG9zLmNvb3JkaW5hdGVzWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgICAgIGxldCBtYXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGNvb3JkaW5hdGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMuem9vbSA9IDEyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQ29udGFpbmVyWzBdLCBtYXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGaXggcmVzaXppbmcgaXNzdWVcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuX21hcCwgJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbigncGlwTGF5b3V0UmVzaXplZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcih0aGlzLl9tYXAsICdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcmtlcikgdGhpcy5fbWFya2VyLnNldE1hcChudWxsKTtcclxuICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiB0aGlzLl9tYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aGlzTWFya2VyID0gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpc01hcmtlciwgJ2RyYWdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkaW5hdGVzID0gdGhpc01hcmtlci5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTG9jYXRpb24oY29vcmRpbmF0ZXMsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgdGlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxyXG4gICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtjb29yZGluYXRlcy5sYXQoKSwgY29vcmRpbmF0ZXMubG5nKCldXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25OYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgLy8gUmVhZCBhZGRyZXNzXHJcbiAgICAgICAgICAgIGNvbnN0IGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoe1xyXG4gICAgICAgICAgICAgICAgbGF0TG5nOiBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICB9LCAocmVzdWx0cywgc3RhdHVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHBvc2l0aXZlIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERlc2NyaWJlIHVzZXIgYWN0aW9uc1xyXG4gICAgICAgIHB1YmxpYyBvbkFkZFBpbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hcCA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlciA9IHRoaXMuY3JlYXRlTWFya2VyKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VMb2NhdGlvbihjb29yZGluYXRlcywgbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25SZW1vdmVQaW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIobnVsbCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25ab29tSW4oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblpvb21PdXQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXAgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKHpvb20gPiAxID8gem9vbSAtIDEgOiB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblNldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFwID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAgICAgKHBvc2l0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyID0gdGhpcy5jcmVhdGVNYXJrZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRDZW50ZXIoY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcC5zZXRab29tKDEyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUxvY2F0aW9uKGNvb3JkaW5hdGVzLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bUFnZTogMCxcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25DYW5jZWwoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uQXBwbHkoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25Qb3MsXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogdGhpcy5sb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5sb2NhdGlvbk5hbWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG57XHJcbiAgICBjb25zdCBMb2NhdGlvbkRpYWxvZ1J1biA9IGZ1bmN0aW9uKCRpbmplY3RvcjogbmcuYXV0by5JSW5qZWN0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAocGlwVHJhbnNsYXRlKSB7XHJcbiAgICAgICAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygnZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX0xPQ0FUSU9OJzogJ0FkZCBsb2NhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fU0VUX0xPQ0FUSU9OJzogJ1NldCBsb2NhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnTE9DQVRJT05fQUREX1BJTic6ICdBZGQgcGluJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ1JlbW92ZSBwaW4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9MT0NBVElPTic6ICfQlNC+0LHQsNCy0LjRgtGMINC80LXRgdGC0L7Qv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTic6ICfQntC/0YDQtdC00LXQu9C40YLRjCDQv9C+0LvQvtC20LXQvdC40LUnLFxyXG4gICAgICAgICAgICAgICAgJ0xPQ0FUSU9OX0FERF9QSU4nOiAn0JTQvtCx0LDQstC40YLRjCDRgtC+0YfQutGDJyxcclxuICAgICAgICAgICAgICAgICdMT0NBVElPTl9SRU1PVkVfUElOJzogJ9Cj0LHRgNCw0YLRjCDRgtC+0YfQutGDJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbkVkaXREaWFsb2cnKVxyXG4gICAgICAgIC5ydW4oTG9jYXRpb25EaWFsb2dSdW4pO1xyXG59IiwiaW1wb3J0IHtcclxuICAgIExvY2F0aW9uRWRpdERpYWxvZ0NvbnRyb2xsZXJcclxufSBmcm9tICcuL2xvY2F0aW9uRGlhbG9nJztcclxuXHJcbmltcG9ydCB7IElMb2NhdGlvbkRpYWxvZ1NlcnZpY2UgfSBmcm9tICcuL0lMb2NhdGlvbkRpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gICAgY2xhc3MgTG9jYXRpb25EaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUxvY2F0aW9uRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgc2hvdyhwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaz8sIGNhbmNlbENhbGxiYWNrPykge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBMb2NhdGlvbkVkaXREaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJyRjdHJsJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbkRpYWxvZy5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25OYW1lOiBwYXJhbXMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBvczogcGFyYW1zLmxvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25FZGl0RGlhbG9nJylcclxuICAgICAgICAuc2VydmljZSgncGlwTG9jYXRpb25FZGl0RGlhbG9nJywgTG9jYXRpb25EaWFsb2dTZXJ2aWNlKTtcclxufSIsImltcG9ydCB7IElMb2NhdGlvbkRpYWxvZ1NlcnZpY2UgfSBmcm9tICcuLi9sb2NhdGlvbl9kaWFsb2cvSUxvY2F0aW9uRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcblxyXG4gICAgaW50ZXJmYWNlIElMb2NhdGlvbkVkaXRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBMb2NhdGlvbk5hbWU6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uSG9sZGVyOiBhbnk7XHJcbiAgICAgICAgbmdEaXNhYmxlZDogYW55O1xyXG4gICAgICAgIHBpcENoYW5nZWQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkVkaXRCaW5kaW5nczogSUxvY2F0aW9uRWRpdEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogJz0nLFxyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPScsXHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6ICc9JyxcclxuICAgICAgICBuZ0Rpc2FibGVkOiAnPCcsXHJcbiAgICAgICAgcGlwQ2hhbmdlZDogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25FZGl0QmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uRWRpdEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcExvY2F0aW9uTmFtZTogYW55O1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcGlwTG9jYXRpb25Ib2xkZXI6IGFueTtcclxuICAgICAgICBwaXBDaGFuZ2VkOiBhbnk7XHJcblxyXG4gICAgICAgIG5nRGlzYWJsZWQ6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uRWRpdENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciB7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvblBvczogYW55O1xyXG4gICAgICAgIHB1YmxpYyBwaXBMb2NhdGlvbkhvbGRlcjogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgbmdEaXNhYmxlZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwQ2hhbmdlZDogRnVuY3Rpb247XHJcblxyXG4gICAgICAgIHByaXZhdGUgZW1wdHk6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udHJvbDogYW55O1xyXG4gICAgICAgIHByaXZhdGUgZGVmaW5lQ29vcmRpbmF0ZXNEZWJvdW5jZWQ6IEZ1bmN0aW9uO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICAgICAgICBwcml2YXRlIHBpcExvY2F0aW9uRWRpdERpYWxvZzogSUxvY2F0aW9uRGlhbG9nU2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLmRlZmluZUNvb3JkaW5hdGVzRGVib3VuY2VkID0gXy5kZWJvdW5jZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZUNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRwb3N0TGluaygpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdtZC1pbnB1dC1jb250YWluZXInKS5hdHRyKCdtZC1uby1mbG9hdCcsICghIXRoaXMucGlwTG9jYXRpb25Ib2xkZXIpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAvLyBTZXQgY29udGFpbmVyc1xyXG4gICAgICAgICAgICB0aGlzLmVtcHR5ID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLnBpcC1sb2NhdGlvbi1lbXB0eScpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lciA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgd2F0Y2hlcnNcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCckY3RybC5waXBMb2NhdGlvbk5hbWUnLFxyXG4gICAgICAgICAgICAgICAgKG5ld1ZhbHVlLCBvbGRWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAhPT0gb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlc0RlYm91bmNlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCckY3RybC5waXBMb2NhdGlvblBvcycsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGNsYXNzXHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1sb2NhdGlvbi1lZGl0Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyBWaXN1YWxpemUgbWFwXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcExvY2F0aW9uUG9zKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWFwKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IExvY2F0aW9uRWRpdEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICB0aGlzLm5nRGlzYWJsZWQgPSBjaGFuZ2VzLm5nRGlzYWJsZWQgPyBjaGFuZ2VzLm5nRGlzYWJsZWQuY3VycmVudFZhbHVlIDogZmFsc2U7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRvZ2dsZSBjb250cm9sIHZpc2liaWxpdHlcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVtcHR5LnNob3coKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgIC8vIFNhZmVndWFyZCBmb3IgYmFkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5waXBMb2NhdGlvblBvcztcclxuICAgICAgICAgICAgaWYgKGxvY2F0aW9uID09IG51bGwgfHwgbG9jYXRpb24uY29vcmRpbmF0ZXMgPT0gbnVsbCB8fCBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBtYXAgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZGluYXRlc1sxXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gVG9nZ2xlIGNvbnRyb2wgdmlzaWJpbGl0eVxyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1wdHkuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGEgbmV3IG1hcFxyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wuYXBwZW5kVG8odGhpcy5tYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgY29uc3QgbWFwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRG91YmxlQ2xpY2tab29tOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLm1hcENvbnRyb2xbMF0sIG1hcE9wdGlvbnMpLFxyXG4gICAgICAgICAgICAgICAgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbWFwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGVmaW5lQ29vcmRpbmF0ZXMoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uTmFtZSA9IHRoaXMucGlwTG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvY2F0aW9uTmFtZSA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7XHJcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBsb2NhdGlvbk5hbWVcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMgPT09IG51bGwgfHwgcmVzdWx0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkgfHwge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IGdlb21ldHJ5LmxvY2F0aW9uIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHJlc3VsdHMgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uLmxhdCA9PT0gbnVsbCB8fCBsb2NhdGlvbi5sbmcgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGU6IGxvY2F0aW9uLmxhdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmd0aXR1ZGU6IGxvY2F0aW9uLmxuZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBvblNldExvY2F0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5uZ0Rpc2FibGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uRWRpdERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWU6IHRoaXMucGlwTG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUG9zOiB0aGlzLnBpcExvY2F0aW9uUG9zXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gcmVzdWx0LmxvY2F0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbk5hbWUgPSByZXN1bHQubG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBEbyBub3QgY2hhbmdlIGFueXRoaW5nIGlmIGxvY2F0aW9uIGlzIGFib3V0IHRoZSBzYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGlwTG9jYXRpb25Qb3MgJiYgdGhpcy5waXBMb2NhdGlvblBvcy50eXBlID09ICdQb2ludCcgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlcy5sZW5ndGggPT0gMiAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiAmJiBsb2NhdGlvbi5jb29yZGluYXRlcy5sZW5ndGggPT0gMiAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlc1swXSAtIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzBdKSA8IDAuMDAwMSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5waXBMb2NhdGlvblBvcy5jb29yZGluYXRlc1sxXSAtIGxvY2F0aW9uLmNvb3JkaW5hdGVzWzFdKSA8IDAuMDAwMSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAobG9jYXRpb25OYW1lID09PSB0aGlzLnBpcExvY2F0aW9uTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBMb2NhdGlvblBvcyA9IGxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25OYW1lID0gbG9jYXRpb25OYW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25OYW1lID09PSBudWxsICYmIGxvY2F0aW9uICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25OYW1lID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHJlc3VsdC5sb2NhdGlvbi5jb29yZGluYXRlc1swXSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLCcgKyByZXN1bHQubG9jYXRpb24uY29vcmRpbmF0ZXNbMV0gKyAnKSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlwQ2hhbmdlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIG9uTWFwQ2xpY2soJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5nRGlzYWJsZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TZXRMb2NhdGlvbigpO1xyXG4gICAgICAgICAgICAvLyRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgb25NYXBLZXlQcmVzcygkZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmdEaXNhYmxlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRldmVudC5rZXlDb2RlID09IDEzIHx8ICRldmVudC5rZXlDb2RlID09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2V0TG9jYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIC8vJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbkVkaXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBMb2NhdGlvbkVkaXRCaW5kaW5ncyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvY2F0aW9uX2VkaXQvbG9jYXRpb25FZGl0Lmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uRWRpdENvbnRyb2xsZXJcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZShcInBpcExvY2F0aW9uRWRpdFwiLCBbJ3BpcExvY2F0aW9uRWRpdERpYWxvZyddKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcExvY2F0aW9uRWRpdCcsIExvY2F0aW9uRWRpdCk7XHJcblxyXG59IiwiZGVjbGFyZSBsZXQgZ29vZ2xlOiBhbnk7XHJcblxyXG57XHJcbiAgICBpbnRlcmZhY2UgSUxvY2F0aW9uSXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBJcGFkZHJlc3M6IGFueTtcclxuICAgICAgICBwaXBFeHRyYUluZm86IGFueTtcclxuICAgICAgICBwaXBSZWJpbmQ6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbklwQmluZGluZ3M6IElMb2NhdGlvbklwQmluZGluZ3MgPSB7XHJcbiAgICAgICAgcGlwSXBhZGRyZXNzOiAnPCcsXHJcbiAgICAgICAgcGlwRXh0cmFJbmZvOiAnJicsXHJcbiAgICAgICAgcGlwUmViaW5kOiAnPCdcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSUlwUmVzcG9uc2VJbmZvIHtcclxuICAgICAgICBjaXR5OiBzdHJpbmc7XHJcbiAgICAgICAgcmVnaW9uQ29kZTogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgICAgIHJlZ2lvbk5hbWU6IHN0cmluZztcclxuICAgICAgICB6aXBDb2RlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICAgICAgY291bnRyeUNvZGU6IHN0cmluZyB8IG51bWJlcjtcclxuICAgICAgICBjb3VudHJ5TmFtZTogc3RyaW5nO1xyXG4gICAgICAgIGxhdGl0dWRlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICAgICAgbG9uZ2l0dWRlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTG9jYXRpb25JcEJpbmRpbmdzQ2hhbmdlcyBpbXBsZW1lbnRzIG5nLklPbkNoYW5nZXNPYmplY3QsIElMb2NhdGlvbklwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwRXh0cmFJbmZvOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcElwYWRkcmVzczogbmcuSUNoYW5nZXNPYmplY3QgPCBzdHJpbmcgPiA7XHJcbiAgICAgICAgcGlwUmViaW5kOiBuZy5JQ2hhbmdlc09iamVjdCA8IGJvb2xlYW4gPlxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uSXBDb250cm9sbGVyIGltcGxlbWVudHMgSUxvY2F0aW9uSXBCaW5kaW5ncyB7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXBDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIG1hcENvbnRyb2w6IGFueTtcclxuXHJcbiAgICAgICAgcHVibGljIHBpcEV4dHJhSW5mbzogYW55O1xyXG4gICAgICAgIHB1YmxpYyBwaXBJcGFkZHJlc3M6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwUmViaW5kOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkaHR0cDogbmcuSUh0dHBTZXJ2aWNlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFwQ29udGFpbmVyID0gJGVsZW1lbnQuY2hpbGRyZW4oJy5waXAtbG9jYXRpb24tY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtbG9jYXRpb24taXAnKTtcclxuICAgICAgICAgICAgdGhpcy5kZWZpbmVDb29yZGluYXRlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25JcEJpbmRpbmdzQ2hhbmdlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBpcFJlYmluZCA9IGNoYW5nZXMucGlwUmViaW5kID8gY2hhbmdlcy5waXBSZWJpbmQuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5waXBSZWJpbmQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwSXBhZGRyZXNzID0gY2hhbmdlcy5waXBJcGFkZHJlc3MgPyBjaGFuZ2VzLnBpcElwYWRkcmVzcy5jdXJyZW50VmFsdWUgOiB0aGlzLnBpcElwYWRkcmVzcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmaW5lQ29vcmRpbmF0ZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGVhck1hcCgpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcCBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAobGF0aXR1ZGUsIGxvbmdpdHVkZSkge1xyXG4gICAgICAgICAgICAvLyBTYWZlZ3VhcmQgZm9yIGJhZCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBpZiAobGF0aXR1ZGUgPT0gbnVsbCB8fCBsb25naXR1ZGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhck1hcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbWFwIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSAkKCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wuYXBwZW5kVG8odGhpcy5tYXBDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgd2l0aCBwb2ludCBtYXJrZXJcclxuICAgICAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgICAgIG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZURvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGNvb3JkaW5hdGVzLFxyXG4gICAgICAgICAgICAgICAgbWFwOiBtYXBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlZmluZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgICAgICAgICBjb25zdCBpcEFkZHJlc3MgPSB0aGlzLnBpcElwYWRkcmVzcztcclxuXHJcbiAgICAgICAgICAgIGlmIChpcEFkZHJlc3MgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kaHR0cC5nZXQoJ2h0dHBzOi8vZnJlZWdlb2lwLm5ldC9qc29uLycgKyBpcEFkZHJlc3MpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcygocmVzcG9uc2U6IElJcFJlc3BvbnNlSW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAhPSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmxhdGl0dWRlICE9IG51bGwgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubG9uZ2l0dWRlICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNYXAocmVzcG9uc2UubGF0aXR1ZGUsIHJlc3BvbnNlLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waXBFeHRyYUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiByZXNwb25zZS5jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbkNvZGU6IHJlc3BvbnNlLnJlZ2lvbkNvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiByZXNwb25zZS5yZWdpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHppcENvZGU6IHJlc3BvbnNlLnppcENvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IHJlc3BvbnNlLmNvdW50cnlDb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IHJlc3BvbnNlLmNvdW50cnlOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waXBFeHRyYUluZm8oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhSW5mbzogZXh0cmFJbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJNYXAoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBMb2NhdGlvbklwOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBiaW5kaW5nczogTG9jYXRpb25JcEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uSXBDb250cm9sbGVyXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoXCJwaXBMb2NhdGlvbklwXCIsIFtdKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcExvY2F0aW9uSXAnLCBMb2NhdGlvbklwKTtcclxufSIsIntcclxuXHJcbiAgICBpbnRlcmZhY2UgSUxvY2F0aW9uTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IGFueTtcclxuICAgICAgICBwaXBMb2NhdGlvblBvc2l0aW9uczogYW55O1xyXG4gICAgICAgIHBpcEljb25QYXRoOiBhbnk7XHJcbiAgICAgICAgcGlwRHJhZ2dhYmxlOiBhbnk7XHJcbiAgICAgICAgcGlwU3RyZXRjaDogYW55O1xyXG4gICAgICAgIHBpcFJlYmluZDogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IExvY2F0aW9uTWFwQmluZGluZ3M6IElMb2NhdGlvbk1hcEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcExvY2F0aW9uUG9zOiAnPCcsXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3NpdGlvbnM6ICc8JyxcclxuICAgICAgICBwaXBJY29uUGF0aDogJzwnLFxyXG4gICAgICAgIHBpcERyYWdnYWJsZTogJzwnLFxyXG4gICAgICAgIHBpcFN0cmV0Y2g6ICc8JyxcclxuICAgICAgICBwaXBSZWJpbmQ6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uTWFwQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSUxvY2F0aW9uTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3M6IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcbiAgICAgICAgcGlwTG9jYXRpb25Qb3NpdGlvbnM6IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcbiAgICAgICAgcGlwSWNvblBhdGg6IG5nLklDaGFuZ2VzT2JqZWN0PHN0cmluZz47XHJcbiAgICAgICAgcGlwRHJhZ2dhYmxlOiBuZy5JQ2hhbmdlc09iamVjdDxib29sZWFuPjtcclxuICAgICAgICBwaXBTdHJldGNoOiBuZy5JQ2hhbmdlc09iamVjdDxib29sZWFuPjtcclxuICAgICAgICBwaXBSZWJpbmQ6IG5nLklDaGFuZ2VzT2JqZWN0PGJvb2xlYW4+O1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIExvY2F0aW9uTWFwQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTG9jYXRpb25NYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUG9zOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcExvY2F0aW9uUG9zaXRpb25zOiBhbnk7XHJcbiAgICAgICAgcHVibGljIHBpcEljb25QYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIHBpcERyYWdnYWJsZTogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwU3RyZXRjaDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgcGlwUmViaW5kOiBib29sZWFuO1xyXG5cclxuICAgICAgICBwcml2YXRlIG1hcENvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgbWFwQ29udHJvbDogYW55ID0gbnVsbDtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lciA9ICRlbGVtZW50LmNoaWxkcmVuKCcucGlwLWxvY2F0aW9uLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLWxvY2F0aW9uLW1hcCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogTG9jYXRpb25NYXBCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5waXBSZWJpbmQgPSBjaGFuZ2VzLnBpcFJlYmluZCA/IGNoYW5nZXMucGlwUmViaW5kLmN1cnJlbnRWYWx1ZSB8fCBmYWxzZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnBpcERyYWdnYWJsZSA9IGNoYW5nZXMucGlwRHJhZ2dhYmxlID8gY2hhbmdlcy5waXBEcmFnZ2FibGUuY3VycmVudFZhbHVlIHx8IGZhbHNlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGlwU3RyZXRjaCA9IGNoYW5nZXMucGlwU3RyZXRjaCA/IGNoYW5nZXMucGlwU3RyZXRjaC5jdXJyZW50VmFsdWUgfHwgZmFsc2UgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcFN0cmV0Y2ggPT09IHRydWUpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcENvbnRhaW5lci5hZGRDbGFzcygnc3RyZXRjaCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXBDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3N0cmV0Y2gnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGlwUmViaW5kID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcExvY2F0aW9uUG9zID0gY2hhbmdlcy5waXBMb2NhdGlvblBvcyA/IGNoYW5nZXMucGlwTG9jYXRpb25Qb3MuY3VycmVudFZhbHVlIDogdGhpcy5waXBMb2NhdGlvblBvcztcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwTG9jYXRpb25Qb3NpdGlvbnMgPSBjaGFuZ2VzLnBpcExvY2F0aW9uUG9zaXRpb25zID8gY2hhbmdlcy5waXBMb2NhdGlvblBvc2l0aW9ucy5jdXJyZW50VmFsdWUgOiB0aGlzLnBpcExvY2F0aW9uUG9zO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBJY29uUGF0aCA9IGNoYW5nZXMucGlwSWNvblBhdGggPyBjaGFuZ2VzLnBpcEljb25QYXRoLmN1cnJlbnRWYWx1ZSA6IHRoaXMucGlwSWNvblBhdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNsZWFyTWFwKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbWFwIGNvbnRyb2xcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwQ29udHJvbCkgdGhpcy5tYXBDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcENvbnRyb2wgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjaGVja0xvY2F0aW9uKGxvYykge1xyXG4gICAgICAgICAgICByZXR1cm4gIShsb2MgPT0gbnVsbCB8fCBsb2MuY29vcmRpbmF0ZXMgPT0gbnVsbCB8fCBsb2MuY29vcmRpbmF0ZXMubGVuZ3RoIDwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRldGVybWluZUNvb3JkaW5hdGVzKGxvYykge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICBsb2MuY29vcmRpbmF0ZXNbMV1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHBvaW50LmZpbGwgPSBsb2MuZmlsbDtcclxuICAgICAgICAgICAgcG9pbnQuc3Ryb2tlID0gbG9jLnN0cm9rZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2VuZXJhdGVNYXAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5waXBMb2NhdGlvblBvcyxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9ucyA9IHRoaXMucGlwTG9jYXRpb25Qb3NpdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBwb2ludHMgPSBbXSxcclxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZSA9IHRoaXMucGlwRHJhZ2dhYmxlIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gU2FmZWd1YXJkIGZvciBiYWQgY29vcmRpbmF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tMb2NhdGlvbihsb2NhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHRoaXMuZGV0ZXJtaW5lQ29vcmRpbmF0ZXMobG9jYXRpb24pKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbnMgJiYgbG9jYXRpb25zLmxlbmd0aCAmJiBsb2NhdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZWFjaChsb2NhdGlvbnMsIChsb2MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tMb2NhdGlvbihsb2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaCh0aGlzLmRldGVybWluZUNvb3JkaW5hdGVzKGxvYykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTWFwKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBjb250cm9sXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcENvbnRyb2wpIHRoaXMubWFwQ29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sID0gJCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBDb250cm9sLmFwcGVuZFRvKHRoaXMubWFwQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbWFwXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBwb2ludHNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGRyYWdnYWJsZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGRyYWdnYWJsZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5tYXBDb250cm9sWzBdLCBtYXBPcHRpb25zKSxcclxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBtYXJrZXJzXHJcbiAgICAgICAgICAgIF8uZWFjaChwb2ludHMsIChwb2ludCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWNvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiB0aGlzLnBpcEljb25QYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogcG9pbnQuZmlsbCB8fCAnI0VGNTM1MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IHBvaW50LnN0cm9rZSB8fCAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogNVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9pbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5waXBJY29uUGF0aCA/IGljb24gOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQocG9pbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEF1dG8tY29uZmlnIG9mIHpvb20gYW5kIGNlbnRlclxyXG4gICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTG9jYXRpb25NYXA6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIGJpbmRpbmdzOiBMb2NhdGlvbk1hcEJpbmRpbmdzLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IExvY2F0aW9uTWFwQ29udHJvbGxlclxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKFwicGlwTG9jYXRpb25NYXBcIiwgW10pXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwTG9jYXRpb25NYXAnLCBMb2NhdGlvbk1hcCk7XHJcbn0iLCLvu78vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBMb2NhdGlvbnMnLCBbICAgICAgICBcclxuICAgICAgICAncGlwTG9jYXRpb24nLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbk1hcCcsXHJcbiAgICAgICAgJ3BpcExvY2F0aW9uSXAnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbkVkaXREaWFsb2cnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbkVkaXQnLFxyXG4gICAgICAgICdwaXBMb2NhdGlvbnMuVHJhbnNsYXRlJ1xyXG4gICAgXSk7XHJcbiAgICBcclxufSkoKTtcclxuXHJcblxyXG4iLCIoZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb24vbG9jYXRpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tbmFtZSBsb2NhdGlvbi1jb2xsYXBzZVwiIG5nLWNsaWNrPVwiJGN0cmwucGlwTG9jYXRpb25SZXNpemUoKVwiIG5nLWlmPVwiISRjdHJsLnBpcENvbGxhcHNlXCJcXG4nICtcbiAgICAnICAgIG5nLWNsYXNzPVwiJGN0cmwucGlwU2hvd0xvY2F0aW9uSWNvbiA/IFxcJ3BpcC1sb2NhdGlvbi1pY29uLXNwYWNlXFwnIDogXFwnXFwnXCI+XFxuJyArXG4gICAgJyAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmxvY2F0aW9uXCIgY2xhc3M9XCJmbGV4LWZpeGVkIHBpcC1pY29uXCIgbmctaWY9XCIkY3RybC5waXBTaG93TG9jYXRpb25JY29uXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPHNwYW4gY2xhc3M9XCJwaXAtbG9jYXRpb24tdGV4dFwiPnt7JGN0cmwucGlwTG9jYXRpb25OYW1lfX08L3NwYW4+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPG1kLWJ1dHRvbiBjbGFzcz1cInBpcC1sb2NhdGlvbi1uYW1lXCIgbmctY2xpY2s9XCIkY3RybC5waXBMb2NhdGlvblJlc2l6ZSgpXCIgbmctaWY9XCIkY3RybC5waXBDb2xsYXBzZVwiXFxuJyArXG4gICAgJyAgICBuZy1jbGFzcz1cIiRjdHJsLnBpcFNob3dMb2NhdGlvbkljb24gPyBcXCdwaXAtbG9jYXRpb24taWNvbi1zcGFjZVxcJyA6IFxcJ1xcJ1wiPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgbGF5b3V0LXJvdyB3LXN0cmV0Y2hcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmxvY2F0aW9uXCIgY2xhc3M9XCJmbGV4LWZpeGVkIHBpcC1pY29uXCIgbmctaWY9XCIkY3RybC5waXBTaG93TG9jYXRpb25JY29uXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDxzcGFuIGNsYXNzPVwicGlwLWxvY2F0aW9uLXRleHQgZmxleFwiPnt7JGN0cmwucGlwTG9jYXRpb25OYW1lfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp0cmlhbmdsZS1kb3duXCIgY2xhc3M9XCJmbGV4LWZpeGVkXCIgbmctc2hvdz1cIiEkY3RybC5zaG93TWFwXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dHJpYW5nbGUtdXBcIiBjbGFzcz1cImZsZXgtZml4ZWRcIiBuZy1zaG93PVwiJGN0cmwuc2hvd01hcFwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcExvY2F0aW9ucy5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xvY2F0aW9uX2RpYWxvZy9sb2NhdGlvbkRpYWxvZy5odG1sJyxcbiAgICAnPG1kLWRpYWxvZyBjbGFzcz1cInBpcC1kaWFsb2cgcGlwLWxvY2F0aW9uLWVkaXQtZGlhbG9nIGxheW91dC1jb2x1bW5cIiBtZC10aGVtZT1cInt7JGN0cmwudGhlbWV9fVwiPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJwaXAtaGVhZGVyIGxheW91dC1jb2x1bW4gbGF5b3V0LWFsaWduLXN0YXJ0LXN0YXJ0XCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLXByb2dyZXNzLWxpbmVhciBuZy1zaG93PVwiJGN0cmwudHJhbnNhY3Rpb24uYnVzeSgpXCIgbWQtbW9kZT1cImluZGV0ZXJtaW5hdGVcIiBjbGFzcz1cInBpcC1wcm9ncmVzcy10b3BcIj5cXG4nICtcbiAgICAnICAgICAgICA8L21kLXByb2dyZXNzLWxpbmVhcj5cXG4nICtcbiAgICAnICAgICAgICA8aDMgY2xhc3M9XCJmbGV4XCI+e3sgXFwnTE9DQVRJT05fU0VUX0xPQ0FUSU9OXFwnIHwgdHJhbnNsYXRlIH19PC9oMz5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1mb290ZXJcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwibGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQWRkUGluKClcIiBuZy1zaG93PVwiJGN0cmwubG9jYXRpb25Qb3MgPT0gbnVsbFwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBuZy1kaXNhYmxlZD1cIiRjdHJsLnRyYW5zYWN0aW9uLmJ1c3koKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX0FERF9QSU5cXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICB7eyA6OlxcJ0xPQ0FUSU9OX0FERF9QSU5cXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uUmVtb3ZlUGluKClcIiBuZy1zaG93PVwiJGN0cmwubG9jYXRpb25Qb3MgIT0gbnVsbFwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBuZy1kaXNhYmxlZD1cIiRjdHJsLnRyYW5zYWN0aW9uLmJ1c3koKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1JFTU9WRV9QSU5cXCcgIH19XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICB7eyA6OlxcJ0xPQ0FUSU9OX1JFTU9WRV9QSU5cXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImZsZXhcIj48L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwibGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlclwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwub25DYW5jZWwoKVwiIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0NBTkNFTFxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCIkY3RybC5vbkFwcGx5KClcIiBuZy1kaXNhYmxlZD1cIiRjdHJsLnRyYW5zYWN0aW9uLmJ1c3koKVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwie3sgOjpcXCdBUFBMWVxcJyAgfX1cIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IDo6XFwnQVBQTFlcXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJwaXAtYm9keVwiPlxcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tY29udGFpbmVyXCI+PC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtem9vbS1pblwiIG5nLWNsaWNrPVwiJGN0cmwub25ab29tSW4oKVwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwie3sgOjpcXCdMT0NBVElPTl9aT09NX0lOXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIG1kLWZhYiBwaXAtem9vbS1vdXRcIiBuZy1jbGljaz1cIiRjdHJsLm9uWm9vbU91dCgpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1pPT01fT1VUXFwnICB9fVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOm1pbnVzXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBtZC1mYWIgcGlwLXNldC1sb2NhdGlvblwiIG5nLWNsaWNrPVwiJGN0cmwub25TZXRMb2NhdGlvbigpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJ7eyA6OlxcJ0xPQ0FUSU9OX1NFVF9MT0NBVElPTlxcJyAgfX1cIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgbmctc2hvdz1cInN1cHBvcnRTZXRcIiBuZy1kaXNhYmxlZD1cInRyYW5zYWN0aW9uLmJ1c3koKVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnRhcmdldFwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L21kLWRpYWxvZz5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwTG9jYXRpb25zLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9jYXRpb25fZWRpdC9sb2NhdGlvbkVkaXQuaHRtbCcsXG4gICAgJzxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJtZC1ibG9ja1wiPlxcbicgK1xuICAgICcgICAgPGxhYmVsPnt7IFxcJ0xPQ0FUSU9OXFwnIHwgdHJhbnNsYXRlIH19PC9sYWJlbD5cXG4nICtcbiAgICAnICAgIDxpbnB1dCBuZy1tb2RlbD1cIiRjdHJsLnBpcExvY2F0aW9uTmFtZVwiIG5nLWRpc2FibGVkPVwiJGN0cmwubmdEaXNhYmxlZFwiLz5cXG4nICtcbiAgICAnPC9tZC1pbnB1dC1jb250YWluZXI+XFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtbG9jYXRpb24tZW1wdHlcIiBsYXlvdXQ9XCJjb2x1bW5cIiBsYXlvdXQtYWxpZ249XCJjZW50ZXIgY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtcmFpc2VkXCIgbmctZGlzYWJsZWQ9XCIkY3RybC5uZ0Rpc2FibGVkXCIgbmctY2xpY2s9XCIkY3RybC5vblNldExvY2F0aW9uKClcIlxcbicgK1xuICAgICcgICAgICAgICAgICBhcmlhLWxhYmVsPVwiTE9DQVRJT05fQUREX0xPQ0FUSU9OXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbi1sb2NhdGlvblwiPjwvc3Bhbj4ge3tcXCdMT0NBVElPTl9BRERfTE9DQVRJT05cXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1sb2NhdGlvbi1jb250YWluZXJcIiB0YWJpbmRleD1cInt7ICRjdHJsLm5nRGlzYWJsZWQgPyAtMSA6IDAgfX1cIiBcXG4nICtcbiAgICAnICAgIG5nLWNsaWNrPVwiJGN0cmwub25NYXBDbGljaygkZXZlbnQpXCIgbmcta2V5cHJlc3M9XCIkY3RybC5vbk1hcEtleVByZXNzKCRldmVudClcIj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waXAtd2VidWktbG9jYXRpb25zLWh0bWwuanMubWFwXG4iXX0=