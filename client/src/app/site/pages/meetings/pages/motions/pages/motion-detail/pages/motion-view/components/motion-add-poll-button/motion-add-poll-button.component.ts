import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Permission } from '@app/domain/definitions/permission';
import { PollDialogData } from '@app/site/pages/meetings/modules/poll/definitions';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';
import { map, Observable } from 'rxjs';

import { MotionPollService } from '../../../../../../modules/motion-poll/services/motion-poll.service/motion-poll.service';
import { MotionPollDialogService } from '../../../../../../modules/motion-poll/services/motion-poll-dialog.service';

@Component({
    selector: `os-motion-add-poll-button`,
    templateUrl: `./motion-add-poll-button.component.html`,
    styleUrls: [`./motion-add-poll-button.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionAddPollButtonComponent {
    @Input()
    public motion!: ViewMotion;

    public readonly permission = Permission;

    public get canStateHavePolls$(): Observable<boolean> {
        return this.motion.state$.pipe(map(state => state?.allow_create_poll || false));
    }

    public constructor(
        private motionPollService: MotionPollService,
        private pollDialog: MotionPollDialogService
    ) {}

    public async openDialog(): Promise<void> {
        const defaultPollData = this.motionPollService.getDefaultPollData(this.motion);
        const dialogData: Partial<PollDialogData> = {
            content_object_id: this.motion.fqid,
            content_object: this.motion,
            ...defaultPollData,
            live_voting_enabled: this.motionPollService.defaultPollLiveVotingEnabled
        };

        this.pollDialog.open(dialogData);
    }
}
