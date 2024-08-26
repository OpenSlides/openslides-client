import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';

import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { MotionContentChangeRecommendationDialogComponentData } from '../../../../modules/motion-change-recommendation-dialog/components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionChangeRecommendationDialogService } from '../../../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

@Component({
    selector: `os-motion-content`,
    templateUrl: `./motion-content.component.html`,
    styleUrls: [`./motion-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionContentComponent extends BaseMotionDetailChildComponent {
    public readonly ChangeRecoMode = ChangeRecoMode;
    public readonly LineNumberingMode = LineNumberingMode;

    @Input()
    public changeRecoMode: ChangeRecoMode;

    @Input()
    public lineNumberingMode: LineNumberingMode;

    private unifiedChanges$: Observable<ViewUnifiedChange[]> & { value: ViewUnifiedChange[] };

    @Input()
    public set unifiedChanges(
        value: ViewUnifiedChange[] | (Observable<ViewUnifiedChange[]> & { value: ViewUnifiedChange[] })
    ) {
        if (value !== this.unifiedChanges$) {
            if (value instanceof Observable) {
                this.unifiedChanges$ = value;
            } else {
                this.unifiedChanges$ = new BehaviorSubject(value);
            }

            this.updateObservables();
        }
    }

    public get unifiedChanges(): ViewUnifiedChange[] | Observable<ViewUnifiedChange[]> {
        return this.unifiedChanges$.value;
    }

    public changesForDiffMode$: Observable<ViewUnifiedChange[]> = null;
    public formattedTextPlain$: Observable<string> = null;

    public preamble$ = this.meetingSettingsService.get(`motions_preamble`);

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

    private updateObservables(): void {
        this.formattedTextPlain$ = combineLatest([
            this.meetingSettingsService.get(`motions_line_length`),
            this.unifiedChanges$
        ]).pipe(
            map(([lineLength, changes]) => {
                if (lineLength) {
                    return this.motionFormatService.formatMotion({
                        targetMotion: this.motion,
                        crMode: this.changeRecoMode,
                        changes: this.changeRecoMode === ChangeRecoMode.Original ? [] : changes,
                        lineLength: this.lineLength,
                        highlightedLine: this.highlightedLine,
                        firstLine: this.motion.firstLine
                    });
                }

                return this.motion.text;
            })
        );

        this.changesForDiffMode$ = combineLatest([this.showAllAmendments$, this.unifiedChanges$]).pipe(
            map(([_, changes]) =>
                changes.filter(change => {
                    if (this.showAllAmendments) {
                        return true;
                    } else {
                        return change.showInDiffView();
                    }
                })
            )
        );
    }
}
