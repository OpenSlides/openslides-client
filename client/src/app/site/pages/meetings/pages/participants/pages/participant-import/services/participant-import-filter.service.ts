import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { ViewImportedParticipant } from '../view-models/view-participant-import';

@Injectable({
    providedIn: 'root'
})
export class ParticipantImportFilterService extends BaseFilterListService<any> {
    protected storageKey = `participantImportPreview`;
    public constructor(store: ActiveFiltersService) {
        super(store);
    }

    protected getFilterDefinitions(): OsFilter<ViewImportedParticipant>[] {
        const staticFilterOptions: OsFilter<ViewImportedParticipant>[] = [
            {
                property: `is_active`,
                label: _(`Active`),
                options: [
                    { condition: true, label: _(`Is active`) },
                    { condition: [false, null], label: _(`Is not active`) }
                ]
            },
            {
                property: `is_physical_person`,
                label: _(`Committee`),
                options: [
                    { condition: true, label: _(`Is not a committee`) },
                    { condition: [false, null], label: _(`Is a committee`) }
                ]
            } /* ,{
                property: `is_present`,
                label: _(`Presence`),
                options: [
                    { condition: true, label: _(`Is present`) },
                    { condition: [false, null], label: _(`Is not present`) }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: _(`Vote weight`),
                options: [
                    { condition: [false, null], label: _(`Has changed vote weight`) },
                    { condition: true, label: _(`Has unchanged vote weight`) }
                ]
            },
            {
                property: `isLockedOutOfMeeting`,
                label: `Locked out`,
                options: [
                    { condition: true, label: `Is locked out` },
                    { condition: [false, null], label: `Is not locked out` }
                ]
            },
            {
                property: `hasMemberNumber`,
                label: _(`Membership number`),
                options: [
                    { condition: true, label: _(`Has a membership number`) },
                    { condition: [false, null], label: _(`Has no membership number`) }
                ]
            },
            {
                property: `isLastLogin`,
                label: _(`Last login`),
                options: [
                    { condition: true, label: _(`Has logged in`) },
                    { condition: [false, null], label: _(`Has not logged in yet`) }
                ]
            },
            {
                property: `isLastEmailSent`,
                label: _(`Last email sent`),
                options: [
                    { condition: true, label: _(`Got an email`) },
                    { condition: [false, null], label: _(`Didn't get an email`) }
                ]
            },
            {
                property: `hasEmail`,
                label: _(`Email address`),
                options: [
                    { condition: true, label: _(`Has an email address`) },
                    { condition: [false, null], label: _(`Has no email address`) }
                ]
            },
            {
                property: `hasSamlId`,
                label: _(`SSO`),
                options: [
                    { condition: true, label: _(`Has SSO identification`) },
                    { condition: [false, null], label: _(`Has no SSO identification`) }
                ]
            } */

            /* first_name	last_name	email	member_number	structure_level	groups	number	vote_weight	gender	pronoun	username	default_password	
            is_active	is_physical_person	is_present	locked_out	saml_id	home_committee	external	comment */
        ];
        return staticFilterOptions;
    }
}
