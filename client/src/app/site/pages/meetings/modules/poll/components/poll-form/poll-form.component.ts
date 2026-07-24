import { KeyValuePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Ids } from '@app/domain/definitions/key-types';
import { PollVisibility } from '@app/domain/models/poll';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseComponent } from '@app/site/base/base.component';
import { DirectivesModule } from '@app/ui/directives';
import { EditableListComponent } from '@app/ui/modules/editable-list';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { PipesModule } from '@app/ui/pipes';
import { TranslatePipe } from '@ngx-translate/core';

import { GroupControllerService, ViewGroup } from '../../../../pages/participants';
import { ViewPoll } from '../../../../pages/polls';
import { PollFormApprovalComponent } from '../poll-form-approval/poll-form-approval.component';
import { PollFormRatingApprovalComponent } from '../poll-form-rating-approval/poll-form-rating-approval.component';
import { PollFormRatingScoreComponent } from '../poll-form-rating-score/poll-form-rating-score.component';
import { PollFormSelectionComponent } from '../poll-form-selection/poll-form-selection.component';
import { VotingPrivacyWarningDialogComponent } from '../voting-privacy-warning/voting-privacy-warning-dialog.component';

interface PollForm {
    title: string;
    visibility: PollVisibility;
    entitled_group_ids: Ids;
    live_voting_enabled: boolean;
    option_type: 'meeting_user' | 'text';
    options: any[];
    method_preselection: string | null;
}

@Component({
    selector: `os-poll-form`,
    templateUrl: `./poll-form.component.html`,
    styleUrls: [`./poll-form.component.scss`],
    imports: [
        PollFormApprovalComponent,
        PollFormSelectionComponent,
        PollFormRatingApprovalComponent,
        PollFormRatingScoreComponent,
        EditableListComponent,
        TranslatePipe,
        FormField,
        FormRoot,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        SearchSelectorModule,
        DirectivesModule,
        PipesModule,
        KeyValuePipe,
        ReactiveFormsModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class PollFormComponent extends BaseComponent {
    public readonly visibilityOptions = PollVisibility;

    public showNonNominalWarning = false;

    public methods = input<string[]>([`selection`, `rating_approval`, `rating_score`, `approval`, `list`]);

    public optionAmount = input<number>(0);
    public optionType = input<'meeting_user' | 'text'>('text');
    public optionEdit = input<boolean>(false);
    public isEVotingEnabled = input.required<boolean>();

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    public readonly data = input<Partial<ViewPoll>>({});

    public get isCreated(): boolean {
        return !this.data()?.state || this.data().isCreated;
    }

    public selectedMethod = computed<string | null>(() => {
        const preselection = this.form.method_preselection().value();
        if (!preselection) {
            return null;
        }

        return this.form.method_preselection().value().split(`.`)[0];
    });

    public isOpenVotingSelected = computed(() => {
        return this.form.visibility().value() === PollVisibility.Open || false;
    });

    public isNamedVotingSelected = computed(() => {
        return this.form.visibility().value() === PollVisibility.Named || false;
    });

    public isEVotingSelected = computed(() => {
        return this.isEVotingEnabled() && this.form.visibility().value() !== PollVisibility.Manually;
    });

    public isLiveVotingAvailable = computed(() => {
        return this.isEVotingSelected() && (this.isNamedVotingSelected() || this.isOpenVotingSelected());
    });

    public groupRepo = inject(GroupControllerService);
    private dialog = inject(MatDialog);

    public constructor() {
        super();

        effect(() => {
            this.updateLiveVotingEnabled();
            this.setWarning();
        });

        effect(this.updateData.bind(this));
    }

    public getValues(): Partial<{ [place in keyof ViewPoll]: any }> {
        return { ...this.data, ...this.serializeForm() };
    }

    public openVotingWarning(event: MouseEvent): void {
        event.stopPropagation();
        this.dialog.open(VotingPrivacyWarningDialogComponent, infoDialogSettings);
    }

    public onOptionsChange(items: string[]): void {
        this.form.options().value.set(items);
    }

    private updateLiveVotingEnabled(): void {
        if (!this.isLiveVotingAvailable()) {
            this.form.live_voting_enabled().value.set(false);
        }
    }

    private setWarning(): void {
        this.showNonNominalWarning = this.pollModel().visibility === PollVisibility.Secret;
    }

    private serializeForm(): Partial<ViewPoll> {
        // getRawValue() includes disabled controls
        return { ...this.pollModel() };
    }

    private pollModel = signal<PollForm>({
        title: ``,
        visibility: PollVisibility.Open,
        entitled_group_ids: [],
        live_voting_enabled: false,
        option_type: 'text',
        options: [],
        method_preselection: null
    });

    public form = form(this.pollModel, schemaPath => {
        required(schemaPath.title);
        required(schemaPath.visibility);
    });

    private updateData(): void {
        const data = this.data();
        if (data && this.form) {
            const patch: Record<string, any> = {};

            if (data.entitled_group_ids !== undefined)
                this.form['entitled_group_ids']().value.set(data.entitled_group_ids);
            if (data.live_voting_enabled !== undefined)
                this.form['live_voting_enabled']().value.set(!!data.live_voting_enabled);
            if (data.title !== undefined) this.form['title']().value.set(data.title);
            if (data.visibility !== undefined) this.form['visibility']().value.set(data.visibility);
            if (data.options !== undefined && !data.options.some(option => option.meeting_user_id))
                this.form['options']().value.set(data.options.map(option => option.text));
            if (data.config?.allow_abstain !== undefined) patch['allow_abstain'] = data.config.allow_abstain;
            if (data.config?.allow_nota !== undefined) patch['allow_nota'] = data.config.allow_nota;
            if (data.config?.strike_out !== undefined) patch['strike_out'] = data.config.strike_out;
            if (data.config?.display_chart !== undefined) patch['display_chart'] = data.config.display_chart;
            if (data.config?.onehundred_percent_base !== undefined)
                patch['onehundred_percent_base'] = data.config.onehundred_percent_base;

            // TODO: Patch form
            // this.pollForm.patchValue(patch);
        }
    }
}
