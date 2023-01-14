import { Component } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CheckDatabasePresenterService } from 'src/app/gateways/presenter/check-database-presenter.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

@Component({
    selector: `os-info-actions`,
    templateUrl: `./info-actions.component.html`,
    styleUrls: [`./info-actions.component.scss`]
})
export class InfoActionsComponent extends BaseComponent {
    constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        private lifecycleService: LifecycleService,
        private snackbar: MatSnackBar,
        private presenter: CheckDatabasePresenterService,
        protected override translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
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
            console.warn(response.errors);
        }
    }
}
