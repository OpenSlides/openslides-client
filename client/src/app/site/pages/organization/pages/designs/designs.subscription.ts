import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

export const THEME_LIST_SUBSCRIPTION = `theme_list`;

export const getDesignListSubscriptionConfig = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [`theme_ids`]
    },
    subscriptionName: THEME_LIST_SUBSCRIPTION
});
