import { Component, OnInit } from '@angular/core';

import { ConfigRepositoryService } from 'app/core/repositories/config/config-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * List view for the global settings
 */
@Component({
    selector: 'os-settings-overview',
    templateUrl: './settings-overview.component.html',
    styleUrls: ['./settings-overview.component.scss']
})
export class SettingsOverviewComponent extends BaseComponent implements OnInit {
    public groups: string[] = [];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public repo: ConfigRepositoryService,
        private promptDialog: PromptService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Sets the title, inits the table and calls the repo
     */
    public ngOnInit(): void {
        super.setTitle('Settings');

        this.repo.availableGroupsOberservable.subscribe(groups => {
            this.groups = groups;
        });
    }

    /**
     * Resets every config for all registered group.
     */
    public async resetAll(): Promise<void> {
        const title = this.translate.instant(
            'Are you sure you want to reset all options to factory defaults? Changes of all settings group will be lost!'
        );
        if (await this.promptDialog.open(title)) {
            await this.repo.resetGroups(this.groups);
        }
    }
}
