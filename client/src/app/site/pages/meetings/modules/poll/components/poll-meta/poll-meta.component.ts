import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
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
    imports: [CommaSeparatedListingComponent, TranslatePipe, TranslateKeyPipe],
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
        return this.poll().config;
    });

    public hasGlobalOptionEnabled = computed<boolean>(() => {
        return this.poll().config.allow_nota || this.poll().config.min_options_amount === 0;
    });

    public generalApprovalAllowed = computed<boolean>(() => {
        return this.poll().config.allow_nota && this.poll().config.strike_out;
    });

    public generalRejectionAllowed = computed<boolean>(() => {
        return this.poll().config.allow_nota && !this.poll().config.strike_out;
    });

    public generalAbstainAllowed = computed<boolean>(() => {
        return this.poll().config.min_options_amount === 0;
    });

    public getOptionTitle(option: ViewPollOption): string {
        return option.getOptionTitle().title;
    }
}
