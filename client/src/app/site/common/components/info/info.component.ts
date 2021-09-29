import { Component, OnInit } from '@angular/core';

import { BaseComponent } from 'app/site/base/components/base.component';
import { ComponentServiceCollector } from '../../../../core/ui-services/component-service-collector';
import { OrganizationRepositoryService } from '../../../../core/repositories/management/organization-repository.service';

@Component({
    selector: 'os-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent extends BaseComponent implements OnInit {
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private orgaRepo: OrganizationRepositoryService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.setTitle('Information');
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
