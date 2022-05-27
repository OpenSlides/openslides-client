import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';
import { VotingPrivacyWarningDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { GroupControllerService } from '../../../../../participants';

@Component({
    selector: `os-motion-poll-form`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MotionPollFormComponent extends BasePollFormComponent {
    public get hideSelects(): PollFormHideSelectsData {
        return {};
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
