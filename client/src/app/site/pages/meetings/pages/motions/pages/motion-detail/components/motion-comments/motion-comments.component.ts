import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ViewMotion, ViewMotionComment, ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionCommentSectionControllerService } from '../../../../modules/comments/services/motion-comment-section-controller.service';

@Component({
    selector: `os-motion-comments`,
    templateUrl: `./motion-comments.component.html`,
    styleUrls: [`./motion-comments.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionCommentsComponent extends BaseUiComponent implements OnInit {
    /**
     * An array of all sections the operator can see.
     */
    public sections: ViewMotionCommentSection[] = [];

    /**
     * The motion, which these comments belong to.
     */
    @Input()
    public motion!: ViewMotion;

    public constructor(
        private commentSectionRepo: MotionCommentSectionControllerService,
        private operator: OperatorService,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.commentSectionRepo.getViewModelListObservable().subscribe(sections => {
                if (sections && sections.length) {
                    this.sections = sections;
                    this.filterSections();
                    this.cd.detectChanges();
                }
            })
        );
    }

    public getCommentForSection(section: ViewMotionCommentSection): ViewMotionComment {
        return this.motion.getCommentForSection(section)!;
    }

    /**
     * sets the `sections` member with sections, if the operator has reading permissions.
     */
    private filterSections(): void {
        if (this.sections?.length) {
            this.sections = this.sections.filter(section => this.canReadSection(section));
            this.cd.markForCheck();
        }
    }

    private canReadSection(section: ViewMotionCommentSection): boolean {
        return (
            this.operator.isInGroupIds(...(section.read_group_ids || []), ...(section.write_group_ids || [])) ||
            (section.submitter_can_write &&
                this.motion.submittersAsUsers?.map(submitter => submitter.id).includes(this.operator.operatorId))
        );
    }

    /**
     * Returns true if the operator has write permissions for the given section, so he can edit the comment.
     *
     * @param section The section to judge about
     */
    public canEditSection(section: ViewMotionCommentSection): boolean {
        const groupIds = section.write_group_ids || [];
        return (
            this.operator.isInGroupIds(...groupIds) ||
            (section.submitter_can_write && this.motion.submitter_ids?.includes(this.operator.operatorId))
        );
    }
}
