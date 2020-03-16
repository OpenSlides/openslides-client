import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';

/**
 * Sorting view for motion comments
 */
@Component({
    selector: 'os-motion-comment-section-sort',
    templateUrl: './motion-comment-section-sort.component.html',
    styleUrls: ['./motion-comment-section-sort.component.scss']
})
export class MotionCommentSectionSortComponent extends BaseComponent implements OnInit {
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
