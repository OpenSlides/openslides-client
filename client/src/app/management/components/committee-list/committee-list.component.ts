import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { CommitteeRepositoryService } from 'app/core/repositories/event-management/committee-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { ViewOrganisation } from 'app/site/event-management/models/view-organisation';

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
        private promptService: PromptService
    ) {
        super(componentServiceCollector);
        super.setTitle('Committees');
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

    public async deleteSingle(committee: ViewCommittee): Promise<void> {
        const title = `${this.translate.instant('Delete committee')} "${committee.name}"`;
        const content = this.translate.instant('Are you sure you want to delete this committee?');

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.repo.delete(committee);
        }
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganisation,
            ids: [1],
            follow: [
                {
                    idField: 'committee_ids',
                    fieldset: 'list',
                    follow: [
                        {
                            idField: 'manager_ids',
                            fieldset: 'shortName'
                        }
                    ]
                }
            ],
            fieldset: []
        };
    }
}
