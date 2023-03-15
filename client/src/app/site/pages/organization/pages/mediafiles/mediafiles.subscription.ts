import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';

import { ORGANIZATION_ID } from '../../services/organization.service';
import { ViewOrganization } from '../../view-models/view-organization';

export const ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION = `organization_mediafile_list`;

export const getOrganizationMediafileListSubscriptionConfig = (
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    subscriptionName: ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION,
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [{ idField: `mediafile_ids`, fieldset: `organizationDetail` }]
    },
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !!id))
});
