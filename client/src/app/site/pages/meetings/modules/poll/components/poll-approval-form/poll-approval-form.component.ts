import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'os-poll-approval-form',
    imports: [ReactiveFormsModule, MatCheckboxModule, TranslatePipe],
    templateUrl: './poll-approval-form.component.html',
    styleUrl: './poll-approval-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollApprovalFormComponent {
    public approvalForm: UntypedFormGroup;

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.approvalForm = this.fb.group({
            allow_abstain: [false]
        });
    }
}
