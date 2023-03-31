import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

export const ORGANIZATION_TAG_LIST_SUBSCRIPTION = `organization_tag_list`;

export const getOrganizationTagListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    subscriptionName: ORGANIZATION_TAG_LIST_SUBSCRIPTION,
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [`organization_tag_ids`]
    }
});
