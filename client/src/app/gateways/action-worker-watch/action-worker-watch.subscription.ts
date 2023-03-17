import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewActionWorker } from '../repositories/action-worker/view-action-worker';

export const ACTION_WORKER_SUBSCRIPTION = `action_worker_detail`;

export const getActionWorkerSubscriptionConfig: SubscriptionConfigGenerator = (ids: Id[]) => ({
    modelRequest: {
        viewModelCtor: ViewActionWorker,
        ids: ids,
        fieldset: DEFAULT_FIELDSET
    },
    subscriptionName: ACTION_WORKER_SUBSCRIPTION
});
