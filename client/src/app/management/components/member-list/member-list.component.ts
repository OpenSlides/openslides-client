import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PblColumnDefinition } from '@pebula/ngrid';

import { MemberService } from 'app/core/core-services/member.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/event-management/committee-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-members',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'short_name',
            width: 'auto'
        },
        {
            prop: 'info',
            width: '65%'
        }
    ];

    public constructor(
        public repo: UserRepositoryService,
        private committeeRepo: CommitteeRepositoryService,
        protected componentServiceCollector: ComponentServiceCollector,
        private memberService: MemberService,
        private router: Router,
        private route: ActivatedRoute,
        private promptService: PromptService,
        private choiceService: ChoiceService
    ) {
        super(componentServiceCollector);
        super.setTitle('Members');
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.loadUsers();
    }

    public createNewMember(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete all selected participants?');
        if (await this.promptService.open(title)) {
            this.repo.bulkDelete(this.selectedRows).catch(this.raiseError);
        }
    }

    public async assignCommitteesToUsers(): Promise<void> {
        const content = this.translate.instant(
            'This will add or remove the following groups for all selected participants:'
        );
        const ADD = _('add committee(s)');
        const REMOVE = _('remove committee(s)');
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(
            content,
            this.committeeRepo.getViewModelList(),
            true,
            choices
        );
        if (selectedChoice) {
            if (selectedChoice.action === ADD) {
                this.repo.bulkAssignUsersToCommitteesAsMembers(
                    this.selectedRows.filter(user => !user.isTemporary),
                    selectedChoice.items as Id[]
                );
            } else {
                this.repo.bulkUnassignUsersFromCommitteesAsMembers(
                    this.selectedRows.filter(user => !user.isTemporary),
                    selectedChoice.items as Id[]
                );
            }
        }
    }

    private async loadUsers(start_index: number = 0, entries: number = 10000): Promise<void> {
        try {
            const userIds = await this.memberService.fetchAllOrgaUsers(start_index, entries);
            const request: SimplifiedModelRequest = {
                viewModelCtor: ViewUser,
                ids: userIds,
                fieldset: 'orga',
                follow: [
                    { idField: 'committee_as_manager_ids' },
                    { idField: 'committee_as_member_ids' },
                    { idField: 'is_present_in_meeting_ids' }
                ]
            };
            this.requestModels(request, 'load_users');
        } catch (e) {
            console.log('Error:', e);
        }
    }
}
