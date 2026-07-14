import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { _, TranslatePipe } from '@ngx-translate/core';
import { ApprovalOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-approval';

import { ViewPoll } from '../../../../pages/polls';
import { PollFormBaseComponent } from '../poll-config-form-base.component';

@Component({
    selector: 'os-poll-form-approval',
    imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, TranslatePipe],
    templateUrl: './poll-form-approval.component.html',
    styleUrl: './poll-form-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormApprovalComponent extends PollFormBaseComponent {
    private _data: Partial<ViewPoll>;

    public validPercentBases: [ApprovalOnehundredPercentBase, string][] = [
        [`yes_no`, _('Yes/No')],
        [`yes_no_abstain`, _('Yes/No/Abstain')],
        [`valid`, _('All valid ballots')],
        [`cast`, _('All casted ballots')],
        // [`entitled`, _('All entitled users')], // Entitled users is currently not implemented in vote service
        // [`entitled_present`, _('Present entitled users')],
        [`disabled`, _('Disabled (no percents)')]
    ];

    @Input()
    public set data(data: Partial<ViewPoll>) {
        this._data = data;
        if (data && this.form) {
            const patch: Record<string, any> = {};
            if (data.config?.allow_abstain !== undefined) patch[`allow_abstain`] = data.config.allow_abstain;
            if (data.config?.onehundred_percent_base !== undefined)
                patch[`onehundred_percent_base`] = data.config.onehundred_percent_base;
            this.form.patchValue(patch);
        }
    }

    public get data(): Partial<ViewPoll> {
        return this._data;
    }

    public initForm(): void {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false]
        });
    }

    public getSerialzedForm(): Record<string, unknown> {
        return this.form.value;
    }
}
