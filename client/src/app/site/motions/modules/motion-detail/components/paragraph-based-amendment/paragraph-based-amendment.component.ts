import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DiffLinesInParagraph, LineRange } from 'app/core/ui-services/diff.service';
import { ViewUnifiedChange } from 'app/shared/models/motions/view-unified-change';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';

@Component({
    selector: 'os-paragraph-based-amendment',
    templateUrl: './paragraph-based-amendment.component.html',
    styleUrls: ['./paragraph-based-amendment.component.scss']
})
export class ParagraphBasedAmendmentComponent extends BaseComponent {
    public readonly LineNumberingMode = LineNumberingMode;
    public readonly ChangeRecoMode = ChangeRecoMode;

    @Input()
    public motion: ViewMotion;

    @Input()
    public lnMode = LineNumberingMode.None;

    @Input()
    public crMode = ChangeRecoMode.Original;

    @Input()
    public changesForDiffMode: ViewUnifiedChange[] = [];

    @Input()
    public scrollToChange: ViewUnifiedChange;

    @Input()
    public changeRecommendations: ViewUnifiedChange[] = [];

    @Input()
    public highlightedLine: number;

    @Input()
    public isFinalEdit = false;

    @Output()
    public createChangeRecommendation = new EventEmitter<LineRange>();

    @Output()
    public gotoChangeRecommendation = new EventEmitter<ViewUnifiedChange>();

    public showAmendmentContext = false;

    public showAllAmendments = false;

    public constructor(protected componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
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
    public getAmendmentDiffTextWithContext(paragraph: DiffLinesInParagraph): string {
        return (
            '<div class="paragraphcontext">' +
            paragraph.textPre +
            '</div>' +
            '<div>' +
            paragraph.text +
            '</div>' +
            '<div class="paragraphcontext">' +
            paragraph.textPost +
            '</div>'
        );
    }

    /**
     * If `this.motion` is an amendment, this returns the list of all changed paragraphs.
     *
     * @returns {DiffLinesInParagraph[]}
     */
    public getAmendmentParagraphs(): DiffLinesInParagraph[] {
        return this.motion?.diffLines || [];
    }

    public getAmendmentParagraphLinesTitle(paragraph: DiffLinesInParagraph): string {
        return this.motion?.getParagraphTitleByParagraph(paragraph) || '';
    }
}
