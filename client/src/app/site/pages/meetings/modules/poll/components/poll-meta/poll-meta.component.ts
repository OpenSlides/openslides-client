import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PollConfigApproval } from '@app/domain/models/poll/poll-config-approval';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { ViewMeetingUser } from '@app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { TranslatePipe } from '@ngx-translate/core';

import { ViewPollConfigApproval } from '../../../../pages/polls/view-models/poll-config-approval';
import { ViewPollConfigRatingApproval } from '../../../../pages/polls/view-models/poll-config-rating-approval';
import { ViewPollConfigRatingScore } from '../../../../pages/polls/view-models/poll-config-rating-score';
import { ViewPollConfigSelection } from '../../../../pages/polls/view-models/poll-config-selection';
import { ViewPollConfigStvScottish } from '../../../../pages/polls/view-models/poll-config-stv-scottish';
import { ViewPollOption } from '../../../../pages/polls/view-models/poll-option';

@Component({
    selector: 'os-poll-meta',
    imports: [CommaSeparatedListingComponent, TranslatePipe, TranslateKeyPipe, NgTemplateOutlet],
    templateUrl: './poll-meta.component.html',
    styleUrl: './poll-meta.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollMetaComponent {
    public poll = input.required<ViewPoll>();

    public config = computed<
        Partial<
            ViewPollConfigApproval &
                ViewPollConfigRatingApproval &
                ViewPollConfigRatingScore &
                ViewPollConfigSelection &
                ViewPollConfigStvScottish
        >
    >(() => {
        return this.poll().config || {};
    });

    public hasGlobalOptionEnabled = computed<boolean>(() => {
        return this.config().allow_nota || this.config().min_options_amount === 0;
    });

    public generalApprovalAllowed = computed<boolean>(() => {
        return this.config().allow_nota && this.config().strike_out;
    });

    public generalRejectionAllowed = computed<boolean>(() => {
        return this.config().allow_nota && !this.config().strike_out;
    });

    public generalAbstainAllowed = computed<boolean>(() => {
        return this.config().min_options_amount === 0;
    });

    public isListPoll = computed<boolean>(() => {
        return this.config().collection === PollConfigApproval.COLLECTION && !!this.poll().options?.length;
    });

    public isPersonPoll = computed<boolean>(() => {
        return !!this.poll().options?.length && !!this.poll().options[0].content_object_id;
    });

    public enumerateOptions = computed<boolean>(() => {
        return (
            this.poll().content_object?.collection === `assignment` && this.poll().content_object.number_poll_candidates
        );
    });

    public getOptionTitle(option: ViewPollOption): string {
        if (option.content_object && option.content_object.user) {
            if (option.content_object instanceof ViewMeetingUser) {
                return option.content_object.user.getFullName();
            } else if (option.content_object instanceof ViewUser) {
                return option.content_object.getFullName();
            }
        }

        return option.getOptionTitle().title;
    }
}
