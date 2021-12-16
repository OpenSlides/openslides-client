import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { BaseComponent } from 'app/site/base/components/base.component';

import { OrganizationRepositoryService } from '../../../../core/repositories/management/organization-repository.service';
import { ComponentServiceCollector } from '../../../../core/ui-services/component-service-collector';

@Component({
    selector: `os-info`,
    templateUrl: `./info.component.html`,
    styleUrls: [`./info.component.scss`]
})
export class InfoComponent extends BaseComponent implements OnInit {
    public get osIsManager(): boolean {
        return this.operator.isSuperAdmin || this.operator.isOrgaManager;
    }

    public get canSeeStatistics(): boolean {
        return this.osIsManager || this.operator.hasPerms(Permission.userCanManage);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private orgaRepo: OrganizationRepositoryService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        super.setTitle(`Legal notice`);
    }

    public async updateLegalNotice(text: string): Promise<void> {
        if (text) {
            await this.orgaRepo.update({ legal_notice: text });
        }
    }

    public async updatePrivacyPolicy(text: string): Promise<void> {
        if (text) {
            await this.orgaRepo.update({ privacy_policy: text });
        }
    }
}
