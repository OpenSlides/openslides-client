import { Id } from 'src/app/domain/definitions/key-types';
import { SimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

export interface SubscriptionConfig {
    modelRequest: SimplifiedModelRequest;
    subscriptionName: string;
}

export type SubscriptionConfigGenerator = (ids: Id[] | Id) => SubscriptionConfig;
