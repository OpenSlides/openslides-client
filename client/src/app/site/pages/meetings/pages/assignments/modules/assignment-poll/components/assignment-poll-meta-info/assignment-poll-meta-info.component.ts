import { Component, Input, OnInit } from '@angular/core';
import { PollPropertyVerbose } from 'src/app/domain/models/poll/poll-constants';
import { BasePollMetaInformationComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-meta-information.component';
import { UnknownUserLabel } from '../../services/assignment-poll.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { AssignmentPollMethodVerbose } from '../../definitions';

@Component({
    selector: 'os-assignment-poll-meta-info',
    templateUrl: './assignment-poll-meta-info.component.html',
    styleUrls: ['./assignment-poll-meta-info.component.scss']
})
export class AssignmentPollMetaInfoComponent extends BasePollMetaInformationComponent {
    public pollPropertyVerbose = PollPropertyVerbose;
    private unknownUserLabel = UnknownUserLabel;

    @Input()
    public showCandidates = true;

    private get assignment(): ViewAssignment {
        return this.poll.content_object;
    }

    public get enumerateCandidates(): boolean {
        return this.assignment?.number_poll_candidates || false;
    }

    public get hasGlobalOptionEnabled(): boolean {
        return this.poll.hasGlobalOptionEnabled;
    }

    public userCanVote(): boolean {
        return this.poll.canBeVotedFor();
    }

    public getOptionTitle(option: ViewOption): string {
        return option.content_object?.getShortName().trim() ?? this.unknownUserLabel;
    }

    public getVerbosePollMethod(): string {
        return AssignmentPollMethodVerbose[this.poll.pollmethod];
    }
}
