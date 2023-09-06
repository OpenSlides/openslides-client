import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Renderer2
} from '@angular/core';
import { filter, firstValueFrom } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ModificationType } from 'src/app/domain/models/motions/motions.constants';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';
import { AutoupdateCommunicationService } from 'src/app/site/services/autoupdate/autoupdate-communication.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MOTION_DETAIL_SUBSCRIPTION } from '../../../../motions.subscription';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';

/**
 * This component displays either the original motion text or the original amendment diff text
 * with annotated change commendations and a method to create new change recommendations
 * from the line numbers to the left of the text.
 * It's called from motion-details for displaying the whole motion text as well as from the
 * motion's or amendment's diff view to show the unchanged parts of the motion.
 *
 * The line numbers are provided within the pre-rendered HTML, so we have to work with raw HTML
 * and native HTML elements.
 *
 * It takes the styling from the parent component.
 *
 * Special hints regarding amendments:
 * When used for paragraph-based amendments, this component is embedded once for each paragraph. Hence,
 * not all changeRecommendations provided are relevant for this paragraph (as we put the decision about
 * which changeRecommendations are relevant in this component, not the caller).
 * TODO: Right now, only change recommendations affecting only one paragraph are supported
 *
 * ## Examples
 *
 * ```html
 *  <os-motion-detail-original-change-recommendations
 *       [html]="getFormattedText()"
 *       [changeRecommendations]="changeRecommendations"
 *       (createChangeRecommendation)="createChangeRecommendation($event)"
 *       (gotoChangeRecommendation)="gotoChangeRecommendation($event)"
 * ></os-motion-detail-original-change-recommendations>
 * ```
 */
@Component({
    selector: `os-motion-detail-original-change-recommendations`,
    templateUrl: `./motion-detail-original-change-recommendations.component.html`,
    styleUrls: [`./motion-detail-original-change-recommendations.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionDetailOriginalChangeRecommendationsComponent implements OnInit /* , OnChanges */ {
    @Output()
    public createChangeRecommendation: EventEmitter<LineRange> = new EventEmitter<LineRange>();

    @Output()
    public gotoChangeRecommendation = new EventEmitter<ViewUnifiedChange>();

    @Input()
    public set html(html: string) {
        this._html = html;
        this.update();
        this.cd.markForCheck();
    }

    @Input()
    public motionId: number;

    public get html(): string {
        return this._html;
    }

    private _html = ``;

    @Input()
    public set changeRecommendations(recos: ViewUnifiedChange[]) {
        this._changeRecommendations = recos;
        this.setTextChangeRecommendations(recos);
    }
    public get changeRecommendations(): ViewUnifiedChange[] {
        return this._changeRecommendations;
    }

    public get textChangeRecommmendations(): ViewUnifiedChange[] {
        return this._textChangeRecommendations;
    }

    public showChangeRecommendations = true;

    public can_manage = true; // change

    private element!: Element;
    private selectedFrom: number | null = null;

    private _changeRecommendations: ViewUnifiedChange[] = [];
    private _textChangeRecommendations: ViewUnifiedChange[] = [];

    // Calculated from the embedded line numbers after the text has been set.
    // Hint: this numbering refers to the actual lines, not the line number markers;
    // hence, if maxLineNo === 10, line no. 10 is still visible.
    // This is semantically different from the diff algorithms.
    private minLineNo: number | null = null;
    private maxLineNo: number | null = null;

    private dataLoaded: boolean;

    public get textLoaded(): boolean {
        const motion = this.motionId ? this.controller.getViewModel(this.motionId) : undefined;
        return (
            !!this.dataLoaded ||
            (motion ? !!motion?.text || !!motion?.amendment_paragraphs || !!motion.statute_paragraph : false)
        );
    }

    public constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private cd: ChangeDetectorRef,
        private operator: OperatorService,
        private autoupdateCommunications: AutoupdateCommunicationService,
        private controller: MotionControllerService
    ) {
        this.operator.operatorUpdated.subscribe(() => this.checkPermissions());
        this.dataLoaded = this.autoupdateCommunications.hasReceivedDataForSubscription(MOTION_DETAIL_SUBSCRIPTION);
        this.setup();
    }

    // public ngDoCheck(): void {
    //     if (!this.minLineNo || !this.maxLineNo) {
    //         this.setLineNumberCache();
    //         this.cd.markForCheck();
    //     }
    // }

    /**
     * Adding the event listeners: clicking on plus signs next to line numbers
     * and the hover-event next to the line numbers
     */
    public ngOnInit(): void {
        const nativeElement = <Element>this.el.nativeElement;
        this.element = <Element>nativeElement.querySelector(`.text`);

        this.renderer.listen(this.el.nativeElement, `click`, (ev: MouseEvent) => {
            const element = <Element>ev.target;
            if (element.classList.contains(`os-line-number`) && element.classList.contains(`selectable`)) {
                this.clickedLineNumber(parseInt(element.getAttribute(`data-line-number`)!, 10));
            }
        });

        this.renderer.listen(this.el.nativeElement, `mouseover`, (ev: MouseEvent) => {
            const element = <Element>ev.target;
            if (element.classList.contains(`os-line-number`) && element.classList.contains(`selectable`)) {
                this.hoverLineNumber(parseInt(element.getAttribute(`data-line-number`)!, 10));
            }
        });

        this.update();

        // The positioning of the change recommendations depends on the rendered HTML
        // If we show it right away, there will be nasty Angular warnings about changed values, as the position
        // is changing while the DOM updates
        setTimeout(() => {
            this.checkPermissions();
            this.setLineNumberCache();
            this.setTextChangeRecommendations(this._changeRecommendations);
        }, 1);
    }

    // public ngOnChanges(): void {
    //     this.update();
    // }

    /**
     * Style for the change recommendation list
     * @param reco
     */
    public calcRecoTop(reco: ViewUnifiedChange): string {
        const from = <HTMLElement>(
            this.element.querySelector(`.os-line-number.line-number-` + reco.getLineFrom().toString(10))
        );
        return from.offsetTop.toString() + `px`;
    }

    /**
     * Style for the change recommendation list
     * @param reco
     */
    public calcRecoHeight(reco: ViewUnifiedChange): string {
        const from = <HTMLElement>(
            this.element.querySelector(`.os-line-number.line-number-` + reco.getLineFrom().toString(10))
        );
        const to = <HTMLElement>(
            this.element.querySelector(`.os-line-number.line-number-` + (reco.getLineTo() + 1).toString(10))
        );
        if (to) {
            return (to.offsetTop - from.offsetTop).toString() + `px`;
        } else {
            // Last line - lets assume a realistic value
            return `20px`;
        }
    }

    /**
     * Whether a change-recommendation is from type `insertion`. Necessary to apply a css-class to a dom-element.
     *
     * @param reco The change-recommendation to check.
     *
     * @returns A boolean that indicates if the given change-recommendation is from type `insertion`.
     */
    public isInsertionChangeRecommendation(reco: ViewUnifiedChange): boolean {
        return reco.getModificationType() === ModificationType.TYPE_INSERTION;
    }

    /**
     * Whether a change-recommendation is from type `deletion`. Necessary to apply a css-class to a dom-element.
     *
     * @param reco The change-recommendation to check.
     *
     * @returns A boolean that indicates if the given change-recommendation is from type `deletion`.
     */
    public isDeletionChangeRecommendation(reco: ViewUnifiedChange): boolean {
        return reco.getModificationType() === ModificationType.TYPE_DELETION;
    }

    /**
     * Whether a change-recommendation is from type `replacement`. Necessary to apply a css-class to a dom-element.
     *
     * @param reco The change-recommendation to check.
     *
     * @returns A boolean that indicates if the given change-recommendation is from type `replacement`.
     */
    public isReplacementChangeRecommendation(reco: ViewUnifiedChange): boolean {
        return reco.getModificationType() === ModificationType.TYPE_REPLACEMENT;
    }

    /**
     * Trigger the `gotoChangeRecommendation`-event
     * @param reco
     */
    public gotoReco(reco: ViewUnifiedChange): void {
        this.gotoChangeRecommendation.emit(reco);
    }

    private async setup(): Promise<void> {
        if (!this.dataLoaded) {
            await firstValueFrom(
                this.autoupdateCommunications
                    .listen()
                    .pipe(filter(data => data && data.description?.includes(MOTION_DETAIL_SUBSCRIPTION)))
            );
            this.dataLoaded = true;
            this.update();
        }
    }

    /**
     * Re-creates
     */
    private update(): void {
        if (!this.element || !this.textLoaded) {
            // Not yet initialized
            return;
        }
        this.element.innerHTML = this.html;

        this.startCreating();
    }

    /**
     * The permissions of the user have changed -> activate / deactivate editing functionality
     */
    private checkPermissions(): void {
        if (this.operator.hasPerms(Permission.motionCanManage)) {
            this.can_manage = true;
            if (this.selectedFrom === null) {
                this.startCreating();
            }
        } else {
            this.can_manage = false;
            this.selectedFrom = null;
            if (this.element) {
                Array.from(this.element.querySelectorAll(`.os-line-number`)).forEach((lineNumber: Element) => {
                    lineNumber.classList.remove(`selectable`);
                    lineNumber.classList.remove(`selected`);
                });
            }
        }
    }

    private setLineNumberCache(): void {
        Array.from(this.element.querySelectorAll(`.os-line-number`)).forEach((lineNumberEl: Element) => {
            const lineNumber = parseInt(lineNumberEl.getAttribute(`data-line-number`)!, 10);
            if (this.minLineNo === null || lineNumber < this.minLineNo) {
                this.minLineNo = lineNumber;
            }
            if (this.maxLineNo === null || lineNumber > this.maxLineNo) {
                this.maxLineNo = lineNumber;
            }
        });
    }

    /**
     * Returns an array with all line numbers that are currently affected by a change recommendation
     * and therefor not subject to further changes
     */
    private getAffectedLineNumbers(): number[] {
        const affectedLines: number[] = [];
        this.changeRecommendations.forEach((change: ViewUnifiedChange) => {
            if (change.isTitleChange()) {
                return;
            }
            for (let j = change.getLineFrom(); j < change.getLineTo(); j++) {
                affectedLines.push(j);
            }
        });
        return affectedLines;
    }

    /**
     * Resetting the selection. All selected lines are unselected, and the selectable lines are marked as such
     */
    private startCreating(): void {
        if (!this.can_manage || !this.element) {
            return;
        }

        const alreadyAffectedLines = this.getAffectedLineNumbers();
        Array.from(this.element.querySelectorAll(`.os-line-number`)).forEach((lineNumber: Element) => {
            lineNumber.classList.remove(`selected`);
            if (alreadyAffectedLines.indexOf(parseInt(lineNumber.getAttribute(`data-line-number`)!, 10)) === -1) {
                lineNumber.classList.add(`selectable`);
            } else {
                lineNumber.classList.remove(`selectable`);
            }
        });
    }

    /**
     * A line number has been clicked - either to start the selection or to finish it.
     *
     * @param lineNumber
     */
    private clickedLineNumber(lineNumber: number): void {
        if (this.selectedFrom === null) {
            this.selectedFrom = lineNumber;
        } else {
            if (lineNumber > this.selectedFrom) {
                this.createChangeRecommendation.emit({
                    from: this.selectedFrom,
                    to: lineNumber
                });
            } else {
                this.createChangeRecommendation.emit({
                    from: lineNumber,
                    to: this.selectedFrom
                });
            }
            this.selectedFrom = null;
            this.startCreating();
        }
    }

    /**
     * A line number is hovered. If we are in the process of selecting a line range and the hovered line is selectable,
     * the plus sign is shown for this line and all lines between the first selected line.
     *
     * @param lineNumberHovered
     */
    private hoverLineNumber(lineNumberHovered: number): void {
        if (this.selectedFrom === null) {
            return;
        }
        Array.from(this.element.querySelectorAll(`.os-line-number`)).forEach((lineNumber: Element) => {
            const line = parseInt(lineNumber.getAttribute(`data-line-number`)!, 10);
            if (
                (line >= this.selectedFrom! && line <= lineNumberHovered) ||
                (line >= lineNumberHovered && line <= this.selectedFrom!)
            ) {
                lineNumber.classList.add(`selected`);
            } else {
                lineNumber.classList.remove(`selected`);
            }
        });
    }

    private setTextChangeRecommendations(changeRecommendations: ViewUnifiedChange[]): void {
        this._textChangeRecommendations = changeRecommendations
            .filter(changeReco => !changeReco.isTitleChange())
            .filter(
                changeReco => changeReco.getLineFrom() >= this.minLineNo! && changeReco.getLineTo() <= this.maxLineNo!
            );
        this.cd.markForCheck();
    }
}
