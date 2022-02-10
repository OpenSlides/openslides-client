import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { MemberService } from 'app/core/core-services/member.service';
import { getOmlVerboseName, OML } from 'app/core/core-services/organization-permission';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { MemberFilterService } from 'app/management/services/member-filter.service';
import { MemberSortService } from 'app/management/services/member-sort.service';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { memberHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';
import { ViewUser } from 'app/site/users/models/view-user';

import { ORGANIZATION_ID } from '../../../core/core-services/organization.service';
import { OMLMapping } from '../../../core/core-services/organization-permission';
import { ViewOrganization } from '../../models/view-organization';

@Component({
    selector: `os-members`,
    templateUrl: `./member-list.component.html`,
    styleUrls: [`./member-list.component.scss`]
})
export class MemberListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    public readonly OML = OML;

    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `short_name`,
            width: `50%`
        },
        {
            prop: `info`,
            width: `50%`
        },
        {
            prop: `is_active`,
            width: `100px`
        }
    ];

    public constructor(
        public repo: UserRepositoryService,
        private meetingRepo: MeetingRepositoryService,
        protected componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private memberService: MemberService,
        private router: Router,
        private route: ActivatedRoute,
        private choiceService: ChoiceService,
        public readonly filterService: MemberFilterService,
        public readonly sortService: MemberSortService,
        private csvExportService: CsvExportService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Accounts`);
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.loadUsers();
        this.loadMeetings();
    }

    public createNewMember(): void {
        this.router.navigate([`create`], { relativeTo: this.route });
    }

    public navigateToMember(member: ViewUser): void {
        this.router.navigate([member.id, `edit`], { relativeTo: this.route });
    }

    public async deleteSelected(members: ViewUser[] = this.selectedRows): Promise<void> {
        await this.memberService.delete(members);
    }

    public async assignMeetingToUsers(): Promise<void> {
        const content = this.translate.instant(
            `This will add or remove the selected accounts to the following meeting:`
        );
        const ADD = _(`Add`);
        const REMOVE = _(`Remove`);
        const choices = [ADD, REMOVE];
        const meetingList = this.meetingRepo.getViewModelList();
        const selectedChoice = await this.choiceService.open(content, meetingList, false, choices);
        if (selectedChoice) {
            /**
             * TODO: would be nice if the couce service could return the
             * selected view models and not just the numbers
             */
            const selectedMeeting = meetingList.find(meeting => {
                return (selectedChoice.items as number) === meeting.id;
            });
            if (selectedChoice.action === ADD) {
                this.repo.bulkAddUserToMeeting(this.selectedRows, selectedMeeting);
            } else {
                this.repo.bulkRemoveUserFromMeeting(this.selectedRows, selectedMeeting);
            }
        }
    }

    public csvExportMemberList(): void {
        this.csvExportService.export(
            this.dataSource.filteredData,
            Object.entries(memberHeadersAndVerboseNames).map(([key, value]) => ({
                property: key as keyof ViewUser,
                label: value
            })),
            `${this.translate.instant(`Accounts`)}.csv`
        );
    }

    public getOmlByUser(user: ViewUser): string {
        return getOmlVerboseName(user.organization_management_level as keyof OMLMapping);
    }

    private async loadMeetings(): Promise<void> {
        await this.subscribe(
            {
                viewModelCtor: ViewOrganization,
                ids: [ORGANIZATION_ID],
                follow: [
                    {
                        idField: `committee_ids`,
                        fieldset: ``,
                        follow: [
                            {
                                idField: `meeting_ids`,
                                fieldset: ``,
                                follow: [
                                    { idField: `user_ids`, fieldset: `shortName` },
                                    { idField: `default_group_id` }
                                ]
                            }
                        ]
                    }
                ]
            },
            `load_meetings`
        );
    }

    private async loadUsers(start_index: number = 0, entries: number = 10000): Promise<void> {
        try {
            const request = await this.memberService.getAllOrgaUsersModelRequest(start_index, entries);
            this.subscribe(request, `load_users`);
        } catch (e) {
            console.log(`Error:`, e);
        }
    }
}
