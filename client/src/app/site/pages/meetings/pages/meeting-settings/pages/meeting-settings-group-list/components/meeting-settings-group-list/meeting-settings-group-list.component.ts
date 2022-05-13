import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { MeetingSettingsDefinitionService } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { SettingsGroup } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definitions';

@Component({
    selector: 'os-meeting-settings-group-list',
    templateUrl: './meeting-settings-group-list.component.html',
    styleUrls: ['./meeting-settings-group-list.component.scss']
})
export class MeetingSettingsGroupListComponent extends BaseMeetingComponent {
    public groups: SettingsGroup[] = [];

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private promptDialog: PromptService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionService,
        private meetingRepo: MeetingControllerService
    ) {
        super(componentServiceCollector, translate);

        this.groups = this.meetingSettingsDefinitionProvider.getSettings();
    }

    /**
     * Resets every config for all registered group.
     */
    public async resetAll(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to reset all options to factory defaults?`,
            `Changes of all settings group will be lost!`
        );
        if (await this.promptDialog.open(title)) {
            await this.meetingRepo.update(this.getDefaultValues(), { meeting: this.activeMeeting! });
        }
    }

    private getDefaultValues(): any {
        const payload: any = {};
        for (const setting of this.meetingSettingsDefinitionProvider.getSettingsKeys()) {
            payload[setting] = this.meetingSettingsDefinitionProvider.getDefaultValue(setting);
        }
        return payload;
    }
}
