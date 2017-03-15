{
    interface ILocationBindings {
        [key: string]: any;

        pipLocationName: any;
        pipLocationPos: any;
        pipShowLocationIcon: any;
        pipCollapse: any;
        pipRebind: any;
        pipDisabled: any;
        pipLocationResize: any;
    }

    const LocationBindings: ILocationBindings = {
        pipLocationName: '<',
        pipLocationPos: '<',
        pipShowLocationIcon: '<',
        pipCollapse: '<',
        pipRebind: '<',
        pipDisabled: '<',
        pipLocationResize: '&'
    }

    class LocationBindingsChanges implements ng.IOnChangesObject, ILocationBindings {
        [key: string]: any;

        pipLocationName: ng.IChangesObject < string > ;
        pipLocationPos: ng.IChangesObject < any > ;
        pipShowLocationIcon: ng.IChangesObject < boolean > ;
        pipCollapse: ng.IChangesObject < boolean > ;
        pipRebind: ng.IChangesObject < boolean > ;
        pipDisabled: ng.IChangesObject < boolean > ;

        pipLocationResize: any;
    }

    class LocationController implements ng.IController, ILocationBindings {
        public pipLocationName: string;
        public pipLocationPos: any;
        public pipShowLocationIcon: boolean;
        public pipCollapse: boolean;
        public pipRebind: boolean;
        public pipDisabled: boolean;
        public showMap: boolean = true;
        public pipLocationResize: Function;

        private name: JQuery;
        private mapContainer: JQuery;
        private mapControl: JQuery;

        constructor(
            private $element: JQuery,
            private $timeout: ng.ITimeoutService,
            private $scope: ng.IScope
        ) {
            "ngInject";
            // Add class
            $element.addClass('pip-location');
        }

        public $postLink() {
            this.$timeout(() => {
                this.name = this.$element.find('.pip-location-name');
                this.mapContainer = this.$element.find('.pip-location-container');

                if (this.pipCollapse === true) {
                    this.mapContainer.hide();
                    this.showMap = false;

                    // Process user click
                    this.name.click((event) => {
                        event.stopPropagation();
                        if (this.pipDisabled) return;
                        this.showMap = !this.showMap;
                        this.mapContainer[this.showMap ? 'show' : 'hide']();
                        if (this.showMap) this.generateMap();
                        if (!this.$scope.$$phase) this.$scope.$apply();
                    });
                }

                this.redrawMap();
            });
        }

        private redrawMap() {
            if (!this.mapContainer) return;

            // Visualize map
            if (this.pipLocationPos && this.showMap === true) {
                this.generateMap();
            } else {
                this.clearMap();
            }
        }

        public $onChanges(changes: LocationBindingsChanges) {
            this.pipRebind = changes.pipRebind ? changes.pipRebind.currentValue || false : false;
            this.pipShowLocationIcon = changes.pipShowLocationIcon ? changes.pipShowLocationIcon.currentValue || false : false;
            this.pipCollapse = changes.pipCollapse ? changes.pipCollapse.currentValue || false : false;
            this.pipDisabled = changes.pipDisabled ? changes.pipDisabled.currentValue || false : false;

            if (this.pipRebind) {
                this.pipLocationName = changes.pipLocationName ? changes.pipLocationName.currentValue : null;
                this.pipLocationPos = changes.pipLocationPos ? changes.pipLocationPos.currentValue : null;
                this.redrawMap();
            }
        }

        private clearMap() {
            // Remove map control
            if (this.mapControl) this.mapControl.remove();
            this.mapControl = null;
            this.mapContainer.hide();
        }

        private generateMap() {
            const location = this.pipLocationPos;

            // Safeguard for bad coordinates
            if (this.showMap === false || location == null || location.coordinates == null || location.coordinates.length < 0) {
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
            this.mapControl = $('<div></div>');
            this.mapContainer.show();
            this.mapControl.appendTo(this.mapContainer);

            // Create the map with point marker
            const
                mapOptions = {
                    center: coordinates,
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                    disableDoubleClickZoom: true,
                    scrollwheel: false,
                    draggable: false
                },
                map = new google.maps.Map(this.mapControl[0], mapOptions);

            new google.maps.Marker({
                position: coordinates,
                map: map
            });
        };
    }

    const LocationComponent: ng.IComponentOptions = {
        bindings: LocationBindings,
        templateUrl: 'location/location.html',
        controller: LocationController
    }

    angular.module("pipLocation", [])
        .component('pipLocation', LocationComponent);
}