import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectionOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-selection';
import { EditableListComponent } from 'src/app/ui/modules/editable-list';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-form-selection',
    imports: [
        ReactiveFormsModule,
        EditableListComponent,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        TranslatePipe,
        KeyValuePipe
    ],
    templateUrl: './poll-form-selection.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, './poll-form-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormSelectionComponent {
    public form: UntypedFormGroup;

    public validPercentBases: Record<SelectionOnehundredPercentBase, string> = {
        no_general: 'Valid no general',
        valid: 'Valid',
        cast: 'Cast',
        entitled: 'Entitled',
        entitled_present: 'Entitled present',
        disabled: 'Disabled'
    };

    public data = input.required<Partial<ViewPoll>>();
    public optionType = input<'meeting_user' | 'text'>('text');
    public optionEdit = input<boolean>(false);

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            strike_out: [false],
            allow_nota: [false],
            max_options_amount: [1],
            min_options_amount: [1],
            option_type: ['text'],
            options: [[]]
        });

        effect(this.onDataUpdated.bind(this));
    }

    public onOptionsChange(items: string[]): void {
        this.form.get('options').setValue(items);
    }

    private onDataUpdated(): void {
        if (!this.data() || !this.form) {
            return;
        }

        const patch: Record<string, any> = {};
        for (const field of [`onehundred_percent_base`, `allow_nota`, `max_options_amount`, `min_options_amount`]) {
            if (this.data().config && this.data().config[field] !== undefined) patch[field] = this.data().config[field];
        }

        patch[`option_type`] = this.optionType();

        this.form.patchValue(patch);
    }
}
