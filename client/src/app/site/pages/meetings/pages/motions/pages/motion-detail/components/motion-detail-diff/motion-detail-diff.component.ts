import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';
import { HEAD_BAR_HEIGHT } from 'src/app/ui/modules/head-bar/components/head-bar/head-bar.component';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { getRecommendationTypeName } from '../../../../definitions/recommendation-type-names';
import { ViewUnifiedChangeType } from '../../../../modules/change-recommendations/definitions/index';
import {
    LineNumberedString,
    LineNumberingService
} from '../../../../modules/change-recommendations/services/line-numbering.service/line-numbering.service';
import { MotionChangeRecommendationControllerService } from '../../../../modules/change-recommendations/services/motion-change-recommendation-controller.service/motion-change-recommendation-controller.service';
import { MotionDiffService } from '../../../../modules/change-recommendations/services/motion-diff.service/motion-diff.service';
import { ViewMotionChangeRecommendation } from '../../../../modules/change-recommendations/view-models/view-motion-change-recommendation';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionLineNumberingService } from '../../../../services/common/motion-line-numbering.service/motion-line-numbering.service';
import { ViewMotionAmendedParagraph } from '../../../../view-models/view-motion-amended-paragraph';
import { MotionContentChangeRecommendationDialogComponentData } from '../../modules/motion-change-recommendation-dialog/components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionTitleChangeRecommendationDialogComponentData } from '../../modules/motion-change-recommendation-dialog/components/motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';
import { MotionChangeRecommendationDialogService } from '../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

/**
 * This component displays the original motion text with the change blocks inside.
 * If the user is an administrator, each change block can be rejected.
 *
 * The line numbers are provided within the pre-rendered HTML, so we have to work with raw HTML
 * and native HTML elements.
 *
 * It takes the styling from the parent component.
 *
 * ## Examples
 *
 * ```html
 *  <os-motion-detail-diff
 *       [motion]="motion"
 *       [changes]="changes"
 *       [scrollToChange]="change"
 *       [highlightedLine]="highlightedLine"
 *       [lineNumberingMode]="lnMode"
 *       [showAllAmendments]="showAllAmendments"
 *       (createChangeRecommendation)="createChangeRecommendation($event)"
 * ></os-motion-detail-diff>
 * ```
 */
@Component({
    selector: `os-motion-detail-diff`,
    templateUrl: `./motion-detail-diff.component.html`,
    styleUrls: [`./motion-detail-diff.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MotionDetailDiffComponent extends BaseMeetingComponent implements AfterViewInit {
    /**
     * Get the {@link getRecommendationTypeName}-Function from Utils
     */
    public getRecommendationTypeName = getRecommendationTypeName;

    @Input()
    public motion!: ViewMotion;

    @Input()
    public changes: ViewUnifiedChange[] = [];

    @Input()
    public scrollToChange: ViewUnifiedChange | null = null;

    @Input()
    public highlightedLine!: number;

    @Input()
    public lineNumberingMode!: LineNumberingMode;

    @Input()
    public showAllAmendments = false;

    @Input()
    public showSummary = true;

    @Input()
    public set showPreamble(value: boolean) {
        this._showPreamble = value;
    }

    public get showPreamble(): boolean {
        return this.motion.showPreamble ? this._showPreamble : false;
    }

    @Input()
    public lineRange: LineRange | null = null;

    @Output()
    public createChangeRecommendation: EventEmitter<LineRange> = new EventEmitter<LineRange>();

    /**
     * Indicates the maximum line length as defined in the configuration.
     */
    public lineLength!: number;

    public preamble!: string;

    private _showPreamble = true;

    public get nativeElement(): any {
        return this.el.nativeElement;
    }

    public constructor(
        protected override translate: TranslateService,
        private diff: MotionDiffService,
        private lineNumbering: LineNumberingService,
        private recoRepo: MotionChangeRecommendationControllerService,
        private motionRepo: MotionControllerService,
        private motionLineNumbering: MotionLineNumberingService,
        private el: ElementRef,
        private promptService: PromptService,
        private dialog: MotionChangeRecommendationDialogService
    ) {
        super();
        this.meetingSettingsService.get(`motions_line_length`).subscribe(lineLength => (this.lineLength = lineLength));
        this.meetingSettingsService.get(`motions_preamble`).subscribe(preamble => (this.preamble = preamble));
    }

    /**
     * Returns the part of this motion between two change objects
     * @param {ViewUnifiedChange} change1
     * @param {ViewUnifiedChange} change2
     */
    public getTextBetweenChanges(change1: ViewUnifiedChange, change2: ViewUnifiedChange): string {
        // @TODO Highlighting
        const lineRange: LineRange = {
            from: change1 ? change1.getLineTo() + 1 : this.lineRange?.from ?? this.motion.firstLine,
            to: change2 ? change2.getLineFrom() - 1 : this.lineRange?.to ?? null
        };

        if (lineRange.from > lineRange.to && change1 && change2) {
            // Empty space between two amendments, or between colliding amendments
            return ``;
        }

        let baseText: LineNumberedString = ``;
        if (this.motion.isParagraphBasedAmendment()) {
            try {
                baseText = this.motionLineNumbering
                    .getAllAmendmentParagraphsWithOriginalLineNumbers(this.motion, this.lineLength, true)
                    .join(`\n`);
            } catch (e) {
                console.error(e);
                return ``;
            }
        } else {
            baseText = this.lineNumbering.insertLineNumbers({
                html: this.motion.text,
                lineLength: this.lineLength,
                firstLine: this.motion.firstLine
            });
        }

        return this.diff.extractMotionLineRange(baseText, lineRange, true, this.lineLength, this.highlightedLine);
    }

    /**
     * Returns true if this change is colliding with another change
     * @param {ViewUnifiedChange} change
     * @param {ViewUnifiedChange[]} changes
     */
    public hasCollissions(change: ViewUnifiedChange, changes: ViewUnifiedChange[]): boolean {
        return this.diff.changeHasCollissions(change, changes);
    }

    /**
     * Returns the diff string from the motion to the change
     * @param {ViewUnifiedChange} change
     */
    public getDiff(change: ViewUnifiedChange): string {
        let motionHtml: string;
        if (this.motion.isParagraphBasedAmendment()) {
            const parentMotion = this.motionRepo.getViewModel(this.motion.lead_motion_id)!;
            motionHtml = parentMotion.text;
        } else {
            motionHtml = this.motion.text;
        }
        const baseHtml = this.lineNumbering.insertLineNumbers({
            html: motionHtml,
            lineLength: this.lineLength,
            firstLine: this.motion.lead_motion?.firstLine ?? this.motion.firstLine
        });
        return this.diff.getChangeDiff(baseHtml, change, this.lineLength, this.highlightedLine);
    }

    /**
     * Returns the remainder text of the motion after the last change
     */
    public getTextRemainderAfterLastChange(): string {
        if (!this.lineLength) {
            return ``; // @TODO This happens in the test case when the lineLength-variable is not set
        }
        let baseText: LineNumberedString;
        if (this.motion.isParagraphBasedAmendment()) {
            try {
                baseText = this.motionLineNumbering
                    .getAllAmendmentParagraphsWithOriginalLineNumbers(this.motion, this.lineLength, true)
                    .join(`\n`);
            } catch (e) {
                console.error(e);
                return ``;
            }
        } else {
            baseText = this.lineNumbering.insertLineNumbers({
                html: this.motion.text,
                lineLength: this.lineLength,
                firstLine: this.motion.firstLine
            });
        }

        return this.diff.getTextRemainderAfterLastChange(
            baseText,
            this.getAllTextChangingObjects(),
            this.lineLength,
            this.highlightedLine,
            this.lineRange
        );
    }

    /**
     * If only one line is affected, the line number is returned; otherwise, a string like [line] "1 - 5"
     *
     * @param {ViewUnifiedChange} change
     * @returns string
     */
    public formatLineRange(change: ViewUnifiedChange): string {
        if (change.getLineFrom() < change.getLineTo()) {
            return change.getLineFrom().toString(10) + ` - ` + change.getLineTo().toString(10);
        } else {
            return change.getLineFrom().toString(10);
        }
    }

    /**
     * Returns true if the change is a Change Recommendation
     *
     * @param {ViewUnifiedChange} change
     */
    public isRecommendation(change: ViewUnifiedChange): boolean {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    /**
     * Returns true if no line numbers are to be shown.
     *
     * @returns whether there are line numbers at all
     */
    public isLineNumberingNone(): boolean {
        return this.lineNumberingMode === LineNumberingMode.None;
    }

    /**
     * Returns true if the line numbers are to be shown within the text with no line breaks.
     *
     * @returns whether the line numberings are inside
     */
    public isLineNumberingInline(): boolean {
        return this.lineNumberingMode === LineNumberingMode.Inside;
    }

    /**
     * Returns true if the line numbers are to be shown to the left of the text.
     *
     * @returns whether the line numberings are outside
     */
    public isLineNumberingOutside(): boolean {
        return this.lineNumberingMode === LineNumberingMode.Outside;
    }

    /**
     * Returns true if the change is an Amendment
     *
     * @param {ViewUnifiedChange} change
     */
    public isAmendment(change: ViewUnifiedChange): change is ViewMotionAmendedParagraph {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_AMENDMENT;
    }

    /**
     * Returns true if the change is a Change Recommendation
     *
     * @param {ViewUnifiedChange} change
     */
    public isChangeRecommendation(change: ViewUnifiedChange): boolean {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    public getAllTextChangingObjects(): ViewUnifiedChange[] {
        const inRange = (from: number, to: number): boolean => {
            if (!this.lineRange) {
                return true;
            }

            return (
                (this.lineRange.from <= from && this.lineRange.to >= from) ||
                (this.lineRange.from <= to && this.lineRange.to >= to)
            );
        };

        return this.changes.filter(
            (obj: ViewUnifiedChange) => !obj.isTitleChange() && inRange(obj.getLineFrom(), obj.getLineTo())
        );
    }

    public getTitleChangingObject(): ViewUnifiedChange {
        return this.changes.find((obj: ViewUnifiedChange) => obj.isTitleChange())!;
    }

    public getFormattedTitleDiff(): string {
        const change = this.getTitleChangingObject();
        return this.recoRepo.getTitleChangesAsDiff(this.motion.title, change);
    }

    /**
     * Sets a change recommendation to accepted or rejected.
     * The template has to make sure only to pass change recommendations to this method.
     *
     * @param {ViewMotionChangeRecommendation} change
     * @param {string} value
     */
    public async setAcceptanceValue(change: ViewMotionChangeRecommendation, value: string): Promise<void> {
        try {
            if (value === `accepted`) {
                await this.recoRepo.setAccepted(change);
            }
            if (value === `rejected`) {
                await this.recoRepo.setRejected(change);
            }
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Sets if a change recommendation is internal or not
     *
     * @param {ViewMotionChangeRecommendation} change
     * @param {boolean} internal
     */
    public setInternal(change: ViewMotionChangeRecommendation, internal: boolean): void {
        this.recoRepo.setInternal(change, internal).catch(this.raiseError);
    }

    /**
     * Deletes a change recommendation.
     * The template has to make sure only to pass change recommendations to this method.
     *
     * @param {ViewMotionChangeRecommendation} reco
     * @param {MouseEvent} $event
     */
    public async deleteChangeRecommendation(reco: ViewMotionChangeRecommendation, $event: MouseEvent): Promise<void> {
        $event.stopPropagation();
        $event.preventDefault();
        const title = this.translate.instant(`Are you sure you want to delete this change recommendation?`);
        if (await this.promptService.open(title)) {
            await this.recoRepo.delete(reco).catch(this.raiseError);
        }
    }

    /**
     * Edits a change recommendation.
     * The template has to make sure only to pass change recommendations to this method.
     *
     * @param {ViewMotionChangeRecommendation} reco
     * @param {MouseEvent} $event
     */
    public editChangeRecommendation(reco: ViewMotionChangeRecommendation, $event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();

        const data: MotionContentChangeRecommendationDialogComponentData = {
            editChangeRecommendation: true,
            newChangeRecommendation: false,
            lineRange: {
                from: reco.getLineFrom(),
                to: reco.getLineTo()
            },
            changeRecommendation: reco.getModel(),
            firstLine: reco.motion.firstLine
        };
        this.dialog.openContentChangeRecommendationDialog(data);
    }

    public editTitleChangeRecommendation(reco: ViewMotionChangeRecommendation, $event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();

        const data: MotionTitleChangeRecommendationDialogComponentData = {
            editChangeRecommendation: true,
            newChangeRecommendation: false,
            changeRecommendation: reco
        };
        this.dialog.openTitleChangeRecommendationDialog(data);
    }

    public setAmendmentState(change: ViewUnifiedChange, state: Id | null): void {
        this.motionRepo
            .setState(state, (change as ViewMotionAmendedParagraph).amendment)
            .resolve()
            .catch(this.raiseError);
    }

    public resetAmendmentState(change: ViewUnifiedChange): void {
        this.motionRepo
            .resetState((change as ViewMotionAmendedParagraph).amendment)
            .resolve()
            .catch(this.raiseError);
    }

    /**
     * Scrolls to the native element specified by [scrollToChange]
     */
    private scrollToChangeElement(change: ViewUnifiedChange): void {
        const element = <HTMLElement>this.el.nativeElement;
        const target = element.querySelector(`.diff-box-${change.getChangeId()}`);
        const containerElement = document.querySelector(`mat-sidenav-content`);
        containerElement!.scrollTo({
            top: target!.getBoundingClientRect().top - HEAD_BAR_HEIGHT,
            behavior: `smooth`
        });
    }

    public scrollToChangeClicked(change: ViewUnifiedChange, $event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.scrollToChangeElement(change);
    }

    /**
     * Called from motion-detail-original-change-recommendations -> delegate to parent
     *
     * @param {LineRange} event
     */
    public onCreateChangeRecommendation(event: LineRange): void {
        this.createChangeRecommendation.emit(event);
    }

    public ngAfterViewInit(): void {
        if (this.scrollToChange) {
            window.setTimeout(() => {
                this.scrollToChangeElement(this.scrollToChange!);
            }, 50);
        }
    }
}
