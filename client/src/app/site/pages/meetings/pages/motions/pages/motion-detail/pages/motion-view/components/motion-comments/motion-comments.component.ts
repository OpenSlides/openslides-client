import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ViewMotion, ViewMotionComment, ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionCommentSectionControllerService } from '../../../../../../modules/comments/services/motion-comment-section-controller.service';

@Component({
    selector: `os-motion-comments`,
    templateUrl: `./motion-comments.component.html`,
    styleUrls: [`./motion-comments.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionCommentsComponent extends BaseUiComponent {
    /**
     * An array of all sections the operator can see.
     */
    public sections$: Observable<ViewMotionCommentSection[]> = this.commentSectionRepo.getViewModelListObservable();

    /**
     * The motion, which these comments belong to.
     */
    @Input()
    public motion!: ViewMotion;

    public constructor(
        private commentSectionRepo: MotionCommentSectionControllerService,
        private operator: OperatorService
    ) {
        super();
    }

    public getCommentForSection(section: ViewMotionCommentSection): ViewMotionComment {
        return this.motion.getCommentForSection(section)!;
    }

    public canReadSection(section: ViewMotionCommentSection): boolean {
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
