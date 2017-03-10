declare module pip.locations {





let google: any;

class LocationDialogService {
    private _$mdDialog;
    constructor($mdDialog: angular.material.IDialogService);
    show(params: any, successCallback: any, cancelCallback: any): void;
}
class LocationEditDialogController {
    private _map;
    private _marker;
    private _$scope;
    private _$mdDialog;
    theme: string;
    locationPos: any;
    locationName: any;
    supportSet: boolean;
    constructor($scope: ng.IScope, $rootScope: ng.IRootScopeService, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService, locationPos: any, locationName: any);
    createMarker(coordinates: any): any;
    changeLocation(coordinates: any, tid: any): void;
    onAddPin(): void;
    onRemovePin(): void;
    onZoomIn(): void;
    onZoomOut(): void;
    onSetLocation: () => void;
    onCancel(): void;
    onApply(): void;
}

}
