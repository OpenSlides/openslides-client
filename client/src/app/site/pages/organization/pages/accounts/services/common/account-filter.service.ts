import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
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

    private userEmailMap = new Map<Email, Id[]>();
    private userNameMap = new Map<Name, Id[]>();

    private translate = inject(TranslateService);
    private operator = inject(OperatorService);
    private controller = inject(UserControllerService);

    public constructor(store: ActiveFiltersService) {
        super(store);

        this.controller.getViewModelListObservable().subscribe(users => {
            this.updateUserMaps(users);
        });
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
                          label: this.translate.instant(`Active meetings`),
                          options: [
                              { condition: true, label: this.translate.instant(`Is in active meetings`) },
                              { condition: [false, null], label: this.translate.instant(`Is not in active meetings`) }
                          ]
                      },
                      {
                          property: `isInArchivedMeeting`,
                          label: this.translate.instant(`Archived meetings`),
                          options: [
                              { condition: true, label: this.translate.instant(`Is in archived meetings`) },
                              { condition: [false, null], label: this.translate.instant(`Is not in archived meetings`) }
                          ]
                      }
                  ]
                : []) as OsFilter<ViewUser>[])
        ];
        const staticFilterDefinitions: OsFilter<ViewUser>[] = [
            {
                property: `is_active`,
                label: this.translate.instant(`Active`),
                options: [
                    { condition: true, label: `Is active` },
                    { condition: [false, null], label: this.translate.instant(`Is not active`) }
                ]
            },
            {
                property: `is_physical_person`,
                label: this.translate.instant(`Natural person`),
                options: [
                    { condition: true, label: this.translate.instant(`Is a natural person`) },
                    { condition: [false, null], label: this.translate.instant(`Is no natural person`) }
                ]
            },
            {
                property: `gender`,
                label: this.translate.instant(`Gender`),
                options: [
                    { condition: `female`, label: this.translate.instant(`female`) },
                    { condition: `male`, label: this.translate.instant(`male`) },
                    { condition: `diverse`, label: this.translate.instant(`diverse`) },
                    { condition: `non-binary`, label: this.translate.instant(`non-binary`) },
                    { condition: null, label: this.translate.instant(`unknown`) }
                ]
            },
            {
                property: `hasEmail`,
                label: this.translate.instant(`Email address`),
                options: [
                    { condition: true, label: this.translate.instant(`Has an email address`) },
                    { condition: [false, null], label: this.translate.instant(`Has no email address`) }
                ]
            },
            {
                property: `isLastEmailSent`,
                label: this.translate.instant(`Last email sent`),
                options: [
                    { condition: true, label: this.translate.instant(`Got an email`) },
                    { condition: [false, null], label: this.translate.instant(`Didn't get an email`) }
                ]
            },
            {
                property: `isLastLogin`,
                label: this.translate.instant(`Last login`),
                options: [
                    { condition: true, label: this.translate.instant(`Has logged in`) },
                    { condition: [false, null], label: this.translate.instant(`Has not logged in yet`) }
                ]
            },
            {
                property: `organization_management_level`,
                label: this.translate.instant(`Administration roles`),
                options: [
                    { condition: `superadmin`, label: this.translate.instant(`Superadmin`) },
                    { condition: `can_manage_organization`, label: this.translate.instant(`Organization admin`) },
                    { condition: `can_manage_users`, label: this.translate.instant(`Account admin`) },
                    { condition: null, label: this.translate.instant(`No admin role`) }
                ]
            },
            {
                property: `isCommitteeManager`,
                label: this.translate.instant(`Committee admin`),
                options: [
                    { condition: true, label: this.translate.instant(`Is committee admin`) },
                    { condition: [false, null], label: this.translate.instant(`No committee admin`) }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: this.translate.instant(`Vote weight`),
                options: [
                    { condition: [false, null], label: this.translate.instant(`Has changed vote weight`) },
                    { condition: true, label: this.translate.instant(`Has unchanged vote weight`) }
                ]
            },
            {
                property: `hasSamlId`,
                label: this.translate.instant(`SSO`),
                options: [
                    { condition: true, label: this.translate.instant(`Has SSO identification`) },
                    { condition: [false, null], label: this.translate.instant(`Has no SSO identification`) }
                ]
            },
            {
                property: `getDuplicateStatusInMap`,
                label: this.translate.instant(`Duplicates`),
                options: [
                    {
                        condition: [DuplicateStatus.All, DuplicateStatus.SameName],
                        label: this.translate.instant(`Same first/last name`)
                    },
                    {
                        condition: [DuplicateStatus.All, DuplicateStatus.SameEmail],
                        label: this.translate.instant(`Same email`)
                    }
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
