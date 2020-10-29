import { Component, OnInit } from '@angular/core';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';

/**
 * Sorting view for motion comments
 */
@Component({
    selector: 'os-motion-comment-section-sort',
    templateUrl: './motion-comment-section-sort.component.html',
    styleUrls: ['./motion-comment-section-sort.component.scss']
})
export class MotionCommentSectionSortComponent extends BaseModelContextComponent implements OnInit {
    /**
     * Holds the models
     */
    public comments: ViewMotionCommentSection[];

    /**
     * Constructor
     *
     * @param title Title service
     * @param translate Translate service
     * @param snackBar Snack bar
     * @param repo Motion comment repository service
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private repo: MotionCommentSectionRepositoryService
    ) {
        super(componentServiceCollector);
        super.setTitle('Sort comments');
    }

    /**
     * Get the view models from the repo
     */
    public ngOnInit(): void {
        super.ngOnInit();
        this.repo.getViewModelListObservable().subscribe(comments => (this.comments = comments));
    }

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [1], // TODO
            follow: ['motion_comment_section_ids']
        };
    }

    /**
     * Executed if the sorting changes
     *
     * @param commentsInOrder
     */
    public onSortingChange(commentsInOrder: ViewMotionCommentSection[]): void {
        this.repo.sortCommentSections(commentsInOrder).catch(this.raiseError);
    }
}
