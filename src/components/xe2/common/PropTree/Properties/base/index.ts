import { Property } from 'xbsj-xe2/dist-node/xe2-base-objects';
import { ComponentInternalInstance } from 'vue';

export type PropertyCompCallbackFuncParamsType = {
    componentInstance: ComponentInternalInstance;
    property: Property, 
    customEventName: string,
    otherParams?: any[],
};