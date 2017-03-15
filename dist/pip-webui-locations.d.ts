declare module pip.locations {



export interface ILocationDialogService {
    show(params: any, successCallback?: any, cancelCallback?: any): void;
}


export class LocationEditDialogController {
    private $scope;
    private $mdDialog;
    private _map;
    private _marker;
    theme: string;
    locationPos: any;
    locationName: any;
    supportSet: boolean;
    constructor($scope: ng.IScope, $rootScope: ng.IRootScopeService, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService, locationPos: any, locationName: string);
    private createMarker(coordinates);
    private changeLocation(coordinates, tid);
    onAddPin(): void;
    onRemovePin(): void;
    onZoomIn(): void;
    onZoomOut(): void;
    onSetLocation: () => void;
    onCancel(): void;
    onApply(): void;
}


let google: any;



}
