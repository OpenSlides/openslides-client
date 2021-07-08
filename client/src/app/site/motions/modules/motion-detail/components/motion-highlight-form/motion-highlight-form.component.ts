import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { Subscription } from 'rxjs';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { LinenumberingService } from 'app/core/ui-services/linenumbering.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewUnifiedChange } from 'app/shared/models/motions/view-unified-change';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ChangeRecoMode, LineNumberingMode, verboseChangeRecoMode } from 'app/site/motions/motions.constants';
import { BaseMotionDetailChildComponent } from '../base/base-motion-detail-child.component';
import { MotionServiceCollectorService } from '../../../services/motion-service-collector.service';
import { ModifiedFinalVersionAction } from '../../../services/motion-view.service';

@Component({
    selector: 'os-motion-highlight-form',
    templateUrl: './motion-highlight-form.component.html',
    styleUrls: ['./motion-highlight-form.component.scss']
})
export class MotionHighlightFormComponent extends BaseMotionDetailChildComponent implements OnInit {
    public readonly LineNumberingMode = LineNumberingMode;
    public readonly ChangeRecoMode = ChangeRecoMode;

    public get crMode(): ChangeRecoMode {
        return this.viewService.currentChangeRecommendationMode;
    }

    public get lnMode(): LineNumberingMode {
        return this.viewService.currentLineNumberingMode;
    }

    public get hasChangeRecommendations(): boolean {
        if (!this.motion) {
            return false;
        }
        return this.changeRecoRepo.hasMotionChangeRecommendations(this.motion.id);
    }

    /**
     * Indicates the currently highlighted line, if any.
     */
    public highlightedLine: number;

    /**
     * Validator for checking the go to line number input field
     */
    public highlightedLineMatcher: ErrorStateMatcher;

    /**
     * Indicates if the highlight line form was opened
     */
    public highlightedLineOpened: boolean;

    /**
     * Holds the model for the typed line number
     */
    public highlightedLineTyping: number | string;

    /**
     * The change recommendations to amendments to this motion
     */
    public amendmentChangeRecos: { [amendmentId: string]: ViewMotionChangeRecommendation[] } = {};

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

    public get isStatuteAmendment(): boolean {
        return (!!this.isExisting && this.motion?.isStatuteAmendment()) || false;
    }

    public get isParagraphBasedAmendment(): boolean {
        return (this.isExisting && this.motion?.isParagraphBasedAmendment()) || false;
    }

    public get isExisting(): boolean {
        if (!this.motion) {
            return false;
        }
        return !!Object.keys(this.motion)?.length ?? false;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        motionServiceCollector: MotionServiceCollectorService,
        private linenumberingService: LinenumberingService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, motionServiceCollector);
    }

    public ngOnInit(): void {
        const self = this;
        this.highlightedLineMatcher = new (class implements ErrorStateMatcher {
            public isErrorState(control: FormControl): boolean {
                const value: string = control && control.value ? control.value + '' : '';
                const maxLineNumber = self.motionLineNumbering.getLastLineNumber(self.motion, self.lineLength);
                return value.match(/[^\d]/) !== null || parseInt(value, 10) >= maxLineNumber;
            }
        })();
    }

    /**
     * Highlights the line and scrolls to it
     * @param {number} line
     */
    public gotoHighlightedLine(line: number): void {
        const maxLineNumber = this.motionLineNumbering.getLastLineNumber(this.motion, this.lineLength);
        if (line >= maxLineNumber) {
            return;
        }

        this.highlightedLine = line;
        // setTimeout necessary for DOM-operations to work
        window.setTimeout(() => {
            const element = document.querySelector('mat-sidenav-content');

            // We only scroll if it's not in the screen already
            const bounding = element
                .querySelector('.os-line-number.line-number-' + line.toString(10))
                .getBoundingClientRect();
            if (bounding.top >= 0 && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                return;
            }

            let target: Element;
            // to make the selected line not stick at the very top of the screen, and to prevent it from being
            // conceiled from the header, we actually scroll to a element a little bit above.
            if (line > 4) {
                target = element.querySelector('.os-line-number.line-number-' + (line - 4).toString(10));
            } else {
                target = element.querySelector('.title-line');
            }
            target.scrollIntoView({ behavior: 'smooth' });
        }, 1);
    }

    /**
     * Sets the modified final version to the final version.
     */
    public async createModifiedFinalVersion(): Promise<void> {
        if (this.motion.isParagraphBasedAmendment()) {
            throw new Error('Cannot create a final version of an amendment.');
        }
        // Get the final version and remove line numbers
        const changes: ViewUnifiedChange[] = this.getAllChangingObjectsSorted().filter(changingObject =>
            changingObject.showInFinalView()
        );
        let finalVersion = this.motionLineNumbering.formatMotion(
            this.motion,
            ChangeRecoMode.Final,
            changes,
            this.lineLength,
            this.highlightedLine
        );
        finalVersion = this.linenumberingService.stripLineNumbers(finalVersion);

        // Update the motion
        try {
            // Just confirm this, if there is one modified final version the user would override.
            await this.repo.update({ modified_final_version: finalVersion }, this.motion);
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Deletes the modified final version
     */
    public async deleteModifiedFinalVersion(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete the print template?');
        if (await this.promptService.open(title)) {
            try {
                await this.repo.update({ modified_final_version: '' }, this.motion);
                this.setChangeRecoMode(this.determineCrMode(ChangeRecoMode.Diff));
            } catch (e) {
                this.raiseError(e);
            }
        }
    }

    /**
     * Submits the modified final version of the motion
     */
    public saveModifiedFinalVersion(): void {
        this.viewService.modifiedFinalVersionActionSubject.next(ModifiedFinalVersionAction.SAVE);
        this.isEditingFinalVersion = false;
    }

    public editModifiedFinalVersion(): void {
        this.viewService.modifiedFinalVersionActionSubject.next(ModifiedFinalVersionAction.EDIT);
        this.isEditingFinalVersion = true;
    }

    /**
     * Cancels the final version edit and resets the form value
     */
    public cancelEditingModifiedFinalVersion(): void {
        this.viewService.modifiedFinalVersionActionSubject.next(ModifiedFinalVersionAction.CANCEL);
        this.isEditingFinalVersion = false;
    }

    public setChangeRecoMode(mode: ChangeRecoMode): void {
        this.viewService.changeRecommendationModeSubject.next(mode);
    }

    public isRecoMode(mode: ChangeRecoMode): boolean {
        return this.crMode === mode;
    }

    /**
     * Sets the motions line numbering mode
     *
     * @param mode Needs to got the enum defined in ViewMotion
     */
    public setLineNumberingMode(mode: LineNumberingMode): void {
        this.viewService.lineNumberingModeSubject.next(mode);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.gotoHighlightedLine(parseInt(this.highlightedLineTyping as string, 10));
            this.highlightedLineTyping = '';
        }
    }

    /**
     * Tries to determine the realistic CR-Mode from a given CR mode
     */
    private determineCrMode(mode: ChangeRecoMode): ChangeRecoMode {
        if (mode === ChangeRecoMode.Final) {
            if (this.motion?.modified_final_version) {
                return ChangeRecoMode.ModifiedFinal;
                /**
                 * Because without change recos you cannot escape the final version anymore
                 */
            } else if (!this.hasChangeRecommendations) {
                return ChangeRecoMode.Original;
            }
        } else if (mode === ChangeRecoMode.Changed && !this.hasChangeRecommendations) {
            /**
             * Because without change recos you cannot escape the changed version view
             * You will not be able to automatically change to the Changed view after creating
             * a change reco. The autoupdate has to come "after" this routine
             */
            return ChangeRecoMode.Original;
        } else if (
            mode === ChangeRecoMode.Diff &&
            !this.hasChangeRecommendations &&
            this.motion?.isParagraphBasedAmendment()
        ) {
            /**
             * The Diff view for paragraph-based amendments is only relevant for change recommendations;
             * the regular amendment changes are shown in the "original" view.
             */
            return ChangeRecoMode.Original;
        }
        return mode;
    }

    protected getSubscriptions(): Subscription[] {
        return [
            this.meetingSettingService
                .get('motions_default_line_numbering')
                .subscribe(mode => this.setLineNumberingMode(mode)),
            this.meetingSettingService.get('motions_recommendation_text_mode').subscribe(mode => {
                if (mode) {
                    this.setChangeRecoMode(this.determineCrMode(mode as ChangeRecoMode));
                }
            })
        ];
    }
}
