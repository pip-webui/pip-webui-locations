declare module pip.locations {


export interface ILocationDialogService {
    show(params: LocationDialogParams, successCallback?: any, cancelCallback?: any): void;
}



export class LocationDialogParams {
    locationPos: any;
    locationName: string;
}



let google: any;


}
