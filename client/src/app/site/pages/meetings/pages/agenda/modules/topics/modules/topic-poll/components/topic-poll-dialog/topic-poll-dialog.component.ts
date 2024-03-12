import { AfterViewInit, Component, ElementRef, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Selectable } from 'src/app/domain/interfaces';
import {
    GeneralValueVerbose,
    LOWEST_VOTE_VALUE,
    PollMethod,
    PollPercentBaseVerbose,
    PollPropertyVerbose,
    PollTypeVerbose,
    VoteValue
} from 'src/app/domain/models/poll';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { ViewTopic } from '../../../../view-models';
import { TopicPollMethodVerbose } from '../../definitions';
import { TopicPollService } from '../../services/topic-poll.service';

let uniqueId = 0;
export class TextOptionSelectable implements Selectable {
    public readonly id = ++uniqueId;

    public constructor(private readonly text: string) {}

    public getTitle(): string {
        return this.text;
    }

    public getListTitle(): string {
        return `Options`;
    }
}

@Component({
    selector: `os-topic-poll-dialog`,
    templateUrl: `./topic-poll-dialog.component.html`,
    styleUrls: [`./topic-poll-dialog.component.scss`]
})
export class TopicPollDialogComponent extends BasePollDialogComponent implements AfterViewInit {
    @ViewChild(`scrollframe`, { static: false }) public scrollFrame: ElementRef;
    @ViewChildren(`item`) public itemElements: QueryList<any>;

    private scrollContainer: any;
    private isNearBottom = true;

    /**
     * List of accepted special non-numerical values.
     * See {@link PollService.specialPollVotes}
     */
    public specialValues: [number, string][];

    public generalValueVerbose = GeneralValueVerbose;
    public PollPropertyVerbose = PollPropertyVerbose;

    public PollMethodVerbose = TopicPollMethodVerbose;
    public PollPercentBaseVerbose = PollPercentBaseVerbose;
    public PollTypes = PollTypeVerbose;

    private minNumberOfOptions = 2;
    public optionsWarning = _(`There should be at least 2 options.`);

    public newOptions: TextOptionSelectable[] = [];
    public optionsSubject: BehaviorSubject<TextOptionSelectable[]> = new BehaviorSubject(this.newOptions);
    public optionInput = ``;

    public readonly globalValues = [`global_yes`, `global_no`, `global_abstain`];

    public get isEdit(): boolean {
        const viewPoll = this.pollData as Partial<ViewPoll>;
        return !!viewPoll.state; // no state means, its under creation
    }

    public override get formsValid(): boolean {
        this.submitOptionData();
        return super.formsValid;
    }

    public constructor(
        public topicPollService: TopicPollService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewTopic>
    ) {
        super(pollData);
        this.optionTypeText = true;
    }

    public ngAfterViewInit() {
        if (this.scrollFrame) {
            this.scrollContainer = this.scrollFrame.nativeElement;
            this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
        }
    }

    public override onBeforeInit(): void {
        this.subscriptions.push(
            this.pollForm.contentForm.valueChanges.pipe(debounceTime(150), distinctUntilChanged()).subscribe(() => {
                this.triggerUpdate();
            })
        );
    }

    protected getAnalogVoteFields(): VoteValue[] {
        const pollmethod = this.pollForm.contentForm.get(`pollmethod`).value;

        const analogPollValues: VoteValue[] = [];

        if (pollmethod === PollMethod.N) {
            analogPollValues.push(`N`);
        } else {
            analogPollValues.push(`Y`);

            if (pollmethod !== PollMethod.Y) {
                analogPollValues.push(`N`);
            }
            if (pollmethod === PollMethod.YNA) {
                analogPollValues.push(`A`);
            }
        }

        return analogPollValues;
    }

    protected getContentObjectsForOptions(): { text: string }[] {
        const optionsArray = [];
        this.newOptions.forEach(value => {
            optionsArray.push({ text: value.getTitle() });
        });
        return optionsArray;
    }

    public removeOption(item: TextOptionSelectable): void {
        this.newOptions.forEach((value, index) => {
            if (value.id === item.id) {
                this.newOptions.splice(index, 1);
            }
        });
        this.updateOptionsSubject();
    }

    public addNewOption(): void {
        const newOption = new TextOptionSelectable(this.optionInput);
        this.newOptions.push(newOption);
        this.optionInput = ``;
        this.updateOptionsSubject();
    }

    /**
     * Triggers an update of the sorting.
     */
    public onSortingChange(options: TextOptionSelectable[]): void {
        this.newOptions = options;
    }

    private updateOptionsSubject(): void {
        this.optionsSubject.next(this.newOptions);
    }

    private onItemElementsChanged(): void {
        if (this.isNearBottom) {
            this.scrollToBottom();
        }
    }

    private submitOptionData(): void {
        let key = 0;
        const transformedOptions = this.newOptions.mapToObject(option => {
            key++;
            return {
                [key.toString(10)]: this.formBuilder.group(
                    // The text for the option
                    {
                        text: [option.getTitle(), [Validators.required]],
                        // for each user, create a form group with a control for each valid input (Y, N, A)
                        ...this.analogVoteFields?.mapToObject(value => ({
                            [value]: [``, [Validators.min(LOWEST_VOTE_VALUE)]]
                        }))
                    }
                )
            };
        });
        this.dialogVoteForm.setControl(`options`, this.formBuilder.group(transformedOptions));
    }

    public hasEnoughVoteFormOptions(): boolean {
        const length = Object.keys(this.optionsFromVoteForm.controls).length;
        if (length < this.minNumberOfOptions) {
            return false;
        }
        return true;
    }

    public hasEnoughOptions(): boolean {
        const length = this.newOptions.length;
        if (length < this.minNumberOfOptions) {
            return false;
        }
        return true;
    }

    /**
     * Submits the values from dialog.
     */
    public override submitPoll(): void {
        if (!this.isEdit) {
            this.submitOptionData();
            if (!this.hasEnoughOptions()) {
                throw new Error(`Error: submitPoll called without neccessary amount of options.`);
            }
        }
        super.submitPoll();
    }

    private scrollToBottom(): void {
        if (this.scrollContainer) {
            this.scrollContainer.scroll({
                top: this.scrollContainer.scrollHeight,
                left: 0,
                behavior: `smooth`
            });
        }
    }

    private isUserNearBottom(): boolean {
        if (this.scrollContainer) {
            const threshold = 50;
            const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
            const height = this.scrollContainer.scrollHeight;
            return position > height - threshold;
        }
        return true;
    }

    public scrolled(_e: any): void {
        this.isNearBottom = this.isUserNearBottom();
    }
}
