import { Id } from '@app/domain/definitions/key-types';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { SimplifiedModelRequest } from '@app/site/services/model-request-builder';

export interface SubscriptionConfig<M extends BaseViewModel> {
    modelRequest: SimplifiedModelRequest<M>;
    subscriptionName: string;
}

export type SubscriptionConfigGenerator<M extends BaseViewModel = any> = (...ids: Id[]) => SubscriptionConfig<M>;
