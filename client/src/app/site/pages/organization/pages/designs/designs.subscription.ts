import { SubscriptionConfigGenerator } from '@app/domain/interfaces/subscription-config';
import { ORGANIZATION_ID } from '@app/site/pages/organization/services/organization.service';
import { ViewOrganization } from '@app/site/pages/organization/view-models/view-organization';

export const THEME_LIST_SUBSCRIPTION = `theme_list`;

export const getDesignListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            {
                idField: `theme_ids`,
                fieldset: [
                    `accent_500`,
                    `id`,
                    `name`,
                    `organization_id`,
                    `primary_500`,
                    `theme_for_organization_id`,
                    `warn_500`
                ]
            }
        ]
    },
    subscriptionName: THEME_LIST_SUBSCRIPTION
});
