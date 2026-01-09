import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';

import { DiffLinesInParagraph } from '../../../../../../definitions/index';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';

@Component({
    selector: `os-paragraph-based-amendment`,
    templateUrl: `./paragraph-based-amendment.component.html`,
    styleUrls: [`./paragraph-based-amendment.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ParagraphBasedAmendmentComponent extends BaseMotionDetailChildComponent {
    public readonly LineNumberingMode = LineNumberingMode;
    public readonly ChangeRecoMode = ChangeRecoMode;

    @Input()
    public changesForDiffMode: ViewUnifiedChange[] = [];

    @Input()
    public highlightedLine!: number;

    @Input()
    public isFinalEdit = false;

    @Input()
    public lineNumberingMode: LineNumberingMode;

    private _changeRecoMode: ChangeRecoMode;

    @Input()
    public set changeRecoMode(value: ChangeRecoMode) {
        this._changeRecoMode = value;
        this.showAmendmentContext = false;
    }

    public get changeRecoMode(): ChangeRecoMode {
        return this._changeRecoMode;
    }

    @Input()
    public showAllAmendments: boolean;

    @Output()
    public createChangeRecommendation = new EventEmitter<LineRange>();

    @Output()
    public gotoChangeRecommendation = new EventEmitter<ViewUnifiedChange>();

    public scrollToChange: ViewUnifiedChange | null = null;

    public showAmendmentContext = false;

    public amendmentErrorMessage: string | null = null;

    public get amendmentLines(): DiffLinesInParagraph[] | null {
        return this.motion?.changedAmendmentLines;
    }

    public get nativeElement(): any {
        return this.el.nativeElement;
    }

    public constructor(
        protected override translate: TranslateService,
        private el: ElementRef
    ) {
        super();
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
            return this.motion?.getAmendmentParagraphLines(this.changeRecoMode, this.showAmendmentContext) || [];
        } catch (e: any) {
            this.amendmentErrorMessage = e.toString();
            return [];
        }
    }

    public getAmendmentParagraphLinesTitle(paragraph: DiffLinesInParagraph): string {
        return this.motion?.getParagraphTitleByParagraph(paragraph) || ``;
    }

    public getLastNumber(): number {
        return this.motion.services().ln.getLineNumberRange(
            this.motion.services().ln.insertLineNumbers({
                html: this.motion?.lead_motion.text,
                lineLength: this.lineLength,
                firstLine: this.motion?.lead_motion.firstLine
            })
        ).to;
    }

    public isChanged(para_from: number, para_to: number): boolean {
        for (const change of this.changesForDiffMode) {
            if (para_from <= change.getLineFrom() && para_to >= change.getLineTo()) {
                return true;
            }
        }
        return false;
    }
}
