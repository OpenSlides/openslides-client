import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';

import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../base/base-motion-detail-child.component';
import { MotionContentChangeRecommendationDialogComponentData } from '../../modules/motion-change-recommendation-dialog/components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionChangeRecommendationDialogService } from '../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

@Component({
    selector: `os-motion-content`,
    templateUrl: `./motion-content.component.html`,
    styleUrls: [`./motion-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionContentComponent extends BaseMotionDetailChildComponent {
    public readonly ChangeRecoMode = ChangeRecoMode;
    public readonly LineNumberingMode = LineNumberingMode;

    public get showPreamble(): boolean {
        return this.motion.showPreamble;
    }

    public get canChangeMetadata(): boolean {
        return this.perms.isAllowed(`change_metadata`, this.motion);
    }

    public get isParagraphBasedAmendment(): boolean {
        return this.motion.isParagraphBasedAmendment();
    }

    public get hasAttachments(): boolean {
        return this.motion.hasAttachments();
    }

    /**
     * Indicates the currently highlighted line, if any.
     */
    public highlightedLine!: number;

    public constructor(
        protected override translate: TranslateService,
        private dialog: MotionChangeRecommendationDialogService,
        private perms: MotionPermissionService
    ) {
        super();
    }

    /**
     * get the formatted motion text from the repository.
     *
     * @returns formatted motion texts
     */
    public getFormattedTextPlain(): string {
        // Prevent this.sortedChangingObjects to be reordered from within formatMotion
        let changes: ViewUnifiedChange[];
        if (this.changeRecoMode === ChangeRecoMode.Original) {
            changes = [];
        } else {
            changes = Object.assign([], this.getAllTextChangingObjects());
        }
        if (this.lineLength) {
            const formattedText = this.motionFormatService.formatMotion({
                targetMotion: this.motion,
                crMode: this.changeRecoMode,
                changes,
                lineLength: this.lineLength,
                highlightedLine: this.highlightedLine,
                firstLine: this.motion.firstLine
            });
            return formattedText;
        } else {
            return this.motion.text;
        }
    }

    /**
     * In the original version, a line number range has been selected in order to create a new change recommendation
     *
     * @param lineRange
     */
    public createChangeRecommendation(lineRange: LineRange): void {
        const data: MotionContentChangeRecommendationDialogComponentData = {
            editChangeRecommendation: false,
            newChangeRecommendation: true,
            lineRange,
            changeRecommendation: null,
            firstLine: this.motion.firstLine
        };
        if (this.motion.isParagraphBasedAmendment()) {
            try {
                const lineNumberedParagraphs = this.motionLineNumbering //
                    .getAllAmendmentParagraphsWithOriginalLineNumbers(this.motion, this.lineLength, false);
                data.changeRecommendation = this.changeRecoRepo.createAmendmentChangeRecommendationTemplate(
                    this.motion,
                    lineNumberedParagraphs,
                    lineRange
                );
            } catch (e) {
                console.error(e);
                return;
            }
        } else {
            data.changeRecommendation = this.changeRecoRepo.createMotionChangeRecommendationTemplate(
                this.motion,
                lineRange,
                this.lineLength
            );
        }
        this.dialog.openContentChangeRecommendationDialog(data);
    }

    public getChangesForDiffMode(): ViewUnifiedChange[] {
        return this.getAllChangingObjectsSorted().filter(change => {
            if (this.showAllAmendments) {
                return true;
            } else {
                return change.showInDiffView();
            }
        });
    }

    private getAllTextChangingObjects(): ViewUnifiedChange[] {
        return this.getAllChangingObjectsSorted().filter((obj: ViewUnifiedChange) => !obj.isTitleChange());
    }
}
