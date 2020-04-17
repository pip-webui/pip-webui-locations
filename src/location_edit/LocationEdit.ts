import { ILocationDialogService } from '../location_dialog/ILocationDialogService';

{
    interface ILocationEditBindings {
        [key: string]: any;

        pipLocationName: any;
        pipLocationPos: any;
        pipLocationHolder: any;
        ngDisabled: any;
        pipChanged: any;
    }

    const LocationEditBindings: ILocationEditBindings = {
        pipLocationName: '=',
        pipLocationPos: '=',
        pipLocationHolder: '=',
        ngDisabled: '<',
        pipChanged: '&'
    }

    class LocationEditBindingsChanges implements ng.IOnChangesObject, ILocationEditBindings {
        [key: string]: any;

        pipLocationName: any;
        pipLocationPos: any;
        pipLocationHolder: any;
        pipChanged: any;

        ngDisabled: ng.IChangesObject<boolean>;
    }

    class LocationEditController implements ng.IController, ILocationEditBindings {
        public pipLocationName: string;
        public pipLocationPos: any;
        public pipLocationHolder: boolean;
        public ngDisabled: boolean;
        public pipChanged: Function;

        private empty: JQuery;
        private mapContainer: JQuery;
        private mapControl: any;
        private defineCoordinatesDebounced: Function;

        constructor(
            private $element: JQuery,
            private $scope: ng.IScope,
            private pipLocationEditDialog: ILocationDialogService
        ) {
            "ngInject";
            this.defineCoordinatesDebounced = _.debounce(() => {
                this.defineCoordinates
            }, 2000);
        }

        public $postLink() {
            this.$element.find('md-input-container').attr('md-no-float', (!!this.pipLocationHolder).toString());
            // Set containers
            this.empty = this.$element.children('.pip-location-empty');
            this.mapContainer = this.$element.children('.pip-location-container');
            this.mapControl = null;

            // Add watchers
            this.$scope.$watch('$ctrl.pipLocationName',
                (newValue, oldValue) => {
                    if (newValue !== oldValue) {
                        this.defineCoordinatesDebounced();
                    }
                }
            );
            this.$scope.$watch('$ctrl.pipLocationPos',
                () => {
                    this.generateMap();
                }
            );

            // Add class
            this.$element.addClass('pip-location-edit');

            // Visualize map
            if (this.pipLocationPos) {
                this.generateMap();
            } else {
                this.clearMap();
            }
        }

        public $onChanges(changes: LocationEditBindingsChanges) {
            this.ngDisabled = changes.ngDisabled ? changes.ngDisabled.currentValue : false;
        }

        private clearMap() {
            // Remove map control
            if (this.mapControl) this.mapControl.remove();
            this.mapControl = null;

            // Toggle control visibility
            this.mapContainer.hide();
            this.empty.show();
        }

        private generateMap() {
            // Safeguard for bad coordinates
            const location = this.pipLocationPos;
            if (location == null || location.coordinates == null || location.coordinates.length < 0) {
                this.clearMap();
                return;
            }

            // Determine map coordinates
            const coordinates = new google.maps.LatLng(
                location.coordinates[0],
                location.coordinates[1]
            );

            // Clean up the control
            if (this.mapControl) this.mapControl.remove();

            // Toggle control visibility
            this.mapContainer.show();
            this.empty.hide();

            // Add a new map
            this.mapControl = $('<div></div>');
            this.mapControl.appendTo(this.mapContainer);

            // Create the map with point marker
            const mapOptions = {
                center: coordinates,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggable: false
            },
                map = new google.maps.Map(this.mapControl[0], mapOptions),
                marker = new google.maps.Marker({
                    position: coordinates,
                    map: map
                });
        }

        private defineCoordinates() {
            const locationName = this.pipLocationName;

            if (locationName == '') {
                this.pipLocationPos = null;
                this.clearMap();
                this.$scope.$apply();
                return;
            }

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                address: locationName
            }, function (results, status) {
                this.$scope.$apply(function () {
                    // Process response
                    if (status === google.maps.GeocoderStatus.OK) {
                        // Check for empty results
                        if (results === null || results.length === 0) {
                            this.pipLocationPos = null;
                            this.clearMap();
                            return;
                        }

                        const geometry = results[0].geometry || {},
                            location = geometry.location || {};

                        // Check for empty results again
                        if (location.lat === null || location.lng === null) {
                            this.pipLocationPos = null;
                            this.clearMap();
                            return;
                        }

                        this.pipLocationPos = {
                            type: 'Point',
                            coordinates: {
                                latitude: location.lat(),
                                longtitude: location.lng()
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

        public onSetLocation() {
            if (this.ngDisabled) return;

            this.pipLocationEditDialog.show({
                locationName: this.pipLocationName,
                locationPos: this.pipLocationPos
            },
                (result) => {
                    const
                        location = result.location,
                        locationName = result.locationName;

                    // Do not change anything if location is about the same
                    if (this.pipLocationPos && this.pipLocationPos.type == 'Point' &&
                        this.pipLocationPos.coordinates.length == 2 &&
                        location && location.coordinates.length == 2 &&
                        (this.pipLocationPos.coordinates[0] - location.coordinates[0]) < 0.0001 &&
                        (this.pipLocationPos.coordinates[1] - location.coordinates[1]) < 0.0001 &&
                        (locationName === this.pipLocationName)) {
                        return;
                    }

                    this.pipLocationPos = location;
                    this.pipLocationName = locationName;

                    if (locationName === null && location !== null) {
                        this.pipLocationName =
                            '(' + result.location.coordinates[0] +
                            ',' + result.location.coordinates[1] + ')';
                    }
                    this.pipChanged();
                    this.mapContainer[0].focus();
                }
            );
        };

        public onMapClick($event) {
            if (this.ngDisabled) return;

            this.mapContainer[0].focus();
            this.onSetLocation();
            //$event.stopPropagation();
        };

        public onMapKeyPress($event) {
            if (this.ngDisabled) return;

            if ($event.keyCode == 13 || $event.keyCode == 32) {
                this.onSetLocation();
                //$event.stopPropagation();
            }
        };
    }

    const LocationEdit: ng.IComponentOptions = {
        bindings: LocationEditBindings,
        templateUrl: 'location_edit/LocationEdit.html',
        controller: LocationEditController
    }

    angular
        .module("pipLocationEdit", ['pipLocationEditDialog'])
        .component('pipLocationEdit', LocationEdit);

}