import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { TranslateKeyPipe } from 'src/app/ui/pipes/translate-key/translate-key.pipe';

import {
    ViewPoll,
    ViewPollConfigApproval,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection,
    ViewPollConfigStvScottish,
    ViewPollOption
} from '../../../../pages/polls';

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
        return !!this.poll().options?.length && !!this.poll().options[0].meeting_user_id;
    });

    public enumerateOptions = computed<boolean>(() => {
        return (
            this.poll().content_object?.collection === `assignment` && this.poll().content_object.number_poll_candidates
        );
    });

    public getOptionTitle(option: ViewPollOption): string {
        if (option.meeting_user && option.meeting_user.user) {
            return option.meeting_user.user.getFullName();
        }
        return option.getOptionTitle().title;
    }
}
