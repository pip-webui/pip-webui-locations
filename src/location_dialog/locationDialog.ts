export class LocationEditDialogController {
        private _map = null;
        private _marker = null;

        public theme: string;
        public locationPos;
        public locationName;
        public supportSet: boolean;

        constructor(
            private $scope: ng.IScope,
            $rootScope: ng.IRootScopeService,
            $timeout: angular.ITimeoutService,
            private $mdDialog: angular.material.IDialogService,
            locationPos,
            locationName: string
        ) {
            this.theme = $rootScope['$theme'];
            this.locationPos = locationPos && locationPos.type == 'Point' &&
                locationPos.coordinates && locationPos.coordinates.length == 2 ?
                locationPos : null;
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
                $timeout(() => {
                    google.maps.event.trigger(this._map, 'resize');
                }, 1000);
            }, 0);

            $scope.$on('pipLayoutResized', () => {
                if (this._map == null) return;
                google.maps.event.trigger(this._map, 'resize');
            });

        }

        private createMarker(coordinates) {
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

        private changeLocation(coordinates, tid) {
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
            geocoder.geocode({
                location: coordinates
            }, (results, status) => {
                // if ($scope.transaction.aborted(tid)) return;

                // Process positive response
                if (status == google.maps.GeocoderStatus.OK && results && results.length > 0) {
                    this.locationName = results[0].formatted_address;
                }

                // $scope.transaction.end();
                this.$scope.$apply();
            })
        }
        // Describe user actions
        public onAddPin() {
            if (this._map == null) return;

            const coordinates = this._map.getCenter();
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
            const zoom = this._map.getZoom();
            this._map.setZoom(zoom + 1);
        }

        public onZoomOut() {
            if (this._map == null) return;
            const zoom = this._map.getZoom();
            this._map.setZoom(zoom > 1 ? zoom - 1 : zoom);
        }

        public onSetLocation = function () {
            if (this._map == null) return;

            // var tid = $scope.transaction.begin();
            // if (tid == null) return;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // if ($scope.transaction.aborted(tid)) return;

                    const coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    this._marker = this.createMarker(coordinates);
                    this._map.setCenter(coordinates);
                    this._map.setZoom(12);
                    this.changeLocation(coordinates, null);
                },
                () => {
                    // $scope.transaction.end();
                    this.$scope.$apply();
                }, {
                    maximumAge: 0,
                    enableHighAccuracy: true,
                    timeout: 5000
                });
        }

        public onCancel(): void {
            this.$mdDialog.cancel();
        }

        public onApply(): void {
            this.$mdDialog.hide({
                location: this.locationPos,
                locationPos: this.locationPos,
                locationName: this.locationName
            })
        }
    }

{
    const LocationDialogRun = function($injector: ng.auto.IInjectorService) {
        let pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null;

        if (pipTranslate) {
            ( < any > pipTranslate).setTranslations('en', {
                'LOCATION_ADD_LOCATION': 'Add location',
                'LOCATION_SET_LOCATION': 'Set location',
                'LOCATION_ADD_PIN': 'Add pin',
                'LOCATION_REMOVE_PIN': 'Remove pin'
            });
            ( < any > pipTranslate).setTranslations('ru', {
                'LOCATION_ADD_LOCATION': 'Добавить местоположение',
                'LOCATION_SET_LOCATION': 'Определить положение',
                'LOCATION_ADD_PIN': 'Добавить точку',
                'LOCATION_REMOVE_PIN': 'Убрать точку'
            });
        }
    }


    angular.module('pipLocationEditDialog')
        .run(LocationDialogRun);
}