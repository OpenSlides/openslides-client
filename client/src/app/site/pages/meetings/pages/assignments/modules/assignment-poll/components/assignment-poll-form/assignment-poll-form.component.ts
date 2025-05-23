import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { PollPropertyVerboseKey } from 'src/app/domain/models/poll';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';

import { ViewAssignment } from '../../../../view-models';

@Component({
    selector: `os-assignment-poll-form`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    providers: [{ provide: BasePollFormComponent, useExisting: AssignmentPollFormComponent }],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AssignmentPollFormComponent extends BasePollFormComponent implements OnInit {
    public override PollPropertyVerbose: Record<PollPropertyVerboseKey, string> = { ...this.PollPropertyVerbose, pollmethod: _(`Election method`) };
    public get hideSelects(): PollFormHideSelectsData {
        return {
            globalOptions: false
        };
    }

    public override ngOnInit(): void {
        if (this.data && this.data?.isAssignmentPoll) {
            if (!!this.data.getContentObject() && !this.data.max_votes_amount) {
                const assignment = this.data.getContentObject() as ViewAssignment;
                this.data.max_votes_amount = assignment.open_posts;
            }
            if (!this.data.pollmethod) {
                this.data.pollmethod = this.meetingSettingsService.instant(`assignment_poll_default_method`);
            }
        }
        super.ngOnInit();
    }

    protected override updatePollValues(data: Record<string, any>, additionalPollValues?: string[]): void {
        let values = [];
        if (additionalPollValues) {
            values = additionalPollValues;
        }
        values.push(`pollmethod`);
        super.updatePollValues(data, values);
    }
}
