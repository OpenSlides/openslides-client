import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { DuplicateStatus, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { GenderControllerService } from '../../pages/gender/services/gender-controller.service';

type Email = string;
type Name = string;

@Injectable({
    providedIn: `root`
})
export class AccountFilterService extends BaseFilterListService<ViewUser> {
    protected storageKey = `MemberList`;

    private meetingSubscription: Subscription;
    private userEmailMap = new Map<Email, Id[]>();
    private userNameMap = new Map<Name, Id[]>();
    private userInMeetingMap = new Map<Id, void>();

    private genderFilterOption: OsFilter<ViewUser> = {
        property: `gender_id`,
        label: _(`Gender`),
        options: []
    };

    /**
     * @return Observable data for the filtered output subject
     */
    public override get outputObservable(): Observable<ViewUser[]> {
        return super.outputObservable.pipe(
            map(output => {
                if (this.meetingSubscription) {
                    return output.filter(m => this.userInMeetingMap.has(m.id));
                }

                return output;
            })
        );
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return super.getViewModelListObservable().pipe(
            map(output => {
                if (this.meetingSubscription) {
                    return output.filter(m => this.userInMeetingMap.has(m.id));
                }

                return output;
            })
        );
    }

    public constructor(
        store: ActiveFiltersService,
        private operator: OperatorService,
        private controller: UserControllerService,
        private meetingRepo: MeetingControllerService,
        private genderRepo: GenderControllerService
    ) {
        super(store);

        this.controller.getViewModelListObservable().subscribe(users => {
            this.updateUserMaps(users);
        });
        this.updateFilterForRepo({
            repo: genderRepo,
            filter: this.genderFilterOption,
            noneOptionLabel: _(`not specified`)
        });
    }

    public filterMeeting(id: Id): void {
        if (this.meetingSubscription) {
            this.meetingSubscription.unsubscribe();
            this.meetingSubscription = null;
        }

        if (id) {
            this.meetingSubscription = this.meetingRepo.getViewModelObservable(id).subscribe(meeting => {
                this.userInMeetingMap.clear();
                if (meeting && meeting.user_ids) {
                    for (const id of meeting.user_ids) {
                        this.userInMeetingMap.set(id);
                    }
                }
            });
        }
    }

    private updateUserMaps(users: ViewUser[]): void {
        this.userEmailMap.clear();
        this.userNameMap.clear();
        for (const user of users) {
            this.userEmailMap.set(user.email, (this.userEmailMap.get(user.email) ?? []).concat(user.id));
            this.userNameMap.set(user.getName(), (this.userNameMap.get(user.getName()) ?? []).concat(user.id));
        }
    }

    protected getFilterDefinitions(): OsFilter<ViewUser>[] {
        const nonStaticFilterDefinitions = [
            ...((this.operator.hasOrganizationPermissions(OML.can_manage_organization)
                ? [
                      {
                          property: `isInActiveMeeting`,
                          label: _(`Active meetings`),
                          options: [
                              { condition: true, label: _(`Is in active meetings`) },
                              { condition: [false, null], label: _(`Is not in active meetings`) }
                          ]
                      },
                      {
                          property: `isInArchivedMeeting`,
                          label: _(`Archived meetings`),
                          options: [
                              { condition: true, label: _(`Is in archived meetings`) },
                              { condition: [false, null], label: _(`Is not in archived meetings`) }
                          ]
                      }
                  ]
                : []) as OsFilter<ViewUser>[])
        ];
        const staticFilterDefinitions: OsFilter<ViewUser>[] = [
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
                label: _(`Natural person`),
                options: [
                    { condition: true, label: _(`Is a natural person`) },
                    { condition: [false, null], label: _(`Is no natural person`) }
                ]
            },
            this.genderFilterOption,
            {
                property: `hasEmail`,
                label: _(`Email address`),
                options: [
                    { condition: true, label: _(`Has an email address`) },
                    { condition: [false, null], label: _(`Has no email address`) }
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
                property: `isLastLogin`,
                label: _(`Last login`),
                options: [
                    { condition: true, label: _(`Has logged in`) },
                    { condition: [false, null], label: _(`Has not logged in yet`) }
                ]
            },
            {
                property: `organization_management_level`,
                label: _(`Administration roles`),
                options: [
                    { condition: `superadmin`, label: _(`Superadmin`) },
                    { condition: `can_manage_organization`, label: _(`Organization admin`) },
                    { condition: `can_manage_users`, label: _(`Account admin`) },
                    { condition: null, label: _(`No admin role`) }
                ]
            },
            {
                property: `isCommitteeManager`,
                label: _(`Committee admin`),
                options: [
                    { condition: true, label: _(`Is committee admin`) },
                    { condition: [false, null], label: _(`No committee admin`) }
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
                property: `hasSamlId`,
                label: _(`SSO`),
                options: [
                    { condition: true, label: _(`Has SSO identification`) },
                    { condition: [false, null], label: _(`Has no SSO identification`) }
                ]
            },
            {
                property: `getDuplicateStatusInMap`,
                label: _(`Duplicates`),
                options: [
                    {
                        condition: [DuplicateStatus.All, DuplicateStatus.SameName],
                        label: _(`Same given and surname`)
                    },
                    {
                        condition: [DuplicateStatus.All, DuplicateStatus.SameEmail],
                        label: _(`Same email`)
                    }
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
                property: `hasHomeCommittee`,
                label: _(`Home committee`),
                options: [
                    { condition: true, label: _(`Has a home committee`) },
                    { condition: [false, null], label: _(`Has no home committee`) }
                ]
            },
            {
                property: `external`,
                label: _(`External`),
                options: [
                    { condition: true, label: _(`Is external`) },
                    { condition: [false, null], label: _(`Is not external`) }
                ]
            }
        ];
        return staticFilterDefinitions.concat(nonStaticFilterDefinitions);
    }

    protected override getFilterPropertyFunctionArguments(property: keyof ViewUser): any[] {
        if (property === `getDuplicateStatusInMap`) {
            return [{ name: this.userNameMap, email: this.userEmailMap }];
        }
        return [];
    }
}
