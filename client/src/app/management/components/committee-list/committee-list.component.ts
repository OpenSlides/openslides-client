import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PblColumnDefinition } from '@pebula/ngrid';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewOrganization } from 'app/management/models/view-organization';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';

@Component({
    selector: 'os-committees',
    templateUrl: './committee-list.component.html',
    styleUrls: ['./committee-list.component.scss']
})
export class CommitteeListComponent extends BaseListViewComponent<ViewCommittee> implements OnInit {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'name',
            width: 'auto'
        },
        {
            prop: 'organization_tags',
            width: '250px'
        },
        {
            prop: 'forwarding',
            width: '250px'
        },
        {
            prop: 'meetings',
            width: '70px'
        },
        {
            prop: 'participants',
            width: '70px'
        },
        {
            prop: 'managers',
            width: '200px'
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public repo: CommitteeRepositoryService,
        private router: Router,
        private route: ActivatedRoute,
        private promptService: PromptService,
        private choiceService: ChoiceService
    ) {
        super(componentServiceCollector);
        super.setTitle('Committees');
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
    }

    public editSingle(committee: ViewCommittee): void {
        this.router.navigate([committee.id, 'edit-committee'], { relativeTo: this.route });
    }

    public createNewCommittee(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    public async forwardToCommittees(): Promise<void> {
        const content = this.translate.instant('Set or remove forwarding from the selected committees:');
        const ADD = _('Forward to committee');
        const REMOVE = _('Unforward to committee');
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
        const title = `${this.translate.instant('Delete committee')} "${committee.name}"`;
        const content = this.translate.instant('Are you sure you want to delete this committee?');

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.repo.delete(committee);
        }
    }

    public async deleteMultiple(): Promise<void> {
        const title = this.translate.instant('Are you sure, you want to delete all selected committees?');

        const confirmed = await this.promptService.open(title);
        if (confirmed) {
            await this.repo.bulkDelete(this.selectedRows);
        }
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [1],
            follow: [
                {
                    idField: 'committee_ids',
                    fieldset: 'list',
                    follow: [
                        {
                            idField: 'manager_ids',
                            fieldset: 'shortName'
                        },
                        {
                            idField: 'organization_tag_ids'
                        }
                    ]
                }
            ],
            fieldset: []
        };
    }
}
