import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';

/**
 * Component for the motion comments view
 */
@Component({
    selector: 'os-motion-comments',
    templateUrl: './motion-comments.component.html',
    styleUrls: ['./motion-comments.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionCommentsComponent extends BaseModelContextComponent implements OnInit {
    /**
     * An array of all sections the operator can see.
     */
    public sections: ViewMotionCommentSection[] = [];

    /**
     * The motion, which these comments belong to.
     */
    @Input()
    public motion: ViewMotion;

    /**
     * Watches for changes in sections and the operator. If one of them changes, the sections are reloaded
     * and the comments updated.
     *
     * @param commentSectionRepo The repository that handles server communication
     * @param formBuilder Form builder to handle text editing
     * @param operator service to get the sections
     * @param pdfService service to export a comment section to pdf
     * @param titleService set the browser title
     * @param translate the translation service
     * @param matSnackBar showing errors and information
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private commentSectionRepo: MotionCommentSectionRepositoryService,
        private operator: OperatorService,
        private cd: ChangeDetectorRef,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.ngOnInit();

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

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'motion_comment_section_ids',
                    fieldset: 'comment',
                    follow: [{ idField: 'comment_ids' }]
                }
            ]
        };
    }

    public getCommentForSection(section: ViewMotionCommentSection): ViewMotionComment {
        return this.motion.getCommentForSection(section);
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
        if (section.read_group_ids?.length) {
            return this.operator.isInGroupIds(...section.read_group_ids);
        } else {
            return false;
        }
    }

    /**
     * Returns true if the operator has write permissions for the given section, so he can edit the comment.
     *
     * @param section The section to judge about
     */
    public canEditSection(section: ViewMotionCommentSection): boolean {
        const groupIds = section.write_group_ids || [];
        return this.operator.isInGroupIds(...groupIds);
    }
}
