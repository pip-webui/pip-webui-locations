declare let google: any;

{
    interface ILocationIpBindings {
        [key: string]: any;

        pipIpaddress: any;
        pipExtraInfo: any;
        pipRebind: any;
    }

    const LocationIpBindings: ILocationIpBindings = {
        pipIpaddress: '<',
        pipExtraInfo: '&',
        pipRebind: '<'
    }

    interface IIpResponseInfo {
        city: string;
        regionCode: string | number;
        regionName: string;
        zipCode: string | number;
        countryCode: string | number;
        countryName: string;
        latitude: string | number;
        longitude: string | number;
    }

    class LocationIpBindingsChanges implements ng.IOnChangesObject, ILocationIpBindings {
        [key: string]: any;

        pipExtraInfo: any;

        pipIpaddress: ng.IChangesObject < string > ;
        pipRebind: ng.IChangesObject < boolean >
    }

    class LocationIpController implements ng.IController, ILocationIpBindings {
        private mapContainer: JQuery;
        private mapControl: any;

        public pipExtraInfo: any;
        public pipIpaddress: string;
        public pipRebind: boolean;

        constructor(
            $element: JQuery,
            private $http: ng.IHttpService
        ) {
            "ngInject";
            this.mapContainer = $element.children('.pip-location-container');
            $element.addClass('pip-location-ip');
            this.defineCoordinates();
        }

        public $onChanges(changes: LocationIpBindingsChanges) {
            this.pipRebind = changes.pipRebind ? changes.pipRebind.currentValue || false : false;

            if (this.pipRebind === true) {
                this.pipIpaddress = changes.pipIpaddress ? changes.pipIpaddress.currentValue : this.pipIpaddress;
                this.defineCoordinates();
            }
        }

        private clearMap() {
            // Remove map control
            if (this.mapControl) this.mapControl.remove();
            this.mapControl = null;
        }

        private generateMap(latitude, longitude) {
            // Safeguard for bad coordinates
            if (latitude == null || longitude == null) {
                this.clearMap();
                return;
            }

            // Determine map coordinates
            var coordinates = new google.maps.LatLng(
                latitude,
                longitude
            );

            // Clean up the control
            if (this.mapControl) this.mapControl.remove();
            this.mapControl = $('<div></div>');
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
        }

        private defineCoordinates() {
            const ipAddress = this.pipIpaddress;

            if (ipAddress == '') {
                this.clearMap();
                return;
            }

            this.$http.get('https://freegeoip.net/json/' + ipAddress)
                .success((response: IIpResponseInfo) => {
                    if (response != null &&
                        response.latitude != null &&
                        response.longitude != null) {

                        this.generateMap(response.latitude, response.longitude);

                        if (this.pipExtraInfo) {
                            const extraInfo = {
                                city: response.city,
                                regionCode: response.regionCode,
                                region: response.regionName,
                                zipCode: response.zipCode,
                                countryCode: response.countryCode,
                                country: response.countryName
                            };
                            this.pipExtraInfo({
                                extraInfo: extraInfo
                            });
                        }
                    } else {
                        this.clearMap();
                    }
                })
                .error((response) => {
                    this.clearMap();
                });
        }
    }

    const LocationIp: ng.IComponentOptions = {
        bindings: LocationIpBindings,
        template: '<div class="pip-location-container"></div>',
        controller: LocationIpController
    }

    angular
        .module("pipLocationIp", [])
        .component('pipLocationIp', LocationIp);
}