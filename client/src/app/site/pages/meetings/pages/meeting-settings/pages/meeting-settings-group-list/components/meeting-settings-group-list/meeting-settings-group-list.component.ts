import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { MeetingSettingsDefinitionService } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';
import {
    SettingsGroup,
    SKIPPED_SETTINGS
} from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definitions';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
    selector: `os-meeting-settings-group-list`,
    templateUrl: `./meeting-settings-group-list.component.html`,
    styleUrls: [`./meeting-settings-group-list.component.scss`]
})
export class MeetingSettingsGroupListComponent extends BaseMeetingComponent {
    public groups: SettingsGroup[] = [];

    public constructor(
        protected override translate: TranslateService,
        private promptDialog: PromptService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionService,
        private meetingRepo: MeetingControllerService
    ) {
        super();

        this.groups = this.meetingSettingsDefinitionProvider.settings;
    }

    /**
     * Resets every config for all registered group.
     */
    public async resetAll(): Promise<void> {
        const title = this.translate.instant([
            `Are you sure you want to reset all options to default settings?`,
            `Changes of all settings group will be lost!`
        ]);
        if (await this.promptDialog.open(title)) {
            await this.meetingRepo.update(this.getDefaultValues(), { meeting: this.activeMeeting! });
        }
    }

    private getDefaultValues(): any {
        const payload: any = {};
        for (const settingGroup of this.meetingSettingsDefinitionProvider.getSettingsKeys()) {
            if (!SKIPPED_SETTINGS.includes(settingGroup)) {
                payload[settingGroup] = this.meetingSettingsDefinitionProvider.getDefaultValue(settingGroup);
            }
        }
        return payload;
    }

    protected onEnter(route: string): void {
        route = this.activeMeetingId + `/settings/` + route.toLowerCase();
        this.router.navigate([route]);
    }
}
