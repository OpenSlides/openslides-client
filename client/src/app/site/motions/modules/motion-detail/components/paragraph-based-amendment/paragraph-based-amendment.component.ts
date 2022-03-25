import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UnsafeHtml } from 'app/core/definitions/key-types';
import { ParagraphToChoose } from 'app/core/repositories/motions/motion-line-numbering.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DiffLinesInParagraph, LineRange } from 'app/core/ui-services/diff.service';
import { ViewUnifiedChange } from 'app/shared/models/motions/view-unified-change';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';

import { MotionServiceCollectorService } from '../../../services/motion-service-collector.service';
import { BaseMotionDetailChildComponent } from '../base/base-motion-detail-child.component';

interface ParagraphBasedAmendmentContent {
    amendment_paragraph_$: { [paragraph_number: number]: any };
    selected_paragraphs: ParagraphToChoose[];
    broken_paragraphs: string[];
}

@Component({
    selector: `os-paragraph-based-amendment`,
    templateUrl: `./paragraph-based-amendment.component.html`,
    styleUrls: [`./paragraph-based-amendment.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParagraphBasedAmendmentComponent extends BaseMotionDetailChildComponent {
    public readonly LineNumberingMode = LineNumberingMode;
    public readonly ChangeRecoMode = ChangeRecoMode;

    @Input()
    public changesForDiffMode: ViewUnifiedChange[] = [];

    @Input()
    public highlightedLine: number;

    @Input()
    public isFinalEdit = false;

    @Output()
    public createChangeRecommendation = new EventEmitter<LineRange>();

    @Output()
    public formChanged = new EventEmitter<any>();

    @Output()
    public validStateChanged = new EventEmitter<boolean>();

    public showAmendmentContext = false;

    public selectedParagraphs = [];

    public brokenParagraphs = [];

    public contentForm: FormGroup;

    public amendmentErrorMessage: string | null = null;

    public get amendmentLines(): DiffLinesInParagraph[] | undefined {
        return this.motion?.changedAmendmentLines;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        motionServiceCollector: MotionServiceCollectorService,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate, motionServiceCollector);
    }

    /**
     * This returns the plain HTML of a changed area in an amendment, including its context,
     * for the purpose of piping it into <motion-detail-original-change-recommendations>.
     * This component works with plain HTML, hence we are composing plain HTML here, too.
     *
     * @param {DiffLinesInParagraph} paragraph
     * @returns {string}
     *
     * TODO: Seems to be directly duplicated in the slide
     */
    public getAmendmentDiffTextWithContext(paragraph: DiffLinesInParagraph): UnsafeHtml {
        return (
            `<div class="paragraphcontext">${paragraph.textPre}</div>` +
            `<div>${paragraph.text}</div>` +
            `<div class="paragraphcontext">${paragraph.textPost}</div>`
        );
    }

    /**
     * If `this.motion` is an amendment, this returns the list of all changed paragraphs.
     *
     * @returns {DiffLinesInParagraph[]}
     */
    public getAmendmentParagraphs(): DiffLinesInParagraph[] {
        try {
            this.amendmentErrorMessage = null;
            return this.motion?.getAmendmentParagraphLines(this.showAmendmentContext) || [];
        } catch (e) {
            this.amendmentErrorMessage = e.toString();
            return [];
        }
    }

    public getAmendmentParagraphLinesTitle(paragraph: DiffLinesInParagraph): string {
        return this.motion?.getParagraphTitleByParagraph(paragraph) || ``;
    }

    public isControlInvalid(paragraphNumber: number): boolean {
        const control = this.contentForm.get(paragraphNumber.toString());
        return control.invalid && (control.dirty || control.touched);
    }

    protected onEnterEditMode(): void {
        if (this.contentForm) {
            this.contentForm = null;
        }
        const contentPatch = this.createForm();
        this.contentForm = this.fb.group(contentPatch.amendment_paragraph_$);
        this.selectedParagraphs = contentPatch.selected_paragraphs;
        this.brokenParagraphs = contentPatch.broken_paragraphs;
        this.propagateChanges();
    }

    private createForm(): ParagraphBasedAmendmentContent {
        const contentPatch: ParagraphBasedAmendmentContent = {
            selected_paragraphs: [],
            amendment_paragraph_$: {},
            broken_paragraphs: []
        };
        const leadMotion = this.motion.lead_motion;
        // Hint: lineLength is sometimes not loaded yet when this form is initialized;
        // This doesn't hurt as long as patchForm is called when editing mode is started, i.e., later.
        if (leadMotion && this.lineLength) {
            const paragraphsToChoose = this.motionLineNumbering.getParagraphsToChoose(leadMotion, this.lineLength);

            paragraphsToChoose.forEach((paragraph: ParagraphToChoose, paragraphNo: number): void => {
                const amendmentParagraph = this.motion.amendment_paragraph(paragraphNo);
                if (amendmentParagraph) {
                    contentPatch.selected_paragraphs.push(paragraph);
                    contentPatch.amendment_paragraph_$[paragraphNo] = [amendmentParagraph, Validators.required];
                }
            });
            // If the motion has been shortened after the amendment has been created, we will show the paragraphs
            // of the amendment as read-only
            for (
                let paragraphNo = paragraphsToChoose.length;
                paragraphNo < this.motion.amendment_paragraph_$.length;
                paragraphNo++
            ) {
                if (this.motion.amendment_paragraph(paragraphNo) !== null) {
                    contentPatch.broken_paragraphs.push(this.motion.amendment_paragraph(paragraphNo));
                }
            }
        }
        return contentPatch;
    }

    private propagateChanges(): void {
        this.updateSubscription(
            `contentForm`,
            this.contentForm.valueChanges.subscribe(value => {
                if (value) {
                    this.formChanged.emit({ amendment_paragraph_$: value });
                    this.validStateChanged.emit(this.contentForm.valid);
                    this.cd.markForCheck();
                }
            })
        );
    }
}
