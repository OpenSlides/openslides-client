import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MeetingAction } from 'app/core/actions/meeting-action';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsDefinitionProvider } from 'app/core/ui-services/meeting-settings-definition-provider.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseComponent } from 'app/site/base/components/base.component';

import { SettingsGroup } from '../../../../core/repositories/management/meeting-settings-definition';

/**
 * List view for the global settings
 */
@Component({
    selector: `os-meeting-settings-overview`,
    templateUrl: `./meeting-settings-overview.component.html`,
    styleUrls: [`./meeting-settings-overview.component.scss`]
})
export class MeetingSettingsOverviewComponent extends BaseComponent {
    public groups: SettingsGroup[] = [];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private promptDialog: PromptService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionProvider,
        private meetingRepo: MeetingRepositoryService,
        private activeMeeting: ActiveMeetingService
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
            await this.meetingRepo.update(this.getDefaultValues(), this.activeMeeting.meeting);
        }
    }

    private getDefaultValues(): Partial<MeetingAction.UpdatePayload> {
        const payload: Partial<MeetingAction.UpdatePayload> = {};
        for (const setting of this.meetingSettingsDefinitionProvider.getSettingsKeys()) {
            payload[setting] = this.meetingSettingsDefinitionProvider.getDefaultValue(setting);
        }
        return payload;
    }
}
