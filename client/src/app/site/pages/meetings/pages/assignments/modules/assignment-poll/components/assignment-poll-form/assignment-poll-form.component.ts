import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';
import { VotingPrivacyWarningDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

import { GroupControllerService } from '../../../../../participants';
import { ViewAssignment } from '../../../../view-models';

@Component({
    selector: `os-assignment-poll-form`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class AssignmentPollFormComponent extends BasePollFormComponent implements OnInit {
    public get hideSelects(): PollFormHideSelectsData {
        return {
            globalOptions: false
        };
    }

    constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        fb: FormBuilder,
        groupRepo: GroupControllerService,
        dialog: VotingPrivacyWarningDialogService,
        meetingSettingService: MeetingSettingsService
    ) {
        super(componentServiceCollector, translate, fb, groupRepo, dialog, meetingSettingService);
    }

    public override ngOnInit(): void {
        if (this.data && this.data?.isAssignmentPoll) {
            if (!!this.data.getContentObject() && !this.data.max_votes_amount) {
                const assignment = this.data.getContentObject() as ViewAssignment;
                this.data.max_votes_amount = assignment.open_posts;
            }
            if (!this.data.pollmethod) {
                this.data.pollmethod = this.meetingSettingService.instant(`assignment_poll_default_method`);
            }
        }
        super.ngOnInit();
    }

    protected override updatePollValues(data: { [key: string]: any }, additionalPollValues?: string[]): void {
        let values = [];
        if (additionalPollValues) {
            values = additionalPollValues;
        }
        values.push(`pollmethod`);
        super.updatePollValues(data, values);
    }
}
