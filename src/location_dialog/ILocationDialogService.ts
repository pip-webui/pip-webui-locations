import { LocationDialogParams } from './LocationDialogParams';

export interface ILocationDialogService {
    show(params: LocationDialogParams, successCallback?, cancelCallback?): void;
}