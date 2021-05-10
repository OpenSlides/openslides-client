import { Component } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsDefinitionProvider } from 'app/core/ui-services/meeting-settings-definition-provider.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { SettingsGroup } from '../../../../core/repositories/management/meeting-settings-definition';

/**
 * List view for the global settings
 */
@Component({
    selector: 'os-meeting-settings-overview',
    templateUrl: './meeting-settings-overview.component.html',
    styleUrls: ['./meeting-settings-overview.component.scss']
})
export class MeetingSettingsOverviewComponent extends BaseComponent {
    public groups: SettingsGroup[] = [];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private promptDialog: PromptService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionProvider
    ) {
        super(componentServiceCollector);

        this.groups = this.meetingSettingsDefinitionProvider.getSettings();
    }

    /**
     * Resets every config for all registered group.
     */
    public async resetAll(): Promise<void> {
        /*const title = this.translate.instant(
            'Are you sure you want to reset all options to factory defaults?
            Changes of all settings group will be lost!'
        );
        if (await this.promptDialog.open(title)) {
            await this.repo.resetGroups(this.groups);
        }*/
    }
}
