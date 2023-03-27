import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

export const THEME_LIST_SUBSCRIPTION = `theme_list`;

export const getDesignListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [{ idField: `theme_ids`, fieldset: DEFAULT_FIELDSET }]
    },
    subscriptionName: THEME_LIST_SUBSCRIPTION
});
