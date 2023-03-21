import { Id } from 'src/app/domain/definitions/key-types';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { SimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

export interface SubscriptionConfig<M extends BaseViewModel> {
    modelRequest: SimplifiedModelRequest<M>;
    subscriptionName: string;
}

export type SubscriptionConfigGenerator<M extends BaseViewModel = any> = (...ids: Id[]) => SubscriptionConfig<M>;
