import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';
import { VotingPrivacyWarningDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

@Component({
    selector: `os-topic-poll-form`,
    templateUrl: `../../../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class TopicPollFormComponent extends BasePollFormComponent {
    public get hideSelects(): PollFormHideSelectsData {
        return {
            type: true,
            pollMethod: true,
            globalOptions: true,
            hundredPercentBase: true,
            backendDuration: true
        };
    }

    constructor(
        fb: FormBuilder,
        groupRepo: GroupControllerService,
        dialog: VotingPrivacyWarningDialogService,
        meetingSettingService: MeetingSettingsService
    ) {
        super(fb, groupRepo, dialog, meetingSettingService);
    }
}
