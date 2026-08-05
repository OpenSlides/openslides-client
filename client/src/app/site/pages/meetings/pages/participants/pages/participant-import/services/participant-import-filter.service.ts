import { Injectable } from '@angular/core';
import { GENDER_FITLERABLE, GENDERS } from '@app/domain/models/users/user';
import { BaseFilterListService, OsFilter } from '@app/site/base/base-filter.service';
import { ActiveFiltersService } from '@app/site/services/active-filters.service';
import { _ } from '@ngx-translate/core';

import { STATE_FITERABLE, STATES, ViewImportedParticipant } from '../view-models/view-participant-import';

@Injectable({
    providedIn: 'root'
})
export class ParticipantImportFilterService extends BaseFilterListService<any> {
    protected storageKey = `participantImportPreview`;
    public constructor(store: ActiveFiltersService) {
        super(store);
    }

    protected getFilterDefinitions(): OsFilter<ViewImportedParticipant>[] {
        return [
            {
                property: 'state',
                label: _('Participant state'),
                options: [
                    { condition: STATE_FITERABLE[0], label: STATES[0] },
                    { condition: STATE_FITERABLE[1], label: STATES[1] },
                    { condition: STATE_FITERABLE[2], label: STATES[2] },
                    { condition: STATE_FITERABLE[3], label: STATES[3] }
                ]
            },
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
                property: `changedVoteWeight`,
                label: _(`Vote weight`),
                options: [
                    { condition: true, label: _(`Has changed vote weight`) },
                    { condition: [false, null], label: _(`Has unchanged vote weight`) }
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
                property: `hasMemberNumber`,
                label: _(`Membership number`),
                options: [
                    { condition: true, label: _(`Has a membership number`) },
                    { condition: [false, null], label: _(`Has no membership number`) }
                ]
            },
            {
                property: `hasTitle`,
                label: _(`Title`),
                options: [
                    { condition: true, label: _(`Has a title`) },
                    { condition: [false, null], label: _(`Has no title`) }
                ]
            },
            {
                property: `hasSamlId`,
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
                property: `hasEmail`,
                label: _(`Email address`),
                options: [
                    { condition: true, label: _(`Has an email address`) },
                    { condition: [false, null], label: _(`Has no email address`) }
                ]
            },
            {
                property: `hasPronoun`,
                label: _(`Pronoun`),
                options: [
                    { condition: true, label: _(`Has pronoun`) },
                    { condition: [false, null], label: _(`Has no pronoun`) }
                ]
            },
            {
                property: `hasUsername`,
                label: _(`Username`),
                options: [
                    { condition: true, label: _(`Has username`) },
                    { condition: [false, null], label: _(`Has no username`) }
                ]
            },
            {
                property: `hasHomeCommittee`,
                label: _(`Home committee`),
                options: [
                    { condition: true, label: _(`Has home committee`) },
                    { condition: [false, null], label: _(`Has no home committee`) }
                ]
            },
            {
                property: `hasGroups`,
                label: _(`Groups`),
                options: [
                    { condition: true, label: _(`Has groups`) },
                    { condition: [false, null], label: _(`Has no groups`) }
                ]
            }
        ];
    }
}
