import { KeyValuePipe } from '@angular/common';
import { Component, inject, Input, input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, startWith } from 'rxjs';
import { PollVisibility } from 'src/app/domain/models/poll';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { EditableListComponent } from 'src/app/ui/modules/editable-list';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { GroupControllerService, ViewGroup } from '../../../../pages/participants';
import { ViewPoll } from '../../../../pages/polls';
import { VotingPrivacyWarningDialogComponent } from '../voting-privacy-warning/voting-privacy-warning-dialog.component';

@Component({
    selector: `os-poll-form`,
    templateUrl: `./poll-form.component.html`,
    styleUrls: [`./poll-form.component.scss`],
    imports: [
        EditableListComponent,
        TranslatePipe,
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
export class PollFormComponent extends BaseComponent implements OnInit {
    public pollForm: UntypedFormGroup;

    public readonly visibilityOptions = PollVisibility;

    public showNonNominalWarning = false;

    public optionType = input<'meeting_user' | 'text'>('text');
    public optionEdit = input<boolean>(false);
    public isEVotingEnabled = input.required<boolean>();

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    private _data: Partial<ViewPoll>;

    @Input()
    public set data(data: Partial<ViewPoll>) {
        this._data = data;
        if (data && this.pollForm) {
            const patch: Record<string, any> = {};
            if (data.title !== undefined) patch[`title`] = data.title;
            if (data.visibility !== undefined) patch[`visibility`] = data.visibility;
            if (data.entitled_group_ids !== undefined) patch[`entitled_group_ids`] = data.entitled_group_ids;
            if (data.live_voting_enabled !== undefined) patch[`live_voting_enabled`] = !!data.live_voting_enabled;
            if (data.options !== undefined && !data.options.some(option => option.meeting_user_id))
                patch[`options`] = data.options.map(option => option.text);
            this.pollForm.patchValue(patch);
        }
    }

    public get data(): Partial<ViewPoll> {
        return this._data;
    }

    public get isCreated(): boolean {
        return !this.data?.state || this.data.isCreated;
    }

    public get isOpenVotingSelected(): boolean {
        return this.pollTypeControl?.value === PollVisibility.Open || false;
    }

    public get isNamedVotingSelected(): boolean {
        return this.pollTypeControl?.value === PollVisibility.Named || false;
    }

    public get isEVotingSelected(): boolean {
        return this.isEVotingEnabled() && this.pollTypeControl?.value !== PollVisibility.Manually;
    }

    public get isLiveVotingAvailable(): boolean {
        return this.isEVotingSelected && (this.isNamedVotingSelected || this.isOpenVotingSelected);
    }

    private get pollTypeControl(): AbstractControl {
        return this.pollForm.get(`visibility`);
    }

    private get liveVotingControl(): AbstractControl {
        return this.pollForm.get(`live_voting_enabled`);
    }

    private fb = inject(UntypedFormBuilder);
    public groupRepo = inject(GroupControllerService);
    private dialog = inject(MatDialog);

    public constructor() {
        super();
        this.initContentForm();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            combineLatest([
                this.pollForm.valueChanges.pipe(startWith(``)),
                this.pollTypeControl.valueChanges.pipe(startWith(``))
            ]).subscribe(() => {
                this.updateLiveVotingEnabled();
                this.setWarning();
            })
        );
    }

    public getValues(): Partial<{ [place in keyof ViewPoll]: any }> {
        return { ...this.data, ...this.serializeForm(this.pollForm) };
    }

    public openVotingWarning(event: MouseEvent): void {
        event.stopPropagation();
        this.dialog.open(VotingPrivacyWarningDialogComponent, infoDialogSettings);
    }

    public onOptionsChange(items: string[]): void {
        this.pollForm.get('options').setValue(items);
    }

    private updateLiveVotingEnabled(): void {
        if (!this.isLiveVotingAvailable) {
            this.liveVotingControl.setValue(false, { emitEvent: false });
        }
    }

    private setWarning(): void {
        this.showNonNominalWarning = this.pollTypeControl.value === PollVisibility.Secret;
    }

    private serializeForm(formGroup: UntypedFormGroup): Partial<ViewPoll> {
        // getRawValue() includes disabled controls
        return { ...formGroup.getRawValue() };
    }

    private initContentForm(): void {
        this.pollForm = this.fb.group({
            title: [``, Validators.required],
            visibility: [PollVisibility.Open, Validators.required],
            entitled_group_ids: [],
            live_voting_enabled: [false],
            option_type: ['text'],
            options: [[]]
        });
    }
}
