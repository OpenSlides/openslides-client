import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CheckDatabasePresenterService } from 'src/app/gateways/presenter/check-database-presenter.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

@Component({
    selector: `os-info-actions`,
    templateUrl: `./info-actions.component.html`,
    styleUrls: [`./info-actions.component.scss`]
})
export class InfoActionsComponent extends BaseComponent {
    public constructor(
        private lifecycleService: LifecycleService,
        private snackbar: MatSnackBar,
        private presenter: CheckDatabasePresenterService,
        protected override translate: TranslateService
    ) {
        super();
    }

    public resetCache(): void {
        this.lifecycleService.reset();
    }

    public async checkDatastore(all = false): Promise<void> {
        const response = await this.presenter.call(all);
        if (response.ok) {
            this.snackbar.open(this.translate.instant(`Datastore is ok!`), `Ok`);
        } else {
            this.snackbar.open(this.translate.instant(`Datastore is corrupt! See the console for errors.`), `Ok`);
            console.warn(response.errors);
        }
    }
}
