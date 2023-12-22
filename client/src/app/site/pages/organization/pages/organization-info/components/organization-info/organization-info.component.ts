import { Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OrganizationControllerService } from 'src/app/site/pages/organization/services/organization-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-organization-info`,
    templateUrl: `./organization-info.component.html`,
    styleUrls: [`./organization-info.component.scss`]
})
export class OrganizationInfoComponent extends BaseComponent implements OnInit {
    public get osIsManager(): boolean {
        return this.operator.isSuperAdmin || this.operator.isOrgaManager;
    }

    public get canSeeStatistics(): boolean {
        return this.osIsManager || this.operator.hasPerms(Permission.userCanManage);
    }

    protected override translate = inject(TranslateService);
    private orgaRepo = inject(OrganizationControllerService);
    private operator = inject(OperatorService);

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
