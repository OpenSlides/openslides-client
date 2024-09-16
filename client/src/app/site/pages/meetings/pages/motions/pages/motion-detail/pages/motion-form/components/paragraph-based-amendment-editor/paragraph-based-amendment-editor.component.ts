import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ParagraphToChoose } from '../../../../../../services/common/motion-line-numbering.service/motion-line-numbering.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';

interface ParagraphBasedAmendmentContent {
    amendment_paragraphs: { [paragraph_number: number]: any };
    selected_paragraphs: ParagraphToChoose[];
    broken_paragraphs: string[];
}

const CONTENT_FORM_SUBSCRIPTION_NAME = `contentForm`;

@Component({
    selector: `os-paragraph-based-amendment-editor`,
    templateUrl: `./paragraph-based-amendment-editor.component.html`,
    styleUrls: [`./paragraph-based-amendment-editor.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParagraphBasedAmendmentEditorComponent extends BaseMotionDetailChildComponent {
    @Output()
    public formChanged = new EventEmitter<any>();

    @Output()
    public validStateChanged = new EventEmitter<boolean>();

    public selectedParagraphs: ParagraphToChoose[] = [];

    public brokenParagraphs: string[] = [];

    public contentForm: UntypedFormGroup | null = null;

    public constructor(
        protected override translate: TranslateService,
        private fb: UntypedFormBuilder
    ) {
        super();
    }

    protected override onAfterSetMotion(): void {
        if (this.contentForm) {
            this.contentForm = null;
        }
        const contentPatch = this.createForm();
        this.contentForm = this.fb.group(contentPatch.amendment_paragraphs);
        this.selectedParagraphs = contentPatch.selected_paragraphs;
        this.brokenParagraphs = contentPatch.broken_paragraphs;
        this.propagateChanges();
    }

    public isControlInvalid(paragraphNumber: number): boolean {
        const control = this.contentForm!.get(paragraphNumber.toString())!;
        return control.invalid && (control.dirty || control.touched);
    }

    private createForm(): ParagraphBasedAmendmentContent {
        const contentPatch: ParagraphBasedAmendmentContent = {
            selected_paragraphs: [],
            amendment_paragraphs: {},
            broken_paragraphs: []
        };
        const leadMotion = this.motion?.lead_motion;
        // Hint: lineLength is sometimes not loaded yet when this form is initialized;
        // This doesn't hurt as long as patchForm is called when editing mode is started, i.e., later.
        if (leadMotion && this.lineLength) {
            const paragraphsToChoose = this.motionLineNumbering.getParagraphsToChoose(leadMotion, this.lineLength);

            paragraphsToChoose.forEach((paragraph: ParagraphToChoose, paragraphNo: number): void => {
                const amendmentParagraph = this.motion.amendment_paragraph_text(paragraphNo);
                if (amendmentParagraph !== null && amendmentParagraph !== undefined) {
                    contentPatch.selected_paragraphs.push(paragraph);
                    contentPatch.amendment_paragraphs[paragraphNo] = [amendmentParagraph];
                }
            });
            // If the motion has been shortened after the amendment has been created, we will show the paragraphs
            // of the amendment as read-only
            for (
                let paragraphNo = paragraphsToChoose.length;
                paragraphNo < this.motion.amendment_paragraph_numbers.length;
                paragraphNo++
            ) {
                if (this.motion.amendment_paragraph_text(paragraphNo) !== null) {
                    contentPatch.broken_paragraphs.push(this.motion.amendment_paragraph_text(paragraphNo)!);
                }
            }
        }
        return contentPatch;
    }

    private propagateChanges(): void {
        this.updateSubscription(
            CONTENT_FORM_SUBSCRIPTION_NAME,
            this.contentForm!.valueChanges.subscribe(value => {
                if (value) {
                    this.formChanged.emit({ amendment_paragraphs: value });
                    this.validStateChanged.emit(this.contentForm!.valid);
                    this.cd.markForCheck();
                }
            })
        );
    }
}
