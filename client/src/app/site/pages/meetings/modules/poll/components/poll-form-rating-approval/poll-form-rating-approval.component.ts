import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingApprovalOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-rating-approval';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-form-rating-approval',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        TranslatePipe,
        KeyValuePipe
    ],
    templateUrl: './poll-form-rating-approval.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, `./poll-form-rating-approval.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormRatingApprovalComponent {
    public form: UntypedFormGroup;

    public validPercentBases: Record<RatingApprovalOnehundredPercentBase, string> = {
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
            max_options_amount: [1],
            min_options_amount: [1]
        });
    }
}
