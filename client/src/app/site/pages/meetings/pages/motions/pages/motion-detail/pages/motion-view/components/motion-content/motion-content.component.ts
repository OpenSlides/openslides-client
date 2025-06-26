import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { ViewMeetingMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';

import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { ViewMotion } from '../../../../../../view-models';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { MotionContentChangeRecommendationDialogComponentData } from '../../../../modules/motion-change-recommendation-dialog/components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionChangeRecommendationDialogService } from '../../../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

@Component({
    selector: `os-motion-content`,
    templateUrl: `./motion-content.component.html`,
    styleUrls: [`./motion-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionContentComponent extends BaseMotionDetailChildComponent {
    public readonly ChangeRecoMode = ChangeRecoMode;
    public readonly LineNumberingMode = LineNumberingMode;

    private _changeRecoMode: ChangeRecoMode;

    @Input()
    public noEditMode = false;

    @Input()
    public set changeRecoMode(value: ChangeRecoMode) {
        this._changeRecoMode = value;

        this.updateFormatedText.emit();
        this.cd.markForCheck();
    }

    public get changeRecoMode(): ChangeRecoMode {
        return this._changeRecoMode;
    }

    @Input()
    public lineNumberingMode: LineNumberingMode;

    @Input()
    public set showAllAmendments(value: boolean) {
        if (value != this.showAllAmendments) {
            this.showAllAmendments$.next(value);
        }
    }

    public get showAllAmendments(): boolean {
        return this.showAllAmendments$.value;
    }

    public showAllAmendments$ = new BehaviorSubject(false);

    private unifiedChanges$: Observable<ViewUnifiedChange[]> & { value: ViewUnifiedChange[] } = new BehaviorSubject([]);

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

    @Input()
    public originMotionsLoaded: ViewMotion[] = [];

    @Output()
    public updateCrMode = new EventEmitter<ChangeRecoMode>();

    public updateFormatedText = new EventEmitter<void>();

    public scrollToChange: ViewUnifiedChange | null = null;

    public changesForDiffMode$: Observable<ViewUnifiedChange[]> = null;
    public formattedTextPlain$: Observable<string> = null;

    public preamble$ = this.meetingSettingsService.get(`motions_preamble`);

    public get showPreamble(): boolean {
        return this.motion.showPreamble;
    }

    public get showReason(): boolean {
        return !!this.motion.reason?.replace(/<p>/, ``).replace(/<\/p>/, ``).trim();
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

    public get sortedAttachments$(): Observable<ViewMeetingMediafile[]> {
        return this.motion.attachment_meeting_mediafiles$.pipe(
            map(files => files.sort((a, b) => a.getTitle().localeCompare(b.getTitle())))
        );
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

    /**
     * In the original version, a change-recommendation-annotation has been clicked
     * -> Go to the diff view and scroll to the change recommendation
     */
    public gotoChangeRecommendation(changeRecommendation: ViewUnifiedChange): void {
        this.scrollToChange = changeRecommendation;
        this.updateCrMode.emit(ChangeRecoMode.Diff);
    }

    protected override onAfterSetMotion(): void {
        this.updateFormatedText.emit();
    }

    private updateObservables(): void {
        this.formattedTextPlain$ = combineLatest([
            this.meetingSettingsService.get(`motions_line_length`),
            this.unifiedChanges$,
            this.updateFormatedText.pipe(startWith(undefined))
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
