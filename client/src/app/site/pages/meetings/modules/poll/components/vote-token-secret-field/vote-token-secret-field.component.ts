import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { PollControllerService } from '../../services/poll-controller.service';

@Component({
    selector: `os-vote-token-secret-field`,
    templateUrl: `./vote-token-secret-field.component.html`,
    styleUrls: [`./vote-token-secret-field.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoteTokenSecretFieldComponent {
    public revealed = false;

    @Input()
    public user: ViewUser;

    @Input()
    public poll: ViewPoll;

    @Input()
    public set token(token: string) {
        this._token = token;
    }

    public get token(): string {
        return this.user && this.poll && this.controller.tokens[this.poll?.id]
            ? this.controller.tokens[this.poll?.id][this.user?.id] ?? this._token
            : this._token;
    }

    private _token: string;

    public constructor(private controller: PollControllerService) {}

    public toggleTokenReveal(reveal: boolean): void {
        this.revealed = reveal;
    }

    public copyToken(): void {
        if (this.token) {
            if (!navigator.clipboard) {
                try {
                    console.log(`Browser does not support Clipboard API. Copying through other means.`);
                    const elem = document.createElement(`textarea`);
                    elem.value = this.token;
                    document.body.appendChild(elem);
                    elem.select();
                    document.execCommand(`copy`);
                    document.body.removeChild(elem);
                } catch (e) {
                    throw new Error(`Failed to copy token.`);
                }
            } else {
                navigator.clipboard.writeText(this.token).catch(() => {
                    throw new Error(`Failed to copy token.`);
                });
            }
        } else {
            throw new Error(`Failed to find token.`);
        }
    }
}
