import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    PollBackendDurationChoices,
    PollClassType,
    PollMethod,
    PollPercentBase,
    PollPropertyVerbose,
    PollType,
    PollTypeVerbose
} from 'src/app/domain/models/poll/poll-constants';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { combineLatest, startWith } from 'rxjs';
import { GroupControllerService } from '../../../../pages/participants/modules/groups/services/group-controller.service';
import { PollService } from '../../services/poll.service';
import { ParentErrorStateMatcher } from 'src/app/ui/modules/search-selector/validators';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { VotingPrivacyWarningDialogService } from '../../modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { isNumberRange } from 'src/app/infrastructure/utils/validators';

@Component({
    selector: 'os-poll-form',
    templateUrl: './poll-form.component.html',
    styleUrls: ['./poll-form.component.scss']
})
export class PollFormComponent extends BaseUiComponent implements OnInit {
    /**
     * The form-group for the meta-info.
     */
    public contentForm!: FormGroup;
    public parentErrorStateMatcher = new ParentErrorStateMatcher();

    public PollType = PollType;
    public PollPropertyVerbose = PollPropertyVerbose;
    public readonly pollBackendDurationChoices = PollBackendDurationChoices;

    /**
     * The different methods for this poll.
     */
    @Input()
    public pollMethods: { [key: string]: string } | undefined;

    /**
     * The different percent bases for this poll.
     */
    @Input()
    public percentBases: { [key: string]: string } = {};

    @Input()
    public data!: Partial<ViewPoll>;

    @Input()
    public pollService!: PollService;

    @Input()
    public pollClassType!: PollClassType;

    /**
     * The different types the poll can accept.
     */
    public pollTypes = PollTypeVerbose;

    /**
     * the filtered `percentBases`.
     */
    public validPercentBases: { [key: string]: string } = {};

    /**
     * An twodimensional array to handle constant values for this poll.
     */
    public pollValues: [string, unknown][] = [];

    public showNonNominalWarning = false;

    public get isAssignmentPoll(): boolean {
        return this.pollClassType === PollClassType.Assignment;
    }

    public get isEVotingEnabled(): boolean {
        if (this.pollService) {
            return this.pollService.isElectronicVotingEnabled;
        } else {
            return false;
        }
    }

    public get isCreated(): boolean {
        return !this.data.state || !!this.data.isCreated; // no state means, its under creation
    }

    public get isEVotingSelected(): boolean {
        return this.pollTypeControl?.value !== PollType.Analog || false;
    }

    private get pollTypeControl(): AbstractControl {
        return this.contentForm.get(`type`)!;
    }

    private get pollMethodControl(): AbstractControl {
        return this.contentForm.get(`pollmethod`)!;
    }

    private get globalYesControl(): AbstractControl {
        return this.contentForm.get(`global_yes`)!;
    }

    private get globalNoControl(): AbstractControl {
        return this.contentForm.get(`global_no`)!;
    }

    private get globalAbstainControl(): AbstractControl {
        return this.contentForm.get(`global_abstain`)!;
    }

    private get percentBaseControl(): AbstractControl {
        return this.contentForm.get(`onehundred_percent_base`)!;
    }

    /**
     * Constructor. Retrieves necessary metadata from the pollService,
     * injects the poll itself
     */
    public constructor(
        private fb: FormBuilder,
        public groupRepo: GroupControllerService,
        private dialog: VotingPrivacyWarningDialogService,
        private meetingSettingService: MeetingSettingsService
    ) {
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

            // if (this.data.isAssignmentPoll) {
            //     if (!!this.data.getContentObject?.() && !this.data.max_votes_amount) {
            //         const assignment = this.data.getContentObject() as ViewAssignment;
            //         this.data.max_votes_amount = assignment.open_posts;
            //     }
            //     if (!this.data.pollmethod) {
            //         this.data.pollmethod = this.meetingSettingService.instant(`assignment_poll_default_method`)!;
            //     }
            // }

            if (this.data.max_votes_per_option! > 1 && !this.pollService.isMaxVotesPerOptionEnabled()) {
                // Reset max_votes_per_option if a poll has been created with max_votes_per_option>1 but
                // afterwards this features was disabled. The value will be reset as soon as the options
                // of this poll are edited.
                this.data.max_votes_per_option = 1;
            }

            this.patchFormValues(this.contentForm);
            this.updateFormControls(this.data);
        }

        this.subscriptions.push(
            combineLatest([
                this.contentForm.valueChanges.pipe(startWith(``)),
                this.pollMethodControl.valueChanges.pipe(startWith(``)),
                this.pollTypeControl.valueChanges.pipe(startWith(``))
            ]).subscribe(([contentFormCh]) => {
                this.updateFormControls(contentFormCh);
            })
        );
    }

    /**
     * Updates the whole <poll-form />-component.
     *
     * @param update New data to pass into form-fields.
     */
    private updateFormControls(update: Partial<ViewPoll>): void {
        this.updatePollValues(update);
        this.updateGlobalVoteControls(update);
        this.updatePercentBases();
        this.setWarning();
    }

    /**
     * Generic recursive helper function to patch the form
     * will transitive move poll.min_votes_amount and poll.max_votes_amount into
     * form.votes_amount.min_votes_amount/max_votes_amount
     * @param formGroup
     */
    private patchFormValues(formGroup: FormGroup): void {
        for (const key of Object.keys(formGroup.controls)) {
            const currentControl = formGroup.controls[key];
            if (currentControl instanceof FormControl) {
                if (this.data[key as keyof ViewPoll]) {
                    currentControl.patchValue(this.data[key as keyof ViewPoll]);
                }
            } else if (currentControl instanceof FormGroup) {
                this.patchFormValues(currentControl);
            }
        }
    }

    private checkPollBackend(): void {
        if (!this.data.backend) {
            const pollType = this.data.content_object?.collection as PollClassType;
            this.data.backend = this.meetingSettingService.instant(`${pollType}_poll_default_backend`)!;
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
        const selectedPollMethod: PollMethod = this.pollMethodControl.value;
        return (selectedPollMethod === `Y` || selectedPollMethod === `N`) && (!data || !data.state || data.isCreated);
    }

    public showMaxVotesPerOption(data: any): boolean {
        const selectedPollMethod: PollMethod = this.pollMethodControl.value;
        return selectedPollMethod === `Y` && (!data || !data.state || data.isCreated);
    }

    /**
     * updates the available percent bases according to the pollmethod
     * @param method the currently chosen pollmethod
     */
    private updatePercentBases(): void {
        const method = this.pollMethodControl.value;
        const type = this.pollTypeControl.value;
        if (!method && !type) {
            return;
        }

        let forbiddenBases: any[] = [];
        if (method === PollMethod.YN) {
            forbiddenBases = [PollPercentBase.YNA, PollPercentBase.Y];
        } else if (method === PollMethod.YNA) {
            forbiddenBases = [PollPercentBase.Y];
        } else if (method === PollMethod.Y || PollMethod.N) {
            forbiddenBases = [PollPercentBase.YN, PollPercentBase.YNA];
        }

        if (type === PollType.Analog) {
            forbiddenBases.push(PollPercentBase.Entitled);
        }

        const bases: any = {};
        for (const [key, value] of Object.entries(this.percentBases)) {
            if (!forbiddenBases.includes(key)) {
                bases[key] = value;
            }
        }

        // update value in case that its no longer valid
        this.percentBaseControl.setValue(this.getNormedPercentBase(this.percentBaseControl.value, method, type), {
            emitEvent: false
        });

        this.validPercentBases = bases;
    }

    private getNormedPercentBase(base: PollPercentBase, method: PollMethod, type: PollType): PollPercentBase {
        if (method === PollMethod.YN && (base === PollPercentBase.YNA || base === PollPercentBase.Y)) {
            return PollPercentBase.YN;
        } else if (method === PollMethod.YNA && base === PollPercentBase.Y) {
            return PollPercentBase.YNA;
        } else if (method === PollMethod.Y && (base === PollPercentBase.YN || base === PollPercentBase.YNA)) {
            return PollPercentBase.Y;
        } else if (type === PollType.Analog && base === PollPercentBase.Entitled) {
            return PollPercentBase.Cast;
        }
        return base;
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

    public getValues(): Partial<ViewPoll> {
        return { ...this.data, ...this.serializeForm(this.contentForm) };
    }

    private serializeForm(formGroup: FormGroup): Partial<ViewPoll> {
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
    private updatePollValues(data: { [key: string]: any }): void {
        if (this.data) {
            const pollMethod: PollMethod = data['pollmethod'];
            const pollType: PollType = data['type'];
            this.pollValues = [
                [
                    this.pollService.getVerboseNameForKey(`type`),
                    this.pollService.getVerboseNameForValue(`type`, data['type'])
                ]
            ];
            // show pollmethod only for assignment polls
            if (this.isAssignmentPoll) {
                this.pollValues.push([
                    this.pollService.getVerboseNameForKey(`pollmethod`),
                    this.pollService.getVerboseNameForValue(`pollmethod`, data['pollmethod'])
                ]);
            }
            if (pollType !== PollType.Analog) {
                this.pollValues.push([
                    this.pollService.getVerboseNameForKey(`groups`),
                    data && data['entitled_group_ids'] && data['entitled_group_ids'].length
                        ? this.groupRepo.getNameForIds(...data['entitled_group_ids'])
                        : `---`
                ]);
            }

            if (pollMethod === PollMethod.Y || pollMethod === PollMethod.N) {
                this.pollValues.push([this.pollService.getVerboseNameForKey(`global_yes`), data['global_yes']]);
                this.pollValues.push([this.pollService.getVerboseNameForKey(`global_no`), data['global_no']]);
                this.pollValues.push([this.pollService.getVerboseNameForKey(`global_abstain`), data['global_abstain']]);
                this.pollValues.push([this.pollService.getVerboseNameForKey(`votes_amount`), data['votes_amount']]);
                this.pollValues.push([
                    this.pollService.getVerboseNameForKey(`max_votes_amount`),
                    data['max_votes_amount']
                ]);
                this.pollValues.push([
                    this.pollService.getVerboseNameForKey(`min_votes_amount`),
                    data['min_votes_amount']
                ]);
            }

            if (pollMethod === PollMethod.Y || pollMethod === PollMethod.N) {
                this.pollValues.push([
                    this.pollService.getVerboseNameForKey(`max_votes_per_option`),
                    data['max_votes_per_option']
                ]);
            }
        }
    }

    private initContentForm(): void {
        this.contentForm = this.fb.group({
            title: [``, Validators.required],
            type: [``, Validators.required],
            pollmethod: [``, Validators.required],
            onehundred_percent_base: [``, Validators.required],
            votes_amount: this.fb.group(
                {
                    max_votes_amount: [1, [Validators.required, Validators.min(1)]],
                    min_votes_amount: [1, [Validators.required, Validators.min(1)]],
                    max_votes_per_option: [1, [Validators.required, Validators.min(1)]]
                },
                { validators: isNumberRange(`min_votes_amount`, `max_votes_amount`) }
            ),
            entitled_group_ids: [],
            backend: [],
            global_yes: [false],
            global_no: [false],
            global_abstain: [false]
        });
    }

    private enableGlobalVoteControls(): void {
        const suppressEvent = {
            emitEvent: false
        };
        this.globalYesControl.enable(suppressEvent);
        this.globalNoControl.enable(suppressEvent);
        this.globalAbstainControl.enable(suppressEvent);
    }

    private updateGlobalVoteControls(data: Partial<ViewPoll>): void {
        const pollMethod = data.pollmethod;
        if (pollMethod) {
            const suppressEvent = {
                emitEvent: false
            };
            this.enableGlobalVoteControls();
            if (pollMethod.includes(PollMethod.Y)) {
                this.globalYesControl.disable(suppressEvent);
                this.globalYesControl.setValue(false, suppressEvent);
            }
            if (pollMethod.includes(PollMethod.N)) {
                this.globalNoControl.disable(suppressEvent);
                this.globalNoControl.setValue(false, suppressEvent);
            }
            if (pollMethod.includes(`A`)) {
                this.globalAbstainControl.disable(suppressEvent);
                this.globalAbstainControl.setValue(false, suppressEvent);
            }
        }
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
}
