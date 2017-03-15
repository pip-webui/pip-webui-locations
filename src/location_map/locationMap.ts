{

    interface ILocationMapBindings {
        [key: string]: any;

        pipLocationPos: any;
        pipLocationPositions: any;
        pipIconPath: any;
        pipDraggable: any;
        pipStretch: any;
        pipRebind: any;
    }

    const LocationMapBindings: ILocationMapBindings = {
        pipLocationPos: '<',
        pipLocationPositions: '<',
        pipIconPath: '<',
        pipDraggable: '<',
        pipStretch: '<',
        pipRebind: '<'
    }

    class LocationMapBindingsChanges implements ng.IOnChangesObject, ILocationMapBindings {
        [key: string]: any;

        pipLocationPos: ng.IChangesObject<any>;
        pipLocationPositions: ng.IChangesObject<any>;
        pipIconPath: ng.IChangesObject<string>;
        pipDraggable: ng.IChangesObject<boolean>;
        pipStretch: ng.IChangesObject<boolean>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class LocationMapController implements ng.IController, ILocationMapBindings {
        public pipLocationPos: any;
        public pipLocationPositions: any;
        public pipIconPath: string;
        public pipDraggable: boolean;
        public pipStretch: boolean;
        public pipRebind: boolean;

        private mapContainer: JQuery;
        private mapControl: any = null;

        constructor(
            private $element: JQuery
        ) {
            this.mapContainer = $element.children('.pip-location-container');
            $element.addClass('pip-location-map');
        }

        public $onChanges(changes: LocationMapBindingsChanges) {
            this.pipRebind = changes.pipRebind ? changes.pipRebind.currentValue || false : false;
            this.pipDraggable = changes.pipDraggable ? changes.pipDraggable.currentValue || false : false;
            this.pipStretch = changes.pipStretch ? changes.pipStretch.currentValue || false : false;

            if (this.pipStretch === true)  {
                this.mapContainer.addClass('stretch');
            } else {
                this.mapContainer.removeClass('stretch');
            }

            if (this.pipRebind === true) {
                this.pipLocationPos = changes.pipLocationPos ? changes.pipLocationPos.currentValue : this.pipLocationPos;
                this.pipLocationPositions = changes.pipLocationPositions ? changes.pipLocationPositions.currentValue : this.pipLocationPos;
                this.pipIconPath = changes.pipIconPath ? changes.pipIconPath.currentValue : this.pipIconPath;

                this.generateMap();
            }
        }

        private clearMap() {
            // Remove map control
            if (this.mapControl) this.mapControl.remove();
            this.mapControl = null;
        }

        private checkLocation(loc) {
            return !(loc == null || loc.coordinates == null || loc.coordinates.length < 0);
        }

        private determineCoordinates(loc) {
            const point = new google.maps.LatLng(
                loc.coordinates[0],
                loc.coordinates[1]
            );

            point.fill = loc.fill;
            point.stroke = loc.stroke;

            return point;
        }

        private generateMap() {
            const location = this.pipLocationPos,
                locations = this.pipLocationPositions,
                points = [],
                draggable = this.pipDraggable || false;

            // Safeguard for bad coordinates
            if (this.checkLocation(location)) {
                points.push(this.determineCoordinates(location));
            } else {
                if (locations && locations.length && locations.length > 0) {
                    _.each(locations, (loc) => {
                        if (this.checkLocation(loc)) {
                            points.push(this.determineCoordinates(loc));
                        }
                    });
                }
            }

            if (points.length === 0) {
                this.clearMap();
                return;
            }

            // Clean up the control
            if (this.mapControl) this.mapControl.remove();
            this.mapControl = $('<div></div>');
            this.mapControl.appendTo(this.mapContainer);

            // Create the map
            const mapOptions = {
                    center: points[0],
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                    disableDoubleClickZoom: true,
                    scrollwheel: draggable,
                    draggable: draggable
                },
                map = new google.maps.Map(this.mapControl[0], mapOptions),
                bounds = new google.maps.LatLngBounds();

            // Create markers
            _.each(points, (point) => {
                const icon = {
                    path: this.pipIconPath,
                    fillColor: point.fill || '#EF5350',
                    fillOpacity: 1,
                    scale: 1,
                    strokeColor: point.stroke || 'white',
                    strokeWeight: 5
                };

                new google.maps.Marker({
                    position: point,
                    map: map,
                    icon: this.pipIconPath ? icon : null
                });
                bounds.extend(point);
            });

            // Auto-config of zoom and center
            if (points.length > 1) map.fitBounds(bounds);
        }
    }

    const LocationMap: ng.IComponentOptions = {
        bindings: LocationMapBindings,
        template: '<div class="pip-location-container"></div>',
        controller: LocationMapController
    }

    angular
        .module("pipLocationMap", [])
        .component('pipLocationMap', LocationMap);
}