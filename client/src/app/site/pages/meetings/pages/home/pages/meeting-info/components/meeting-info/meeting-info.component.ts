import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { OrganizationRepositoryService } from 'src/app/gateways/repositories/organization-repository.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

const INFO_SUBSCRIPTION = `info`;

@Component({
    selector: `os-meeting-info`,
    templateUrl: `./meeting-info.component.html`,
    styleUrls: [`./meeting-info.component.scss`]
})
export class MeetingInfoComponent extends BaseComponent implements OnInit {
    public get canSeeStatistics(): boolean {
        return this.osIsManager || this.operator.hasPerms(Permission.userCanManage);
    }

    private get osIsManager(): boolean {
        return this.operator.isSuperAdmin || this.operator.isOrgaManager;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private orgaRepo: OrganizationRepositoryService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        this.modelRequestService.subscribeTo({
            modelRequest: {
                viewModelCtor: ViewOrganization,
                ids: [ORGANIZATION_ID],
                follow: [
                    {
                        idField: `user_ids`,
                        fieldset: [],
                        follow: [
                            {
                                idField: `meeting_user_ids`,
                                fieldset: `groups`,
                                follow: [{ idField: `group_ids`, fieldset: [`name`, `meeting_id`] }]
                            }
                        ]
                    }
                ]
            },
            subscriptionName: INFO_SUBSCRIPTION
        });
    }

    public ngOnInit(): void {
        super.setTitle(`Legal notice`);
    }

    public async updateLegalNotice(text: string | null): Promise<void> {
        if (text) {
            await this.orgaRepo.update({ legal_notice: text });
        }
    }

    public async updatePrivacyPolicy(text: string | null): Promise<void> {
        if (text) {
            await this.orgaRepo.update({ privacy_policy: text });
        }
    }
}
