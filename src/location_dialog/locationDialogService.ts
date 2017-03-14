import {
    LocationEditDialogController
} from './locationDialog';

{
    class LocationDialogService {
        constructor(
            private $mdDialog: angular.material.IDialogService
        ) {}

        public show(params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                    controller: LocationEditDialogController,
                    controllerAs: '$ctrl',
                    templateUrl: 'location_dialog/locationDialog.html',
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

    angular.module('pipLocationEditDialog')
        .service('pipLocationEditDialog', LocationDialogService);
}