import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { ApprovalOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-approval';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-form-approval',
    imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, TranslatePipe, KeyValuePipe],
    templateUrl: './poll-form-approval.component.html',
    styleUrl: './poll-form-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormApprovalComponent {
    public approvalForm: UntypedFormGroup;

    private _data: Partial<ViewPoll>;

    public validPercentBases: Record<ApprovalOnehundredPercentBase, string> = {
        YN: 'Valid',
        valid: 'Valid',
        cast: 'Cast',
        entitled: 'Entitled',
        entitled_present: 'Entitled present',
        disabled: 'Disabled'
    };

    @Input()
    public set data(data: Partial<ViewPoll>) {
        this._data = data;
        if (data && this.approvalForm) {
            const patch: Record<string, any> = {};
            if (data.config?.allow_abstain !== undefined) patch[`allow_abstain`] = data.config.allow_abstain;
            if (data.config?.onehundred_percent_base !== undefined)
                patch[`onehundred_percent_base`] = data.config.onehundred_percent_base;
            this.approvalForm.patchValue(patch);
        }
    }

    public get data(): Partial<ViewPoll> {
        return this._data;
    }

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.approvalForm = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false]
        });
    }
}
