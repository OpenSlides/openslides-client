import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VoteDecryptGatewayService } from 'src/app/gateways/vote-decrypt-gateway.service';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: `os-poll-non-verification-content`,
    templateUrl: `./poll-non-verification-content.component.html`,
    styleUrls: [`./poll-non-verification-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollNonVerificationContentComponent {
    @Input()
    public poll: ViewPoll;

    public waiting = new BehaviorSubject<boolean>(false);

    public constructor(private decryptGateway: VoteDecryptGatewayService) {}

    public async verifyPoll(): Promise<void> {
        if (!this.poll) {
            return;
        }
        this.waiting.next(true);
        await this.decryptGateway.reVerifyPoll(this.poll);
        this.waiting.next(false);
    }
}
