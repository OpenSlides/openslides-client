import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'app/site/base/components/base.component';

import { OrganizationRepositoryService } from '../../../../core/repositories/management/organization-repository.service';
import { ComponentServiceCollector } from '../../../../core/ui-services/component-service-collector';

@Component({
    selector: `os-info`,
    templateUrl: `./info.component.html`,
    styleUrls: [`./info.component.scss`]
})
export class InfoComponent extends BaseComponent implements OnInit {
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private orgaRepo: OrganizationRepositoryService
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
