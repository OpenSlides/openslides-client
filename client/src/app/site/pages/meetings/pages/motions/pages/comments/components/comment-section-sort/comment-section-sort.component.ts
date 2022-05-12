import { Component, OnInit } from '@angular/core';
import { ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { TranslateService } from '@ngx-translate/core';
import { MotionCommentSectionControllerService } from '../../../../modules/comments/services';
import { BaseComponent } from 'src/app/site/base/base.component';

@Component({
    selector: 'os-comment-section-sort',
    templateUrl: './comment-section-sort.component.html',
    styleUrls: ['./comment-section-sort.component.scss']
})
export class CommentSectionSortComponent extends BaseComponent implements OnInit {
    /**
     * Holds the models
     */
    public comments: ViewMotionCommentSection[];

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        translate: TranslateService,
        private repo: MotionCommentSectionControllerService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Sort comments`);
    }

    /**
     * Get the view models from the repo
     */
    public ngOnInit(): void {
        this.repo.getViewModelListObservable().subscribe(comments => (this.comments = comments));
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
