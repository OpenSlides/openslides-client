import { SimplifiedModelRequest } from '../core-services/model-request-builder.service';

export interface ModelRequestRepository {
    getRequestToGetAllModels(): SimplifiedModelRequest;
}
