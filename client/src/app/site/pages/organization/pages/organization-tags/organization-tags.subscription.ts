import { SubscriptionConfigGenerator } from '@app/domain/interfaces/subscription-config';
import { ORGANIZATION_ID } from '@app/site/pages/organization/services/organization.service';
import { ViewOrganization } from '@app/site/pages/organization/view-models/view-organization';

export const ORGANIZATION_TAG_LIST_SUBSCRIPTION = `organization_tag_list`;

export const getOrganizationTagListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    subscriptionName: ORGANIZATION_TAG_LIST_SUBSCRIPTION,
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [{ idField: `organization_tag_ids`, fieldset: [`color`, `name`] }]
    }
});
