import { Directive, inject } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { PollContentObject } from '@app/domain/models/poll';
import { PollState } from '@app/domain/models/poll/poll-constants';
import { BaseMeetingComponent } from '@app/site/pages/meetings/base/base-meeting.component';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';
import { ChoiceService } from '@app/ui/modules/choice-dialog';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { PollControllerService } from '../services/poll-controller.service/poll-controller.service';

@Directive()
export abstract class BasePollComponent<C extends PollContentObject = any> extends BaseMeetingComponent {
    private stateChangePendingSubject = new BehaviorSubject<boolean>(false);

    public readonly stateChangePendingObservable = this.stateChangePendingSubject as Observable<boolean>;

    public get poll(): ViewPoll<C> {
        return this._poll;
    }

    protected set poll(poll: ViewPoll) {
        this._poll = poll;
        this.onAfterUpdatePoll(poll);
    }

    public pollStateActions = {
        [PollState.Created]: {
            icon: `play_arrow`,
            css: `start-poll-button`
        },
        [PollState.Started]: {
            icon: `stop`,
            css: `stop-poll-button`
        },
        [PollState.Finished]: {
            icon: `public`,
            css: `publish-poll-button`
        }
    };

    public get hideChangeState(): boolean {
        return this._poll.isPublished || (this._poll.isCreated && this._poll.isAnalog);
    }

    protected _id!: Id;
    protected _poll!: ViewPoll<C>;

    protected override translate = inject(TranslateService);
    protected promptService = inject(PromptService);
    protected choiceService = inject(ChoiceService);
    protected repo = inject(PollControllerService);

    protected initializePoll(id: Id): void {
        this._id = id;
        this.loadPoll(this._id);
    }

    /**
     * Hook to listen to changes. A poll is already available.
     */
    protected onAfterUpdatePoll(_poll: ViewPoll<C>): void {}

    protected loadPoll(_id: Id): void {
        this.subscriptions.push(
            this.repo.getViewModelObservable(this._id).subscribe(poll => {
                if (poll) {
                    this.poll = poll;
                }
            })
        );
    }

    public abstract getDetailLink(): string;
}
