/**
 * @file Location edit dialog
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo
 * - Improve sample in sampler app
 */
 
/* global angular, google */

class LocationDialogService {
    private _$mdDialog: angular.material.IDialogService;

    constructor($mdDialog: angular.material.IDialogService) {
        this._$mdDialog = $mdDialog;
    }

    public show (params, successCallback, cancelCallback) {
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
        .then((result) => {
            if (successCallback) {
                successCallback(result);
            }
        }, () => {
            if (cancelCallback) {
                cancelCallback();
            }
        });
    }
}

class LocationEditDialogController {
    private _map = null;
    private _marker = null;
    private _$scope: ng.IScope;
    private _$mdDialog: angular.material.IDialogService;

    public theme: string;
    public locationPos;
    public locationName;
    public supportSet: boolean;

    constructor(
        $scope: ng.IScope, 
        $rootScope: ng.IRootScopeService, 
        $timeout: angular.ITimeoutService, 
        $mdDialog: angular.material.IDialogService,
        locationPos, 
        locationName) {

        this._$mdDialog = $mdDialog;
        this._$scope = $scope;
        this.theme = $rootScope['$theme'];
        this.locationPos = locationPos && locationPos.type == 'Point'
                && locationPos.coordinates && locationPos.coordinates.length == 2
                ? locationPos : null;
        this.locationName = locationName;
        this.supportSet = navigator.geolocation != null;

         // Wait until dialog is initialized
        $timeout(() => {
            let mapContainer = $('.pip-location-edit-dialog .pip-location-container');
            // Calculate coordinate of the center
            let coordinates = this.locationPos ?
                new google.maps.LatLng(
                    this.locationPos.coordinates[0],
                    this.locationPos.coordinates[1]
                ) : null;

                // Create the map with point marker
            let mapOptions = {
                center: new google.maps.LatLng(0, 0),
                zoom: 1,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            }
            if (coordinates != null) {
                mapOptions.center = coordinates;
                mapOptions.zoom = 12;
            }

            this._map = new google.maps.Map(mapContainer[0], mapOptions);
            this._marker = this.createMarker(coordinates);

                // Fix resizing issue
            setTimeout(() => {
                google.maps.event.trigger(this._map, 'resize');
            }, 1000);
        }, 0);

        $scope.$on('pipLayoutResized', () => {
            if (this._map == null) return;
            google.maps.event.trigger(this._map, 'resize');
        });

    }

    public createMarker (coordinates) {
        if (this._marker) this._marker.setMap(null);
        if (coordinates) {
            this._marker = new google.maps.Marker({ 
                position: coordinates, 
                map: this._map,
                draggable: true,
                animation: google.maps.Animation.DROP
            });

            let thisMarker = this._marker;
            google.maps.event.addListener(thisMarker, 'dragend', () => {
                let coordinates = thisMarker.getPosition(); 
                    this.changeLocation(coordinates, null);
            });
        } else {
            this._marker = null;
        }

        return this._marker;
    }

    public changeLocation(coordinates, tid) {
        this.locationPos = {
            type: 'Point',
            coordinates: [coordinates.lat(), coordinates.lng()]
        };
        this.locationName = null;

        if (tid == null) {
            // tid = $scope.transaction.begin();
            if (tid == null) return;
        }

        // Read address
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: coordinates }, (results, status) => {
            // if ($scope.transaction.aborted(tid)) return;

            // Process positive response
            if (status == google.maps.GeocoderStatus.OK && results && results.length > 0) {
                this.locationName = results[0].formatted_address;
            }

                    // $scope.transaction.end();
            this._$scope.$apply();
        })
    }
    public onAddPin() {
        if (this._map == null) return;

        let coordinates = this._map.getCenter();
            this._marker = this.createMarker(coordinates);
            this.changeLocation(coordinates, null);
    }

    public onRemovePin() {
        if (this._map == null) return;
        this._marker = this.createMarker(null);
        this.locationPos = null;
        this.locationName = null;
    }

    public onZoomIn() {
        if (this._map == null) return;
        let zoom = this._map.getZoom();
        this._map.setZoom(zoom + 1);
    }

    public onZoomOut() {
        if (this._map == null) return;
        let zoom = this._map.getZoom();
        this._map.setZoom(zoom > 1 ? zoom - 1 : zoom);
    }

    public onSetLocation = function () {
        if (this._map == null) return;

                // var tid = $scope.transaction.begin();
                // if (tid == null) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                        // if ($scope.transaction.aborted(tid)) return;

                let coordinates = new google.maps.LatLng(
                    position.coords.latitude, position.coords.longitude);
                this._marker = this.createMarker(coordinates);
                this._map.setCenter(coordinates);
                this._map.setZoom(12);
                this.changeLocation(coordinates, null);
            },
            () => {
                        // $scope.transaction.end();
                this.$scope.$apply();
            },
        {
            maximumAge: 0,
            enableHighAccuracy: true,
            timeout: 5000
        });
    }

    public onCancel(): void {
        this._$mdDialog.cancel();
    }

    public onApply(): void {
        this._$mdDialog.hide({
            location: this.locationPos,
            locationPos: this.locationPos,
            locationName: this.locationName   
        })
    }

    

}

(() => {
    'use strict';
    function LocationDialogRun ($injector) {
        let pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null;

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


    angular.module('pipLocationEditDialog', ['ngMaterial',  'pipLocations.Templates'])
           .run(LocationDialogRun)
           .service('pipLocationEditDialog', LocationDialogService)
           .controller('pipLocationEditDialogController', LocationEditDialogController 
        /*function ($scope, $rootScope, $timeout, $mdDialog,  locationPos, locationName) {

            $scope.theme = $rootScope.$theme;
            $scope.locationPos = locationPos && locationPos.type == 'Point'
                && locationPos.coordinates && locationPos.coordinates.length == 2
                ? locationPos : null;
            $scope.locationName = locationName;
            $scope.supportSet = navigator.geolocation != null;

            // $scope.transaction = pipTransaction('location_edit_dialog', $scope);

            var map = null, marker = null;

            function createMarker (coordinates) {
                if (marker) marker.setMap(null);
                
                if (coordinates) {
                    marker = new google.maps.Marker({ 
                        position: coordinates, 
                        map: map,
                        draggable: true,
                        animation: google.maps.Animation.DROP
                    });

                    var thisMarker = marker;
                    google.maps.event.addListener(thisMarker, 'dragend', function() {
                       var coordinates = thisMarker.getPosition(); 
                       changeLocation(coordinates, null);
                    });
                } else {
                    marker = null;
                }

                return marker;
            };

            function changeLocation(coordinates, tid) {
                $scope.locationPos = {
                    type: 'Point',
                    coordinates: [coordinates.lat(), coordinates.lng()]
                };
                $scope.locationName = null;

                if (tid == null) {
                    // tid = $scope.transaction.begin();
                    if (tid == null) return;
                }

                // Read address
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: coordinates }, function(results, status) {
                    // if ($scope.transaction.aborted(tid)) return;

                    // Process positive response
                    if (status == google.maps.GeocoderStatus.OK
                        && results && results.length > 0) {
                        $scope.locationName = results[0].formatted_address;
                    }

                    // $scope.transaction.end();
                    $scope.$apply();
                });
            };

            // Wait until dialog is initialized
            $timeout(function () {
                var mapContainer = $('.pip-location-edit-dialog .pip-location-container');

                // Calculate coordinate of the center
                var coordinates = $scope.locationPos ?
                    new google.maps.LatLng(
                        $scope.locationPos.coordinates[0],
                        $scope.locationPos.coordinates[1]
                    ) : null;

                // Create the map with point marker
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

                // Fix resizing issue
                setTimeout(function () {
                    google.maps.event.trigger(map, 'resize');
                }, 1000);
            }, 0);

            $scope.$on('pipLayoutResized', function (event) {
                if (map == null) return;
                google.maps.event.trigger(map, 'resize');
            });

            $scope.onAddPin = function () {
                if (map == null) return;

                var coordinates = map.getCenter();
                marker = createMarker(coordinates);
                changeLocation(coordinates, null);
            };

            $scope.onRemovePin = function () {
                if (map == null) return;
                marker = createMarker(null);
                $scope.locationPos = null;
                $scope.locationName = null;
            };

            $scope.onZoomIn = function () {
                if (map == null) return;
                var zoom = map.getZoom();
                map.setZoom(zoom + 1);
            };

            $scope.onZoomOut = function () {
                if (map == null) return;
                var zoom = map.getZoom();
                map.setZoom(zoom > 1 ? zoom - 1 : zoom);
            };

            $scope.onSetLocation = function () {
                if (map == null) return;

                // var tid = $scope.transaction.begin();
                // if (tid == null) return;

                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        // if ($scope.transaction.aborted(tid)) return;

                        var coordinates = new google.maps.LatLng(
                            position.coords.latitude, position.coords.longitude);

                        marker = createMarker(coordinates);
                        map.setCenter(coordinates);
                        map.setZoom(12);

                        changeLocation(coordinates, null);
                    },
                    function () {
                        // $scope.transaction.end();
                        $scope.$apply();
                    },
                    {
                        maximumAge: 0,
                        enableHighAccuracy: true,
                        timeout: 5000
                    }
                );
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
        }*/
    );
})();
