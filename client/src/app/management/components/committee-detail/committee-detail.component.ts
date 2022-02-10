import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { Observable } from 'rxjs';

const ForwardLabel = _(`Forward motions to`);
const ReceiveLabel = _(`Receive motions from`);
@Component({
    selector: `os-committee-detail`,
    templateUrl: `./committee-detail.component.html`,
    styleUrls: [`./committee-detail.component.scss`]
})
export class CommitteeDetailComponent extends BaseModelContextComponent implements OnInit {
    public forwardLabel = ForwardLabel;
    public receiveLabel = ReceiveLabel;

    public committeeId: number = null;

    public currentCommitteeObservable: Observable<ViewCommittee> = null;

    public get canManageMeetingsInCommittee(): boolean {
        return this.operator.hasCommitteePermissionsNonAdminCheck(this.committeeId, CML.can_manage);
    }

    public get canManageCommittee(): boolean {
        return this.operator.hasCommitteePermissions(this.committeeId, CML.can_manage);
    }

    public get canManageUsers(): boolean {
        return this.operator.hasOrganizationPermissions(OML.can_manage_users);
    }

    public constructor(
        protected componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private operator: OperatorService,
        private committeeRepo: CommitteeRepositoryService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            this.route.params.subscribe(async params => {
                if (params) {
                    this.committeeId = Number(params.committeeId);
                    this.currentCommitteeObservable = this.committeeRepo.getViewModelObservable(this.committeeId);
                }
            })
        );
    }

    public async ngOnInit(): Promise<void> {
        super.ngOnInit();
    }

    public onCreateMeeting(): void {
        this.router.navigate([`create`], { relativeTo: this.route });
    }

    public async onDeleteCommittee(committee: ViewCommittee): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this committee?`);
        const content = committee.name;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.committeeRepo.delete(committee);
            this.router.navigate([`./committees/`]);
        }
    }

    public getMemberAmount(committee: ViewCommittee): number {
        return committee.user_ids?.length || 0;
    }

    public getMeetingsSorted(committee: ViewCommittee): ViewMeeting[] {
        return committee.meetings.sort((a, b) => b.end_time - a.end_time);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewCommittee,
            ids: [this.committeeId],
            follow: [
                { idField: `forward_to_committee_ids` },
                { idField: `receive_forwardings_from_committee_ids` },
                {
                    idField: `meeting_ids`,
                    fieldset: `preview`,
                    follow: [
                        {
                            idField: `organization_tag_ids`
                        }
                    ]
                }
            ],
            fieldset: `list`,
            additionalFields: [`default_meeting_id`]
        };
    }
}
