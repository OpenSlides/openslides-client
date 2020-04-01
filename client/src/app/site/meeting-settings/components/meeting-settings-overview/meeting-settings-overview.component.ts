import { Component, OnInit } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * List view for the global settings
 */
@Component({
    selector: 'os-meeting-settings-overview',
    templateUrl: './meeting-settings-overview.component.html',
    styleUrls: ['./meeting-settings-overview.component.scss']
})
export class MeetingSettingsOverviewComponent extends BaseComponent implements OnInit {
    public groups: string[] = [];

    public constructor(componentServiceCollector: ComponentServiceCollector, private promptDialog: PromptService) {
        super(componentServiceCollector);
    }

    /**
     * Sets the title, inits the table and calls the repo
     */
    public ngOnInit(): void {
        super.setTitle('Settings');

        /*this.repo.availableGroupsOberservable.subscribe(groups => {
            this.groups = groups;
        });*/
    }

    /**
     * Resets every config for all registered group.
     */
    public async resetAll(): Promise<void> {
        /*const title = this.translate.instant(
            'Are you sure you want to reset all options to factory defaults? Changes of all settings group will be lost!'
        );
        if (await this.promptDialog.open(title)) {
            await this.repo.resetGroups(this.groups);
        }*/
    }
}
