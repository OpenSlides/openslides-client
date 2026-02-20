import { KeyValuePipe } from '@angular/common';
import { Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import {
    FormPollMethod,
    PollClassType,
    PollPercentBaseVerbose,
    PollPropertyVerbose,
    PollPropertyVerboseKey,
    PollType,
    PollTypeVerbose
} from 'src/app/domain/models/poll';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ParentErrorStateMatcher } from 'src/app/ui/modules/search-selector/validators';
import { PipesModule } from 'src/app/ui/pipes';

import { GroupControllerService, ViewGroup } from '../../../../pages/participants';
import { ViewPoll } from '../../../../pages/polls';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { VotingPrivacyWarningDialogService } from '../../modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';

/**
 * Interface for determining, which choices are presented to the user in the poll-form.
 * If a certain choice needs to be hidden, the corresponding attribute in this interface needs to be set to true.
 */
export interface PollFormHideSelectsData {
    visibility?: boolean;
    entitledGroups?: boolean;
    pollMethod?: boolean;
    globalOptions?: boolean;
    hundredPercentBase?: boolean;
    backendDuration?: boolean;
}

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
    /**
     * The form-group for the meta-info.
     */
    public pollForm: UntypedFormGroup;
    public parentErrorStateMatcher = new ParentErrorStateMatcher();

    public PollPropertyVerbose: Record<PollPropertyVerboseKey, string> = PollPropertyVerbose;

    /**
     * The different methods for this poll.
     */
    @Input()
    public pollMethods: Record<string, string>;

    public alternativePercentBases = PollPercentBaseVerbose;

    @Input()
    public set data(data: Partial<ViewPoll>) {
        this._data = data;
        this.isCreatedList = data.isListPoll;
    }

    public get data(): Partial<ViewPoll> {
        return this._data;
    }

    /**
     * The flag to allow min/max votes on YNA and YN poll method
     */
    @Input()
    public allowToSetMinMax = false;

    public isCreatedList: boolean;

    public get isList(): boolean {
        return this.pollMethod === FormPollMethod.LIST_YNA || this.isCreatedList;
    }

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    private _data: Partial<ViewPoll>;

    @Input()
    public pollOptionAmount: number;

    @Input()
    public isEVotingEnabled!: boolean;

    @Input()
    public pollClassType: PollClassType;

    /**
     * The different types the poll can accept.
     */
    @Input()
    public pollTypes = PollTypeVerbose;

    /**
     * the filtered `percentBases`.
     */
    public validPercentBases: Record<string, string>;

    /**
     * An twodimensional array to handle constant values for this poll.
     */
    public pollValues: [string, unknown][] = [];

    public showNonNominalWarning = false;

    public get isCreated(): boolean {
        return !this.data.state || this.data.isCreated; // no state means, its under creation
    }

    public get isNamedVotingSelected(): boolean {
        return this.pollTypeControl?.value === PollType.Named || false;
    }

    public get isEVotingSelected(): boolean {
        return this.isEVotingEnabled && this.pollTypeControl?.value !== PollType.Analog;
    }

    private get pollTypeControl(): AbstractControl {
        return this.pollForm.get(`visibility`);
    }

    private get pollMethodControl(): AbstractControl {
        return this.pollForm.get(`pollmethod`);
    }

    public get pollMethod(): FormPollMethod {
        return this.pollMethodControl.value as FormPollMethod;
    }

    private get globalYesControl(): AbstractControl {
        return this.pollForm.get(`global_yes`);
    }

    private get liveVotingControl(): AbstractControl {
        return this.pollForm.get(`live_voting_enabled`);
    }

    // public abstract get hideSelects(): PollFormHideSelectsData;

    public get pollMethodChangedToListObservable(): Observable<boolean> {
        return this.pollMethodControl.valueChanges.pipe(map(method => method === FormPollMethod.LIST_YNA));
    }

    public get isMotionPoll(): boolean {
        return this.pollClassType === PollClassType.Motion;
    }

    private get isAssignmentPoll(): boolean {
        return this.pollClassType === PollClassType.Assignment;
    }

    public get isLiveVotingAvailable(): boolean {
        return (
            this.isEVotingSelected &&
            this.isNamedVotingSelected &&
            (this.isMotionPoll ||
                (this.isAssignmentPoll &&
                    !this.globalYesControl?.value &&
                    this.pollMethod === FormPollMethod.Y &&
                    this.pollForm.get(`votes_amount`).get(`max_votes_amount`).value === 1))
        );
    }

    private fb = inject(UntypedFormBuilder);
    public groupRepo = inject(GroupControllerService);
    private dialog = inject(VotingPrivacyWarningDialogService);
    protected meetingSettingsService = inject(MeetingSettingsService);
    /**
     * Constructor. Retrieves necessary metadata from the pollService,
     * injects the poll itself
     */
    public constructor() {
        super();
        this.initContentForm();
    }

    /**
     * OnInit.
     * Sets the observable for groups.
     */
    public ngOnInit(): void {
        if (this.data) {
            this.checkPollState();
            this.checkPollBackend();
            this.patchLiveVotingEnabled();
        }

        this.subscriptions.push(
            combineLatest([
                this.pollForm.valueChanges.pipe(startWith(``)),
                this.pollMethodControl.valueChanges.pipe(startWith(``)),
                this.pollTypeControl.valueChanges.pipe(startWith(``))
            ]).subscribe(([contentFormCh]) => {
                this.updateFormControls(contentFormCh);
            })
        );

        // TODO: Fetch groups for repo search selection
    }

    /**
     * Updates the whole <poll-form />-component.
     *
     * @param update New data to pass into form-fields.
     */
    private updateFormControls(update: Partial<ViewPoll>): void {
        this.updatePollValues(update);
        this.updateLiveVotingEnabled();
        this.setWarning();
    }

    private checkPollBackend(): void {
        const pollType = this.data.content_object?.collection as PollClassType;
        if (!this.data.backend) {
            if (pollType !== PollClassType.Topic) {
                this.data.backend = this.meetingSettingsService.instant(`${pollType}_poll_default_backend`);
            } else {
                this.data.backend = this.meetingSettingsService.instant(`poll_default_backend`);
            }
        }
    }

    private patchLiveVotingEnabled(): void {
        if (this.isMotionPoll || this.isAssignmentPoll) {
            const liveVotingDefault = this.meetingSettingsService.instant(`poll_default_live_voting_enabled`) ?? false;
            this.liveVotingControl.setValue(liveVotingDefault);
        }
    }

    private checkPollState(): void {
        if (this.data.state) {
            this.disablePollType();
        }
    }

    private disablePollType(): void {
        this.pollTypeControl.disable();
    }

    public showMinMaxVotes(data: any): boolean {
        const selectedPollMethod: FormPollMethod = this.pollMethodControl.value;
        return (
            (selectedPollMethod === FormPollMethod.Y ||
                (selectedPollMethod !== FormPollMethod.LIST_YNA && this.allowToSetMinMax)) &&
            (!data || !data.state || data.isCreated)
        );
    }

    public showMaxVotesPerOption(data: any): boolean {
        const selectedPollMethod: FormPollMethod = this.pollMethodControl.value;
        return selectedPollMethod === FormPollMethod.Y && (!data || !data.state || data.isCreated);
    }

    private updateLiveVotingEnabled(): void {
        if (!this.isLiveVotingAvailable) {
            this.liveVotingControl.setValue(false, {
                emitEvent: false
            });
        }
    }

    /**
     * Disable votes_amount form control if the poll type is anonymous
     * and the poll method is votes.
     */
    private setWarning(): void {
        if (this.pollTypeControl.value === PollType.Pseudoanonymous) {
            this.showNonNominalWarning = true;
        } else {
            this.showNonNominalWarning = false;
        }
    }

    public getValues(): Partial<{ [place in keyof ViewPoll]: any }> {
        return { ...this.data, ...this.serializeForm(this.pollForm) };
    }

    private serializeForm(formGroup: UntypedFormGroup): Partial<ViewPoll> {
        /**
         * getRawValue() includes disabled controls.
         * Required since the server assumes missing fields would imply "true"
         */
        const formData = { ...formGroup.getRawValue(), ...formGroup.value.votes_amount };
        delete formData.votes_amount;
        return formData;
    }

    /**
     * This updates the poll-values to get correct data in the view.
     *
     * @param data Passing the properties of the poll.
     */
    protected updatePollValues(data: Record<string, any>, additionalPollValues?: PollPropertyVerboseKey[]): void {
        /*
        if (this.data) {
            const pollType: PollVisibility = data[`visibility`];
            this.pollValues = [
                [`visibility`, this.pollService.getVerboseNameForValue(`visibility`, data[`visibility`])]
            ];
            // optional pollValues
            if (additionalPollValues) {
                additionalPollValues.forEach(value => {
                    this.pollValues.push([
                        this.pollService.getVerboseNameForKey(value),
                        this.pollService.getVerboseNameForValue(value, data[value])
                    ]);
                });
            }
            if (pollType !== PollVisibility.Manually) {
                this.pollValues.push([
                    this.pollService.getVerboseNameForKey(`groups`),
                    data && data[`entitled_group_ids`] && data[`entitled_group_ids`].length
                        ? this.groupRepo.getNameForIds(...data[`entitled_group_ids`])
                        : `---`
                ]);
            }
        }
        */
    }

    private initContentForm(): void {
        this.pollForm = this.fb.group({
            title: [``, Validators.required],
            visibility: [``, Validators.required],
            entitled_group_ids: [],
            live_voting_enabled: [false]
        });
    }

    public openVotingWarning(event: MouseEvent): void {
        event.stopPropagation();
        this.dialog.open();
    }

    /**
     * compare function used with the KeyValuePipe to display the percent bases in original order
     */
    public keepEntryOrder(): number {
        return 0;
    }

    public getErrorMessage(message: string): string {
        switch (message) {
            case `notEnoughOptionsError`:
                return this.translate.instant(`There are not enough options.`);
            case `rangeError`:
                return this.translate.instant(`Min votes cannot be greater than max votes.`);
            case `rangeErrorMaxPerOption`:
                return this.translate.instant(`Max votes per option cannot be greater than max votes.`);
            case `max`:
                return this.translate.instant(`Max votes cannot be greater than options.`);
            default:
                return ``;
        }
    }
}
