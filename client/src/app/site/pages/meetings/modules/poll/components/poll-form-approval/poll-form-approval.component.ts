import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApprovalOnehundredPercentBase } from '@app/domain/models/poll/poll-config-approval';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { _, TranslatePipe } from '@ngx-translate/core';

import { PollFormBaseComponent } from '../poll-config-form-base.component';

export interface PollFormApproval {
    allow_abstain: boolean;
    onehundred_percent_base: ApprovalOnehundredPercentBase;
}

@Component({
    selector: 'os-poll-form-approval',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        TranslatePipe,
        TranslateKeyPipe
    ],
    templateUrl: './poll-form-approval.component.html',
    styleUrl: './poll-form-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormApprovalComponent extends PollFormBaseComponent {
    public hideMethod = input<boolean>(false);

    public validPercentBases: [ApprovalOnehundredPercentBase, string][] = [
        [`yes_no`, _('Yes/No')],
        [`yes_no_abstain`, _('Yes/No/Abstain')],
        [`valid`, _('All valid ballots')],
        [`cast`, _('All casted ballots')],
        [`entitled`, _('All entitled users')],
        // [`entitled_present`, _('Present entitled users')],
        [`disabled`, _('Disabled (no percents)')]
    ];

    protected initForm(): void {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false],
            required_majority: [`no_majority`]
        });
    }

    protected getPatchedFormData(data: Partial<ViewPoll>): Record<string, unknown> {
        const patch: Record<string, any> = {};
        if (data.config?.allow_abstain !== undefined) patch[`allow_abstain`] = data.config.allow_abstain;
        if (data.config?.onehundred_percent_base !== undefined)
            patch[`onehundred_percent_base`] = data.config.onehundred_percent_base;
        if (data.config?.required_majority !== undefined) patch[`required_majority`] = data.config.required_majority;

        return patch;
    }

    public getSerialzedForm(): Record<string, unknown> {
        return this.form.value;
    }
}
