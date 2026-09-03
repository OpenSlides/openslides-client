import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/site/base/base.component';
import { OrganizationControllerService } from '@app/site/pages/organization/services/organization-controller.service';
import { OperatorService } from '@app/site/services/operator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: `os-organization-info`,
    templateUrl: `./organization-info.component.html`,
    styleUrls: [`./organization-info.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
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
