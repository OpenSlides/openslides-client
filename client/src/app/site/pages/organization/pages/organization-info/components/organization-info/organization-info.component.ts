import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OrganizationControllerService } from 'src/app/site/pages/organization/services/organization-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-organization-info`,
    templateUrl: `./organization-info.component.html`,
    styleUrls: [`./organization-info.component.scss`],
    standalone: false
})
export class OrganizationInfoComponent extends BaseComponent implements OnInit {
    public get isManager(): boolean {
        return this.operator.isSuperAdmin || this.operator.isOrgaManager;
    }

    public constructor(
        protected override translate: TranslateService,
        private orgaRepo: OrganizationControllerService,
        private operator: OperatorService
    ) {
        super();
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
