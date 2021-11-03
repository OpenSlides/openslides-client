import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewOrganization } from 'app/management/models/view-organization';
import { CommitteeFilterService } from 'app/management/services/committee-filter.service';
import { CommitteeSortService } from 'app/management/services/committee-sort.service';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';

import { Follow } from '../../../core/core-services/model-request-builder.service';
import { CommitteeExportService } from '../../services/committee-export.service';

const getCommitteesModelRequest = (fellowship?: Follow) => {
    const FOLLOW: Follow[] = [
        {
            idField: `user_ids`,
            fieldset: `committeeList`
        },
        {
            idField: `organization_tag_ids`
        }
    ];
    if (fellowship) {
        FOLLOW.push(fellowship);
    }

    return {
        viewModelCtor: ViewOrganization,
        ids: [1],
        follow: [
            {
                idField: `committee_ids`,
                fieldset: `list`,
                follow: FOLLOW
            }
        ],
        fieldset: []
    };
};

@Component({
    selector: `os-committees`,
    templateUrl: `./committee-list.component.html`,
    styleUrls: [`./committee-list.component.scss`]
})
export class CommitteeListComponent extends BaseListViewComponent<ViewCommittee> implements OnInit {
    public readonly CML = CML;
    public readonly OML = OML;

    public readonly tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `name`,
            minWidth: 250,
            width: `100%`
        },
        {
            prop: `forwarding`,
            width: `70px`
        },
        {
            prop: `meta`,
            width: `70px`
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public repo: CommitteeRepositoryService,
        public operator: OperatorService,
        public filterService: CommitteeFilterService,
        public sortService: CommitteeSortService,
        private csvService: CommitteeExportService,
        private router: Router,
        private route: ActivatedRoute,
        private promptService: PromptService,
        private choiceService: ChoiceService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Committees`);
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
    }

    public editSingle(committee: ViewCommittee): void {
        this.router.navigate([committee.id, `edit-committee`], { relativeTo: this.route });
    }

    public createNewCommittee(): void {
        this.router.navigate([`create`], { relativeTo: this.route });
    }

    public async forwardToCommittees(): Promise<void> {
        const content = this.translate.instant(`Set or remove motion forwarding from the selected committees to:`);
        const ADD = _(`Set forward`);
        const REMOVE = _(`Remove forward`);
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(content, this.repo.getViewModelList(), true, choices);
        if (selectedChoice) {
            if (selectedChoice.action === ADD) {
                this.repo.bulkForwardToCommittees(this.selectedRows, selectedChoice.items as number[]);
            } else {
                this.repo.bulkUnforwardToCommittees(this.selectedRows, selectedChoice.items as number[]);
            }
        }
    }

    public async deleteSingle(committee: ViewCommittee): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this committee?`);
        const content = committee.name;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.repo.delete(committee);
        }
    }

    public async deleteMultiple(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete all selected committees?`);

        const confirmed = await this.promptService.open(title);
        if (confirmed) {
            await this.repo.delete(...this.selectedRows);
        }
    }

    public async exportAsCsv(): Promise<void> {
        await this.getCommitteeMeetings();
        const committeesToExport = this.selectedRows.length ? this.selectedRows : this.repo.getViewModelList();
        this.csvService.export(committeesToExport);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return getCommitteesModelRequest();
    }

    private async getCommitteeMeetings(): Promise<void> {
        await this.getModelChanges(
            getCommitteesModelRequest({
                idField: `meeting_ids`,
                additionalFields: [`name`, `start_time`, `end_time`],
                fieldset: ``
            })
        );
    }
}
