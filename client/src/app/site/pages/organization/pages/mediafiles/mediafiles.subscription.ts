import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ORGANIZATION_ID } from '../../services/organization.service';
import { ViewOrganization } from '../../view-models/view-organization';

export const ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION = `organization_mediafile_list`;

export const getOrganizationMediafileListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    subscriptionName: ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION,
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [{ idField: `mediafile_ids`, fieldset: `organizationDetail` }]
    }
});
