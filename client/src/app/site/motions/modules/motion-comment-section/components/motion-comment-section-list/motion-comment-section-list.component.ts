import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionCommentSection } from 'app/shared/models/motions/motion-comment-section';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { ViewGroup } from 'app/site/users/models/view-group';
import { BehaviorSubject } from 'rxjs';

/**
 * List view for the comment sections.
 */
@Component({
    selector: `os-motion-comment-section-list`,
    templateUrl: `./motion-comment-section-list.component.html`,
    styleUrls: [`./motion-comment-section-list.component.scss`]
})
export class MotionCommentSectionListComponent extends BaseModelContextComponent implements OnInit {
    @ViewChild(`motionCommentDialog`, { static: true })
    private motionCommentDialog: TemplateRef<string>;

    private dialogRef: MatDialogRef<any>;

    public currentComment: ViewMotionCommentSection | null;

    /**
     * Source of the Data
     */
    public commentSections: ViewMotionCommentSection[] = [];

    /**
     * formgroup for editing and creating of comments
     */
    public commentFieldForm: FormGroup;

    public groups: BehaviorSubject<ViewGroup[]>;

    /**
     * The usual component constructor
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param repo
     * @param formBuilder
     * @param promptService
     * @param DS
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private repo: MotionCommentSectionRepositoryService,
        private formBuilder: FormBuilder,
        private promptService: PromptService,
        private dialog: MatDialog,
        private groupRepo: GroupRepositoryService
    ) {
        super(componentServiceCollector, translate);

        const form = {
            name: [``, Validators.required],
            read_group_ids: [[]],
            write_group_ids: [[]]
        };
        this.commentFieldForm = this.formBuilder.group(form);
    }

    /**
     * Init function.
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(`Comment fields`);

        this.groups = this.groupRepo.getViewModelListBehaviorSubject();
        this.subscriptions.push(
            this.repo
                .getViewModelListObservable()
                .subscribe(newViewSections => (this.commentSections = newViewSections))
        );
    }

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `motion_comment_section_ids`,
                    follow: [`comment_ids`, `read_group_ids`, `write_group_ids`]
                },
                {
                    idField: `group_ids`
                }
            ]
        };
    }

    /**
     * Event on Key Down in form.
     *
     * @param event the keyboard event
     * @param the current view in scope
     */
    public onKeyDown(event: KeyboardEvent, viewSection?: ViewMotionCommentSection): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.save();
            this.dialogRef.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef.close();
        }
    }

    /**
     * Opens the create dialog.
     */
    public openDialog(commentSection?: ViewMotionCommentSection): void {
        this.currentComment = commentSection;
        this.commentFieldForm.reset({
            name: commentSection ? commentSection.name : ``,
            read_group_ids: commentSection ? commentSection.read_group_ids : [],
            write_group_ids: commentSection ? commentSection.write_group_ids : []
        });
        this.dialogRef = this.dialog.open(this.motionCommentDialog, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * saves the current data, either updating an existing comment or creating a new one.
     */
    private save(): void {
        if (!this.commentFieldForm.valid) {
            return;
        }
        // eiher update or create
        if (this.currentComment) {
            this.handleRequest(this.updateSection());
        } else {
            this.handleRequest(this.createNewSection());
        }
        this.commentFieldForm.reset();
    }

    /**
     * is executed, when the delete button is pressed
     * @param viewSection The section to delete
     */
    public async onDeleteButton(viewSection: ViewMotionCommentSection): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this comment field?`);
        const content = viewSection.name;
        if (await this.promptService.open(title, content)) {
            this.handleRequest(this.deleteSection(viewSection));
        }
    }

    private updateSection(): Promise<void> {
        return this.repo.update(this.commentFieldForm.value as Partial<MotionCommentSection>, this.currentComment);
    }

    private createNewSection(): Promise<Identifiable> {
        const comment = new MotionCommentSection(this.commentFieldForm.value);
        return this.repo.create(comment);
    }

    private deleteSection(viewSection: ViewMotionCommentSection): Promise<void> {
        return this.repo.delete(viewSection);
    }

    private handleRequest(request: Promise<any>): void {
        request.catch(this.raiseError);
    }
}
