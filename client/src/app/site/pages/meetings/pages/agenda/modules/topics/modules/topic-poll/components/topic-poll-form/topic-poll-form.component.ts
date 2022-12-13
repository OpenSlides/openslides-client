import { Component, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';
import { VotingPrivacyWarningDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

@Component({
    selector: `os-topic-poll-form`,
    templateUrl: `../../../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    providers: [{ provide: BasePollFormComponent, useExisting: TopicPollFormComponent }],
    encapsulation: ViewEncapsulation.None
})
export class TopicPollFormComponent extends BasePollFormComponent {
    public get hideSelects(): PollFormHideSelectsData {
        return {
            pollMethod: true,
            globalOptions: true,
            hundredPercentBase: true,
            backendDuration: true
        };
    }

    constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        fb: UntypedFormBuilder,
        groupRepo: GroupControllerService,
        dialog: VotingPrivacyWarningDialogService,
        meetingSettingService: MeetingSettingsService
    ) {
        super(componentServiceCollector, translate, fb, groupRepo, dialog, meetingSettingService);
    }
}
