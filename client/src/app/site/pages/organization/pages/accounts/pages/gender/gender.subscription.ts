import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ORGANIZATION_ID } from '../../../../services/organization.service';
import { ViewOrganization } from '../../../../view-models/view-organization';

export const GENDER_LIST_SUBSCRIPTION = `gender_list`;

export const getGenderListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            {
                idField: `gender_ids`,
                fieldset: [`name`]
            }
        ]
    },
    subscriptionName: GENDER_LIST_SUBSCRIPTION
});
