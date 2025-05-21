import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';

import { getRecommendationTypeName } from '../../../../../../definitions/recommendation-type-names';
import { ViewUnifiedChangeType } from '../../../../../../modules/change-recommendations/definitions/index';
import { ViewMotion } from '../../../../../../view-models';
import { ViewMotionAmendedParagraph } from '../../../../../../view-models/view-motion-amended-paragraph';

/**
 * This component displays a summary of the given change requests.
 *
 * ## Examples
 *
 * ```html
 *  <os-motion-detail-diff-summary
 *       [changes]="changes"
 *       [scrollToChange]="change"
 *       [elContainer]="elContainer"
 * ></os-motion-detail-diff-summary>
 * ```
 */
@Component({
    selector: `os-motion-detail-diff-summary`,
    templateUrl: `./motion-detail-diff-summary.component.html`,
    styleUrls: [`./motion-detail-diff-summary.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionDetailDiffSummaryComponent extends BaseMeetingComponent implements AfterViewInit {
    /**
     * Get the {@link getRecommendationTypeName}-Function from Utils
     */
    public getRecommendationTypeName = getRecommendationTypeName;

    @Input()
    public motion: ViewMotion;

    @Input()
    public changes: ViewUnifiedChange[] = [];

    @Input()
    public scrollToChange: ViewUnifiedChange | null = null;

    @Input()
    public elContainer: any;

    @Input()
    public backtrackingIsOn = false;

    @Input()
    public originMeetingName = [``];

    public isAmendmentMarkedForwarded(i): boolean {
        let amendment_index = -1;
        for (let j = 0; this.changes.length && j <= i; j++) {
            if (this.isAmendment(this.changes[j])) {
                amendment_index += 1;
            }
        }
        return this.motion.amendments[amendment_index]?.isForwardedAmendment;
    }

    public positionOptions: TooltipPosition[] = [`after`, `before`, `above`, `below`, `left`, `right`];
    public position = new FormControl(this.positionOptions[2]);

    /**
     * If only one line is affected, the line number is returned; otherwise, a string like [line] "1 - 5"
     *
     * @param {ViewUnifiedChange} change
     * @returns string
     */
    public formatLineRange(change: ViewUnifiedChange): string {
        if (change.getLineFrom() < change.getLineTo()) {
            return change.getLineFrom().toString(10) + ` - ` + change.getLineTo().toString(10);
        } else {
            return change.getLineFrom().toString(10);
        }
    }

    /**
     * Returns true if the change is an Amendment
     *
     * @param {ViewUnifiedChange} change
     */
    public isAmendment(change: ViewUnifiedChange): change is ViewMotionAmendedParagraph {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_AMENDMENT;
    }

    /**
     * Returns true if the change is a Change Recommendation
     *
     * @param {ViewUnifiedChange} change
     */
    public isChangeRecommendation(change: ViewUnifiedChange): boolean {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    public canAccess(origin: ViewMotion): boolean {
        const motion = origin as ViewMotion;
        return motion.sequential_number && motion.meeting?.id === this.activeMeetingId;
    }

    /**
     * Scrolls to the native element specified by [scrollToChange]
     */
    private scrollToChangeElement(change: ViewUnifiedChange): void {
        if (!this.elContainer) {
            return;
        }

        const element = this.elContainer as HTMLElement;
        const target = element.querySelector(`.diff-box-${change.getChangeId()}`);
        target.scrollIntoView({ behavior: `smooth`, block: `center` });
    }

    public scrollToChangeClicked(change: ViewUnifiedChange, $event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.scrollToChangeElement(change);
    }

    public ngAfterViewInit(): void {
        if (this.scrollToChange) {
            window.setTimeout(() => {
                this.scrollToChangeElement(this.scrollToChange!);
            }, 50);
        }
    }
}
