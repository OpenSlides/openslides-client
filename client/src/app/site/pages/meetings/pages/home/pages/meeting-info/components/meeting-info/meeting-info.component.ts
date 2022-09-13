import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { CheckDatabasePresenterService } from 'src/app/gateways/presenter/check-database-presenter.service';
import { OrganizationRepositoryService } from 'src/app/gateways/repositories/organization-repository.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

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
        private operator: OperatorService,
        private lifecycleService: LifecycleService,
        private presenter: CheckDatabasePresenterService,
        private snackbar: MatSnackBar,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, translate);
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

    public resetCache(): void {
        this.lifecycleService.reset();
    }

    public async checkDatastore(all: boolean = false): Promise<void> {
        const response = await this.presenter.call(all);
        if (response.ok) {
            this.snackbar.open(this.translate.instant(`Datastore is ok!`), `Ok`);
        } else {
            this.snackbar.open(this.translate.instant(`Datastore is corrupt! See the console for errors.`), `Ok`);
            console.log(response.errors);
        }
    }
}
