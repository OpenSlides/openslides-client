import { Component, OnInit } from '@angular/core';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent extends BaseComponent implements OnInit {
    /**
     * Whether the component is in editing-mode.
     */
    public isEditing = false;

    /**
     * Holds the current privacy-policy.
     */
    public privacyProlicy = '';

    /**
     * Constructor.
     *
     * @param titleService
     * @param translate
     * @param configRepo
     */
    public constructor(componentServiceCollector: ComponentServiceCollector, private operator: OperatorService) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.setTitle(this.translate.instant('Privacy policy'));
    }

    /**
     * Saves changes.
     */
    public saveChanges(): void {
        /*this.configRepo
            .bulkUpdate([{ key: 'general_event_privacy_policy', value: this.privacyProlicy }])
            .then(() => (this.isEditing = !this.isEditing), this.raiseError);*/
        throw new Error('TODO');
    }

    /**
     * Returns, if the current user has the necessary permissions.
     */
    public canManage(): boolean {
        return this.operator.hasPerms('core.can_manage_config');
    }
}
