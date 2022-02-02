import { SimplifiedModelRequest } from '../core-services/model-request-builder.service';

export function isModelRequestRepository(instance: any): instance is ModelRequestRepository {
    return !!instance && typeof (instance as ModelRequestRepository).getRequestToGetAllModels === `function`;
}

export interface ModelRequestRepository {
    getRequestToGetAllModels(): SimplifiedModelRequest;
}
