declare module pip.locations {



class LocationDialogService {
    private _$mdDialog;
    constructor($mdDialog: angular.material.IDialogService);
    show(params: any, successCallback: any, cancelCallback: any): void;
}
class LocationEditDialogController {
    private _map;
    private _marker;
    theme: string;
    locationPos: any;
    locationName: any;
    supportSet: boolean;
    constructor($scope: ng.IScope, $rootScope: ng.IRootScopeService, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService, locationPos: any, locationName: any);
}


let google: any;


}
