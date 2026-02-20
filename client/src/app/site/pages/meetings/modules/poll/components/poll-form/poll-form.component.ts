import { KeyValuePipe } from '@angular/common';
import { Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, startWith } from 'rxjs';
import {
    PollClassType,
    PollPropertyVerbose,
    PollPropertyVerboseKey,
    PollVisibility,
    PollVisibilityVerbose
} from 'src/app/domain/models/poll';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { GroupControllerService, ViewGroup } from '../../../../pages/participants';
import { ViewPoll } from '../../../../pages/polls';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { VotingPrivacyWarningDialogService } from '../../modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';

@Component({
    selector: `os-poll-form`,
    templateUrl: `./poll-form.component.html`,
    styleUrls: [`./poll-form.component.scss`],
    imports: [
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

    public PollPropertyVerbose: Record<PollPropertyVerboseKey, string> = PollPropertyVerbose;

    public readonly visibilityOptions = PollVisibilityVerbose;

    public showNonNominalWarning = false;

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    @Input()
    public set data(data: Partial<ViewPoll>) {
        this._data = data;
    }

    public get data(): Partial<ViewPoll> {
        return this._data;
    }

    @Input()
    public isEVotingEnabled!: boolean;

    @Input()
    public pollClassType: PollClassType;

    private _data: Partial<ViewPoll>;

    public get isCreated(): boolean {
        return !this.data?.state || this.data.isCreated;
    }

    public get isNamedVotingSelected(): boolean {
        return this.pollTypeControl?.value === PollVisibility.Named || false;
    }

    public get isEVotingSelected(): boolean {
        return this.isEVotingEnabled && this.pollTypeControl?.value !== PollVisibility.Manually;
    }

    public get isLiveVotingAvailable(): boolean {
        return this.isEVotingSelected && this.isNamedVotingSelected;
    }

    private get isMotionPoll(): boolean {
        return this.pollClassType === PollClassType.Motion;
    }

    private get pollTypeControl(): AbstractControl {
        return this.pollForm.get(`visibility`);
    }

    private get liveVotingControl(): AbstractControl {
        return this.pollForm.get(`live_voting_enabled`);
    }

    private fb = inject(UntypedFormBuilder);
    public groupRepo = inject(GroupControllerService);
    private dialog = inject(VotingPrivacyWarningDialogService);
    protected meetingSettingsService = inject(MeetingSettingsService);

    public constructor() {
        super();
        this.initContentForm();
    }

    public ngOnInit(): void {
        if (this.data) {
            this.checkPollState();
            this.patchLiveVotingEnabled();
        }

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
        this.dialog.open();
    }

    private checkPollState(): void {
        if (this.data.state) {
            this.pollTypeControl.disable();
        }
    }

    private patchLiveVotingEnabled(): void {
        if (this.isMotionPoll) {
            const liveVotingDefault = this.meetingSettingsService.instant(`poll_default_live_voting_enabled`) ?? false;
            this.liveVotingControl.setValue(liveVotingDefault);
        }
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
            live_voting_enabled: [false]
        });
    }
}
