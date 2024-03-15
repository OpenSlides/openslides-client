import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConnectionStatusService } from 'src/app/site/services/connection-status.service';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';
import { SpinnerComponent } from 'src/app/ui/modules/spinner/components/spinner/spinner.component';

import { UpdateService } from '../../../site-wrapper/services/update.service';

@Component({
    selector: `os-global-spinner`,
    templateUrl: `./global-spinner.component.html`,
    styleUrls: [`./global-spinner.component.scss`]
})
export class GlobalSpinnerComponent extends SpinnerComponent {
    @Input()
    public spinnerConfig: { text?: string };

    public displayDetailedInformation = false;
    public isOperatorReady = false;

    public get spinnerText(): string {
        const errorText = [];
        if (this.displayDetailedInformation) {
            if (this.connectionStatusService.isOffline()) {
                errorText.push(
                    this.translate.instant(
                        `There seems to be a problem connecting to our services. Check your connection or try again later.`
                    )
                );
                if (this.connectionStatusService.getReason()) {
                    errorText.push(this.connectionStatusService.getReason());
                }
            } else if (this.updateService.updateAvailable) {
                errorText.push(this.translate.instant(`Application update in progress.`));
            }
        }

        return errorText.join(`\n`) || this.spinnerConfig?.text;
    }

    public constructor(
        private lifecycleService: LifecycleService,
        private connectionStatusService: ConnectionStatusService,
        private translate: TranslateService,
        private updateService: UpdateService
    ) {
        super();

        this.lifecycleService.booted.then(() => {
            setTimeout(() => {
                this.displayDetailedInformation = true;
            }, 10000);
        });
    }
}
