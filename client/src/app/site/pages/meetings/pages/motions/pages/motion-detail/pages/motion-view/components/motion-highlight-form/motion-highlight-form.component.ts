import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { filter, firstValueFrom } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { verboseChangeRecoMode } from '../../../../../../../../../../../domain/models/motions/motions.constants';
import { LineNumberingService } from '../../../../../../modules/change-recommendations/services/line-numbering.service/line-numbering.service';
import { ViewUnifiedChange } from '../../../../../../modules/change-recommendations/view-models/view-unified-change';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { ModifiedFinalVersionAction } from '../../../../services/motion-detail-view.service';

@Component({
    selector: `os-motion-highlight-form`,
    templateUrl: `./motion-highlight-form.component.html`,
    styleUrls: [`./motion-highlight-form.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionHighlightFormComponent extends BaseMotionDetailChildComponent implements OnInit {
    public readonly LineNumberingMode = LineNumberingMode;
    public readonly ChangeRecoMode = ChangeRecoMode;

    @ViewChild(MatMenuTrigger)
    private readonly lineNumberMenuTrigger!: MatMenuTrigger;

    @Input()
    public noEdit = false;

    @Input()
    public lineNumberingMode: LineNumberingMode;

    @Input()
    public changeRecoMode: ChangeRecoMode;

    @Input()
    public hasChangingObjects = false;

    @Output()
    public updateLnMode = new EventEmitter<LineNumberingMode>();

    @Output()
    public updateCrMode = new EventEmitter<ChangeRecoMode>();

    public get hasChangeRecommendations(): boolean {
        if (!this.motion) {
            return false;
        }
        return this.changeRecoRepo.hasMotionChangeRecommendations(this.motion.id);
    }

    /**
     * Indicates the currently highlighted line, if any.
     */
    public highlightedLine?: number;

    public startLineNumber!: number;

    /**
     * Validator for checking the go to line number input field
     */
    public highlightedLineMatcher?: ErrorStateMatcher;

    /**
     * Indicates if the highlight line form was opened
     */
    public highlightedLineOpened = false;

    /**
     * Holds the model for the typed line number
     */
    public highlightedLineTyping?: number | string;

    /**
     * The change recommendations to amendments to this motion
     */
    public amendmentChangeRecos: Record<string, ViewMotionChangeRecommendation[]> = {};

    public verboseChangeRecoMode = verboseChangeRecoMode;

    public isEditingFinalVersion = false;

    public get showCreateFinalVersionButton(): boolean {
        const isModifiedFinalVersion = this.isExisting && this.motion?.modified_final_version;
        const isFinalState = this.isExisting && this.motion?.state && this.motion?.state.isFinalState;
        if (this.isParagraphBasedAmendment || !isFinalState || isModifiedFinalVersion) {
            return false;
        }
        return true;
    }

    public get isParagraphBasedAmendment(): boolean {
        return (this.isExisting && this.motion?.isParagraphBasedAmendment()) || false;
    }

    public get isExisting(): boolean {
        if (!this.motion) {
            return false;
        }
        return !!Object.keys(this.motion)?.length;
    }

    public get isMobile(): boolean {
        return this.vpService.isMobile;
    }

    public constructor(
        protected override translate: TranslateService,
        private lineNumberingService: LineNumberingService,
        private promptService: PromptService,
        private vpService: ViewPortService
    ) {
        super();
    }

    public ngOnInit(): void {
        const maxLineNumber = this.motionLineNumbering.getLastLineNumber(this.motion, this.lineLength);
        this.highlightedLineMatcher = new (class implements ErrorStateMatcher {
            public isErrorState(control: UntypedFormControl): boolean {
                const value: string = control && control.value ? control.value + `` : ``;
                return value.match(/[^\d]/) !== null || parseInt(value, 10) >= maxLineNumber;
            }
        })();
    }

    /**
     * Highlights the line and scrolls to it
     * @param {number} line
     */
    public gotoHighlightedLine(line: number | string): void {
        if (typeof line === `string`) {
            line = Number(line);
        }
        const maxLineNumber = this.motionLineNumbering.getLastLineNumber(this.motion, this.lineLength);
        if (line >= maxLineNumber) {
            return;
        }

        this.highlightedLine = line;
        // setTimeout necessary for DOM-operations to work
        window.setTimeout(() => {
            const element = document.querySelector(`mat-sidenav-content`)!;

            // We only scroll if it's not in the screen already
            const bounding = element
                .querySelector(`.os-line-number.line-number-` + line.toString(10))!
                .getBoundingClientRect();
            if (bounding.top >= 0 && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                return;
            }

            let target: Element | null;
            // to make the selected line not stick at the very top of the screen, and to prevent it from being
            // conceiled from the header, we actually scroll to a element a little bit above.
            if ((line as number) > 4) {
                target = element.querySelector(`.os-line-number.line-number-` + ((line as number) - 4).toString(10));
            } else {
                target = element.querySelector(`.title-line`);
            }
            target?.scrollIntoView({ behavior: `smooth` });
        }, 1);
    }

    /**
     * Sets the modified final version to the final version.
     */
    public async createModifiedFinalVersion(): Promise<void> {
        if (this.motion.isParagraphBasedAmendment()) {
            throw new Error(`Cannot create a final version of an amendment.`);
        }
        // Get the final version and remove line numbers
        const changeRecommendations = await firstValueFrom(
            this.changeRecoRepo.getChangeRecosOfMotionObservable(this.motion.id).pipe(filter(value => !!value))
        );
        const amendments = await firstValueFrom(
            this.amendmentRepo.getViewModelListObservableFor(this.motion).pipe(filter(value => !!value))
        );
        const changes: ViewUnifiedChange[] = this.motionLineNumbering
            .recalcUnifiedChanges(
                this.lineLength,
                changeRecommendations as ViewMotionChangeRecommendation[],
                amendments
            )
            .filter(changingObject => changingObject.showInFinalView());
        let finalVersion = this.motionFormatService.formatMotion({
            targetMotion: this.motion,
            crMode: ChangeRecoMode.Final,
            changes,
            lineLength: this.lineLength,
            highlightedLine: this.highlightedLine
        });
        finalVersion = this.lineNumberingService.stripLineNumbers(finalVersion);

        // Update the motion
        try {
            // Just confirm this, if there is one modified final version the user would override.
            this.repo.update({ modified_final_version: finalVersion }, this.motion).resolve();
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Deletes the editorial final version
     */
    public async deleteModifiedFinalVersion(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete the editorial final version?`);
        if (await this.promptService.open(title)) {
            try {
                await this.repo.update({ modified_final_version: `` }, this.motion).resolve();
                this.cancelEditingModifiedFinalVersion();
                this.setChangeRecoMode(ChangeRecoMode.Final);
            } catch (e) {
                this.raiseError(e);
            }
        }
    }

    /**
     * Submits the editorial/modified final version of the motion
     */
    public saveModifiedFinalVersion(): void {
        this.viewService.modifiedFinalVersionActionSubject.next(ModifiedFinalVersionAction.SAVE);
        this.isEditingFinalVersion = false;
    }

    public editModifiedFinalVersion(): void {
        this.viewService.modifiedFinalVersionActionSubject.next(ModifiedFinalVersionAction.EDIT);
        this.isEditingFinalVersion = true;
    }

    public updateStartLineNumber(): void {
        this.repo.update({ start_line_number: this.startLineNumber }, this.motion).resolve();
        this.lineNumberMenuTrigger.closeMenu();
    }

    public resetStartLineNumber(): void {
        this.startLineNumber = this.motion?.start_line_number || 1;
        this.lineNumberMenuTrigger.closeMenu();
    }

    /**
     * Cancels the final version edit and resets the form value
     */
    public cancelEditingModifiedFinalVersion(): void {
        this.viewService.modifiedFinalVersionActionSubject.next(ModifiedFinalVersionAction.CANCEL);
        this.isEditingFinalVersion = false;
    }

    public setChangeRecoMode(mode: ChangeRecoMode): void {
        this.updateCrMode.emit(mode);
    }

    public isRecoMode(mode: ChangeRecoMode): boolean {
        return this.changeRecoMode === mode;
    }

    /**
     * Sets the motions line numbering mode
     *
     * @param mode Needs to got the enum defined in ViewMotion
     */
    public setLineNumberingMode(mode: LineNumberingMode): void {
        this.updateLnMode.emit(mode);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter`) {
            this.gotoHighlightedLine(parseInt(this.highlightedLineTyping as string, 10));
            this.highlightedLineTyping = ``;
        }
    }

    protected override onAfterInit(): void {
        this.startLineNumber = this.motion?.start_line_number || 1;
    }
}
