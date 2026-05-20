import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingScoreOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-rating-score';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-form-rating-score',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        TranslatePipe,
        KeyValuePipe
    ],
    templateUrl: './poll-form-rating-score.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, `./poll-form-rating-score.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormRatingScoreComponent {
    public form: UntypedFormGroup;

    public validPercentBases: Record<RatingScoreOnehundredPercentBase, string> = {
        yes_no: 'Valid (Yes/No)',
        valid: 'Valid',
        cast: 'Cast',
        entitled: 'Entitled',
        entitled_present: 'Entitled present',
        disabled: 'Disabled'
    };

    public data = input<Partial<ViewPoll>>();

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false],
            max_votes_per_option: [1],
            max_options_amount: [1],
            min_options_amount: [1],
            max_vote_sum: [1],
            min_vote_sum: [1]
        });
    }
}
