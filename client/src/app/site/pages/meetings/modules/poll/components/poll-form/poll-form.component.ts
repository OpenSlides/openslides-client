import { KeyValuePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Ids } from '@app/domain/definitions/key-types';
import { PollVisibility } from '@app/domain/models/poll';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseComponent } from '@app/site/base/base.component';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
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
    method: 'approval' | 'selection' | 'rating_approval' | 'rating_score';
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
        MatIconModule,
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
    private approvalForm = viewChild(PollFormApprovalComponent);
    private selectionForm = viewChild(PollFormSelectionComponent);
    private ratingApprovalForm = viewChild(PollFormRatingApprovalComponent);
    private ratingScoreForm = viewChild(PollFormRatingScoreComponent);

    public readonly visibilityOptions = PollVisibility;

    public showNonNominalWarning = false;

    public customConfigForm = input<boolean>(false);
    public optionAmount = input<number>(0);
    public optionType = input<'meeting_user' | 'text'>('text');
    public optionEdit = input<boolean>(false);
    public isEVotingEnabled = input.required<boolean>();

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    public readonly data = input<Partial<ViewPoll>>({});

    private pollModel = signal<PollForm>({
        title: ``,
        visibility: PollVisibility.Open,
        entitled_group_ids: [],
        live_voting_enabled: false,
        option_type: 'text',
        options: [],
        method: null,
        method_preselection: ``
    });

    public form = form(this.pollModel, schemaPath => {
        required(schemaPath.title);
        required(schemaPath.visibility);
        if (!this.customConfigForm()) {
            required(schemaPath.method_preselection);
        }
    });

    public isValid = computed<boolean>(() => {
        return this.form().valid() && this.methodForm()?.formValid();
    });

    public isCreated = computed<boolean>(() => {
        return !this.data()?.state || this.data().isCreated;
    });

    public selectedMethod = computed<string | null>(() => {
        const preselection = this.form.method_preselection().value();
        if (!preselection) {
            return null;
        }

        return this.form.method_preselection().value().split(`.`)[0];
    });

    public methodForm = computed(() => {
        switch (this.selectedMethod()) {
            case `approval`:
                return this.approvalForm();
            case `selection`:
                return this.selectionForm();
            case `rating_approval`:
                return this.ratingApprovalForm();
            case `rating_score`:
                return this.ratingScoreForm();
        }

        return null;
    });

    public methodConfig = computed<unknown>(() => {
        if (this.methodForm()) {
            return this.methodForm().getSerialzedForm();
        }

        return null;
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
    private meetingSettingsService = inject(MeetingSettingsService);

    public allowCumulative = this.meetingSettingsService.signal(`poll_enable_max_votes_per_option`);

    public constructor() {
        super();

        effect(this.updateLiveVotingEnabled.bind(this));
        effect(this.setWarning.bind(this));
        effect(this.updateData.bind(this));
        effect(this.updateConfigData.bind(this));
        effect(this.changeMethod.bind(this));
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

    private updateData(): void {
        const data = this.data();
        if (data && this.form) {
            if (data.entitled_group_ids !== undefined)
                this.form['entitled_group_ids']().value.set(data.entitled_group_ids);
            if (data.live_voting_enabled !== undefined)
                this.form['live_voting_enabled']().value.set(!!data.live_voting_enabled);
            if (data.title !== undefined) this.form['title']().value.set(data.title);
            if (data.visibility !== undefined) this.form['visibility']().value.set(data.visibility);
            if (data.options !== undefined && !data.options.some(option => option.meeting_user_id))
                this.form['options']().value.set(data.options.map(option => option.text));
            if (data.config?.method) {
                let preselection = data.config.method;
                if (!(data instanceof ViewPoll) && this.optionAmount() <= 1 && data.config.method !== `rating_score`) {
                    preselection = `approval`;
                }

                if (preselection === `approval` || preselection === `rating_approval`) {
                    preselection += data.config.allow_abstain ? `.yes_no_abstain` : `.yes_no`;
                } else if (preselection == `selection`) {
                    preselection += data.config.strike_out ? `.no` : `.yes`;
                }

                this.form['method_preselection']().value.set(preselection);
            }
        }
    }

    private updateConfigData(): void {
        const configForm = this.methodForm();
        if (!configForm) {
            return;
        }

        const data = this.data();
        if (data && this.form) {
            for (const field of Object.keys(data.config)) {
                const ctrl = this.methodForm().form.get(field);
                const val = data.config[field];
                if (ctrl && val !== undefined) {
                    ctrl.patchValue(val);
                }
            }
        }
    }

    private changeMethod(): void {
        const configForm = this.methodForm();
        if (!configForm) {
            return;
        }

        const mode = this.form.method_preselection().value().split(`.`)[1];
        if (this.selectedMethod() === `approval` || this.selectedMethod() === `rating_approval`) {
            this.methodForm()
                .form.get(`allow_abstain`)
                .patchValue(mode === `yes_no_abstain`);
        }

        if (this.selectedMethod() === `selection`) {
            this.methodForm()
                .form.get(`strike_out`)
                .patchValue(mode === `no`);
        }
    }
}
