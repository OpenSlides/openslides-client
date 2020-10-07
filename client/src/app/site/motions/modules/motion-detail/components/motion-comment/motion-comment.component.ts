import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { UnsafeHtml } from 'app/core/definitions/key-types';
import { MotionCommentRepositoryService } from 'app/core/repositories/motions/motion-comment-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { MotionPdfExportService } from 'app/site/motions/services/motion-pdf-export.service';

@Component({
    selector: 'os-motion-comment',
    templateUrl: './motion-comment.component.html',
    styleUrls: ['./motion-comment.component.scss']
})
export class MotionCommentComponent extends BaseComponent implements OnInit {
    @Input()
    public motion: ViewMotion;

    @Input()
    public section: ViewMotionCommentSection;

    @Input()
    public canBeEdited = false;

    @Input()
    public comment?: ViewMotionComment;

    public commentForm: FormGroup;

    public isCommentEdited = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private fb: FormBuilder,
        private pdfService: MotionPdfExportService,
        private commentRepo: MotionCommentRepositoryService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.initForms();
    }

    public editComment(): void {
        this.commentForm.setValue({ comment: this.comment ? this.comment.comment : '' });
        this.isCommentEdited = !this.isCommentEdited;
    }

    public cancelEditing(): void {
        this.isCommentEdited = false;
    }

    public async saveComment(): Promise<void> {
        if (!this.hasComment()) {
            await this.handleRequest(this.createComment());
        } else if (this.isCommentFormEmpty()) {
            await this.handleRequest(this.deleteComment());
        } else {
            await this.handleRequest(this.updateComment());
        }
        this.cancelEditing();
    }

    public hasComment(): boolean {
        return !!this.comment;
    }

    public isCommentFormEmpty(): boolean {
        return this.getCommentTextFromForm() === '';
    }

    public getCommentTextFromForm(): UnsafeHtml {
        return this.commentForm.get('comment').value;
    }

    public exportCommentAsPDf(): void {
        this.pdfService.exportComment(this.section, this.motion);
    }

    private initForms(): void {
        this.commentForm = this.fb.group({ comment: [''] });
    }

    private createComment(): Promise<Identifiable> {
        return this.commentRepo.create({
            motion_id: this.motion.id,
            section_id: this.section.id,
            comment: this.getCommentTextFromForm()
        });
    }

    private updateComment(): Promise<void> {
        return this.commentRepo.update({ id: this.comment.id, comment: this.getCommentTextFromForm() }, this.comment);
    }

    private deleteComment(): Promise<void> {
        return this.commentRepo.delete(this.comment);
    }

    private handleRequest(request: Promise<any>): Promise<void> {
        return request.catch(error => this.raiseError(`${error} :"${this.section.name}"`));
    }
}
