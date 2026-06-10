import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { GENDER_FITLERABLE, GENDERS } from 'src/app/domain/models/users/user';
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
            },
            {
                property: `is_present`,
                label: _(`Presence`),
                options: [
                    { condition: true, label: _(`Is present`) },
                    { condition: [false, null], label: _(`Is not present`) }
                ]
            },
            {
                property: `vote_weight`,
                label: _(`Vote weight`),
                options: [
                    { condition: [false, null], label: _(`Has changed vote weight`) },
                    { condition: true, label: _(`Has unchanged vote weight`) }
                ]
            },
            {
                property: `is_locked_out`,
                label: `Locked out`,
                options: [
                    { condition: true, label: `Is locked out` },
                    { condition: [false, null], label: `Is not locked out` }
                ]
            },
            {
                property: `member_number`,
                label: _(`Membership number`),
                options: [
                    { condition: true, label: _(`Has a membership number`) },
                    { condition: [false, null], label: _(`Has no membership number`) }
                ]
            },
            {
                property: `title`,
                label: _(`Title`),
                options: [
                    { condition: true, label: _(`Has a title`) },
                    { condition: [false, null], label: _(`Has no title`) }
                ]
            },
            {
                property: `saml_id`,
                label: _(`SSO`),
                options: [
                    { condition: true, label: _(`Has SSO identification`) },
                    { condition: [false, null], label: _(`Has no SSO identification`) }
                ]
            },
            {
                property: `gender`,
                label: _(`Gender`),
                options: [
                    { condition: GENDER_FITLERABLE[0], label: GENDERS[0] },
                    { condition: GENDER_FITLERABLE[1], label: GENDERS[1] },
                    { condition: GENDER_FITLERABLE[2], label: GENDERS[2] },
                    { condition: GENDER_FITLERABLE[3], label: GENDERS[3] },
                    { condition: null, label: _(`not specified`) }
                ]
            },
            {
                property: `email`,
                label: _(`Email address`),
                options: [
                    { condition: true, label: _(`Has an email address`) },
                    { condition: [false, null], label: _(`Has no email address`) }
                ]
            },
            {
                property: `pronoun`,
                label: _(`Pronoun`),
                options: [
                    { condition: true, label: _(`Has pronoun`) },
                    { condition: [false, null], label: _(`Has no pronoun`) }
                ]
            },
            {
                property: `username`,
                label: _(`Username`),
                options: [
                    { condition: true, label: _(`Has username`) },
                    { condition: [false, null], label: _(`Has no username`) }
                ]
            },
            {
                property: `home_committee`,
                label: _(`Home committee`),
                options: [
                    { condition: true, label: _(`Has home committee`) },
                    { condition: [false, null], label: _(`Has no home committee`) }
                ]
            },
            {
                property: `groups`,
                label: _(`Username`),
                options: [
                    { condition: true, label: _(`Has groups`) },
                    { condition: [false, null], label: _(`Has no groups`) }
                ]
            }
        ];
        return staticFilterOptions;
    }
}
