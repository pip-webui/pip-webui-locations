declare module pip.locations {



let google: any;


export interface ILocationDialogService {
    show(params: LocationDialogParams, successCallback?: any, cancelCallback?: any): void;
}



export class LocationDialogParams {
    locationPos: any;
    locationName: string;
}


}
