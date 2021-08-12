import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PblColumnDefinition } from '@pebula/ngrid';

import { MemberService } from 'app/core/core-services/member.service';
import { OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { MemberFilterService } from 'app/management/services/member-filter.service';
import { MemberSortService } from 'app/management/services/member-sort.service';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { BaseUserHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-members',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    public readonly OML = OML;

    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'short_name',
            width: '50%'
        },
        {
            prop: 'info',
            width: '50%'
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
        private choiceService: ChoiceService,
        public readonly filterService: MemberFilterService,
        public readonly sortService: MemberSortService,
        private csvExportService: CsvExportService
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

    public navigateToMember(member: ViewUser): void {
        this.router.navigate([member.id, 'edit'], { relativeTo: this.route });
    }

    public async deleteSelected(...members: ViewUser[]): Promise<void> {
        const title = this.translate.instant(
            members.length === 1
                ? 'Are you sure you want to delete this member?'
                : 'Are you sure you want to delete all selected participants?'
        );
        if (await this.promptService.open(title)) {
            this.repo.delete(...members).catch(this.raiseError);
        }
    }

    public async assignCommitteesToUsers(): Promise<void> {
        const content = this.translate.instant(
            'This will add or remove the following committees for all selected participants:'
        );
        const ADD = _('Add');
        const REMOVE = _('Remove');
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(
            content,
            this.committeeRepo.getViewModelList(),
            true,
            choices
        );
        if (selectedChoice) {
            if (selectedChoice.action === ADD) {
                this.repo.bulkAssignUsersToCommitteesAsMembers(this.selectedRows, selectedChoice.items as Id[]);
            } else {
                this.repo.bulkUnassignUsersFromCommitteesAsMembers(this.selectedRows, selectedChoice.items as Id[]);
            }
        }
    }

    public csvExportMemberList(): void {
        this.csvExportService.export(
            this.dataSource.filteredData,
            Object.entries(BaseUserHeadersAndVerboseNames).map(([key, value]) => ({
                property: key as keyof ViewUser,
                label: value
            })),
            `${this.translate.instant('Members')}.csv`
        );
    }

    private async loadUsers(start_index: number = 0, entries: number = 10000): Promise<void> {
        try {
            const request = await this.memberService.getAllOrgaUsersModelRequest(start_index, entries);
            this.requestModels(request, 'load_users');
        } catch (e) {
            console.log('Error:', e);
        }
    }
}
