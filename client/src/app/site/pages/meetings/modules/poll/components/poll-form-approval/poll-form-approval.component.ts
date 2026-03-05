import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-approval-form',
    imports: [ReactiveFormsModule, MatCheckboxModule, TranslatePipe],
    templateUrl: './poll-form-approval.component.html',
    styleUrl: './poll-form-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormApprovalComponent {
    public approvalForm: UntypedFormGroup;

    private _data: Partial<ViewPoll>;

    @Input()
    public set data(data: Partial<ViewPoll>) {
        this._data = data;
        if (data && this.approvalForm) {
            const patch: Record<string, any> = {};
            if (data.config.allow_abstain !== undefined) patch[`allow_abstain`] = data.config.allow_abstain;
            this.approvalForm.patchValue(patch);
        }
    }

    public get data(): Partial<ViewPoll> {
        return this._data;
    }

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.approvalForm = this.fb.group({
            allow_abstain: [false]
        });
    }
}
