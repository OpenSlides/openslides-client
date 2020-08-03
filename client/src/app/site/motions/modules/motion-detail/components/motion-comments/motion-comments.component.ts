import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { MotionPdfExportService } from 'app/site/motions/services/motion-pdf-export.service';

/**
 * Component for the motion comments view
 */
@Component({
    selector: 'os-motion-comments',
    templateUrl: './motion-comments.component.html',
    styleUrls: ['./motion-comments.component.scss']
})
export class MotionCommentsComponent extends BaseModelContextComponent implements OnInit {
    /**
     * An array of all sections the operator can see.
     */
    public sections: ViewMotionCommentSection[] = [];

    /**
     * An object of forms for one comment mapped to the section id.
     */
    public commentForms: { [id: number]: FormGroup } = {};

    /**
     * The motion, which these comments belong to.
     */
    @Input()
    public motion: ViewMotion;

    /**
     * Set to true if an error was detected to prevent automatic navigation
     */
    public error = false;

    /**
     * Watches for changes in sections and the operator. If one of them changes, the sections are reloaded
     * and the comments updated.
     *
     * @param commentRepo The repository that handles server communication
     * @param formBuilder Form builder to handle text editing
     * @param operator service to get the sections
     * @param pdfService service to export a comment section to pdf
     * @param titleService set the browser title
     * @param translate the translation service
     * @param matSnackBar showing errors and information
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private commentRepo: MotionCommentSectionRepositoryService,
        private formBuilder: FormBuilder,
        private operator: OperatorService,
        private pdfService: MotionPdfExportService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [1], // TODO
            follow: [
                {
                    idField: 'motion_comment_section_ids',
                    fieldset: 'comment',
                    follow: ['comment_ids']
                }
            ]
        });

        this.subscriptions.push(
            this.commentRepo.getViewModelListObservable().subscribe(sections => {
                if (sections && sections.length) {
                    this.sections = sections;
                    this.filterSections();
                }
            })
        );
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
        if (section.write_group_ids?.length) {
            /**
             * FIXME:
             * section.write_group_ids is undefined.
             */
            return this.operator.isInGroupIds(...section.write_group_ids);
        } else {
            return false;
        }
    }

    /**
     * Puts the comment into edit mode.
     *
     * @param section The section for the comment.
     */
    public editComment(section: ViewMotionCommentSection): void {
        const comment = this.motion.getCommentForSection(section);
        const form = this.formBuilder.group({
            comment: [comment ? comment.comment : '']
        });
        this.commentForms[section.id] = form;
    }

    /**
     * Saves the comment.
     *
     * @param section The section for the comment to save
     */
    public saveComment(section: ViewMotionCommentSection): void {
        const commentText = this.commentForms[section.id].get('comment').value;
        this.commentRepo.saveComment(this.motion, section, commentText).then(
            () => {
                this.cancelEditing(section);
            },
            error => {
                this.error = true;
                this.raiseError(`${error} :"${section.name}"`);
            }
        );
    }

    /**
     * Cancles the editing for a comment.
     *
     * @param section The section for the comment
     */
    public cancelEditing(section: ViewMotionCommentSection): void {
        delete this.commentForms[section.id];
    }

    /**
     * Check if a section is visible at all
     *
     * @param section
     * @returns true if there is any content or the user is allowed to edit
     */
    public sectionVisible(section: ViewMotionCommentSection): boolean {
        const comment = this.motion.getCommentForSection(section);
        return this.canEditSection(section) || (!!comment && !!comment.comment);
    }

    /**
     * Returns true, if the comment is edited.
     *
     * @param section The section for the comment.
     * @returns a boolean of the comments is edited
     */
    public isCommentEdited(section: ViewMotionCommentSection): boolean {
        return Object.keys(this.commentForms).includes('' + section.id);
    }

    /**
     * Triggers a direct pdf export of this comment
     *
     * @param section
     */
    public pdfExportSection(section: ViewMotionCommentSection): void {
        this.pdfService.exportComment(section, this.motion);
    }
}
