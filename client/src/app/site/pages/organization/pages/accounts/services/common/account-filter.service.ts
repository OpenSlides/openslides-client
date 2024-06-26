import { Injectable } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { DuplicateStatus, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

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

    /**
     * @return Observable data for the filtered output subject
     */
    public override get outputObservable(): Observable<ViewUser[]> {
        return super.outputObservable.pipe(
            map(output => {
                if (this.meetingSubscription) {
                    const newOutput = [];
                    for (const i in output) {
                        if (this.userInMeetingMap.has(output[i].id)) {
                            newOutput.push(output[i]);
                        }
                    }
                    return newOutput;
                }

                return output;
            })
        );
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return super.getViewModelListObservable().pipe(
            map(output => {
                if (this.meetingSubscription) {
                    const newOutput = [];
                    for (const i in output) {
                        if (this.userInMeetingMap.has(output[i].id)) {
                            newOutput.push(output[i]);
                        }
                    }
                    return newOutput;
                }

                return output;
            })
        );
    }

    public constructor(
        store: ActiveFiltersService,
        private operator: OperatorService,
        private controller: UserControllerService,
        private meetingRepo: MeetingControllerService
    ) {
        super(store);

        this.controller.getViewModelListObservable().subscribe(users => {
            this.updateUserMaps(users);
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
                          label: `Active meetings`,
                          options: [
                              { condition: true, label: `Is in active meetings` },
                              { condition: [false, null], label: `Is not in active meetings` }
                          ]
                      },
                      {
                          property: `isInArchivedMeeting`,
                          label: `Archived meetings`,
                          options: [
                              { condition: true, label: `Is in archived meetings` },
                              { condition: [false, null], label: `Is not in archived meetings` }
                          ]
                      }
                  ]
                : []) as OsFilter<ViewUser>[])
        ];
        const staticFilterDefinitions: OsFilter<ViewUser>[] = [
            {
                property: `is_active`,
                label: `Active`,
                options: [
                    { condition: true, label: `Is active` },
                    { condition: [false, null], label: `Is not active` }
                ]
            },
            {
                property: `is_physical_person`,
                label: `Natural person`,
                options: [
                    { condition: true, label: `Is a natural person` },
                    { condition: [false, null], label: `Is no natural person` }
                ]
            },
            {
                property: `gender`,
                label: `Gender`,
                options: [
                    { condition: `female`, label: `female` },
                    { condition: `male`, label: `male` },
                    { condition: `diverse`, label: `diverse` },
                    { condition: `non-binary`, label: `non-binary` },
                    { condition: null, label: `not specified` }
                ]
            },
            {
                property: `hasEmail`,
                label: `Email address`,
                options: [
                    { condition: true, label: `Has an email address` },
                    { condition: [false, null], label: `Has no email address` }
                ]
            },
            {
                property: `isLastEmailSent`,
                label: `Last email sent`,
                options: [
                    { condition: true, label: `Got an email` },
                    { condition: [false, null], label: `Didn't get an email` }
                ]
            },
            {
                property: `isLastLogin`,
                label: `Last login`,
                options: [
                    { condition: true, label: `Has logged in` },
                    { condition: [false, null], label: `Has not logged in yet` }
                ]
            },
            {
                property: `organization_management_level`,
                label: `Administration roles`,
                options: [
                    { condition: `superadmin`, label: `Superadmin` },
                    { condition: `can_manage_organization`, label: `Organization admin` },
                    { condition: `can_manage_users`, label: `Account admin` },
                    { condition: null, label: `No admin role` }
                ]
            },
            {
                property: `isCommitteeManager`,
                label: `Committee admin`,
                options: [
                    { condition: true, label: `Is committee admin` },
                    { condition: [false, null], label: `No committee admin` }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: `Vote weight`,
                options: [
                    { condition: [false, null], label: `Has changed vote weight` },
                    { condition: true, label: `Has unchanged vote weight` }
                ]
            },
            {
                property: `hasSamlId`,
                label: `SSO`,
                options: [
                    { condition: true, label: `Has SSO identification` },
                    { condition: [false, null], label: `Has no SSO identification` }
                ]
            },
            {
                property: `getDuplicateStatusInMap`,
                label: `Duplicates`,
                options: [
                    {
                        condition: [DuplicateStatus.All, DuplicateStatus.SameName],
                        label: `Same first/last name`
                    },
                    {
                        condition: [DuplicateStatus.All, DuplicateStatus.SameEmail],
                        label: `Same email`
                    }
                ]
            },
            {
                property: `hasMemberNumber`,
                label: `Membership number`,
                options: [
                    { condition: true, label: `Has a membership number` },
                    { condition: [false, null], label: `Has no membership number` }
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
