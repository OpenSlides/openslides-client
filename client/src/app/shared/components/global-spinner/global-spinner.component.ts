// External imports
import { ChangeDetectorRef, Component, Inject } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { OVERLAY_COMPONENT_DATA } from 'app/core/ui-services/overlay.service';

/**
 * Component for the global spinner.
 */
@Component({
    selector: 'os-global-spinner',
    templateUrl: './global-spinner.component.html',
    styleUrls: ['./global-spinner.component.scss']
})
export class GlobalSpinnerComponent {
    /**
     * Text, which will be shown if the spinner is shown.
     */
    public text: string;

    /**
     * Constructor
     *
     * @param overlayService Reference to the service for this spinner.
     * @param translate Service to get translations for the messages.
     * @param cd Service to manual initiate a change of the UI.
     */
    public constructor(
        protected translate: TranslateService,
        private cd: ChangeDetectorRef,
        @Inject(OVERLAY_COMPONENT_DATA) data: { text: string }
    ) {
        this.text = data?.text || 'Loading data. Please wait ...';
    }
}
