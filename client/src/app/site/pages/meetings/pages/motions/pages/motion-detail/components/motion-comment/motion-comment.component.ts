import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ViewMotion, ViewMotionComment, ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

import { MotionCommentControllerService } from '../../../../modules/comments/services/motion-comment-controller.service';
import { MotionPdfExportService } from '../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';

@Component({
    selector: `os-motion-comment`,
    templateUrl: `./motion-comment.component.html`,
    styleUrls: [`./motion-comment.component.scss`]
})
export class MotionCommentComponent extends BaseComponent implements OnInit {
    @Input()
    public motion!: ViewMotion;

    @Input()
    public section!: ViewMotionCommentSection;

    @Input()
    public canBeEdited = false;

    @Input()
    public comment?: ViewMotionComment;

    public commentForm!: FormGroup;

    public isCommentEdited = false;

    public get sectionId(): string {
        return this.section.id.toString();
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private fb: FormBuilder,
        private pdfService: MotionPdfExportService,
        private commentRepo: MotionCommentControllerService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.initForms();
    }

    public editComment(): void {
        this.commentForm.setValue({ comment: this.comment ? this.comment.comment : `` });
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
        return this.getCommentTextFromForm() === ``;
    }

    public getCommentTextFromForm(): UnsafeHtml {
        return this.commentForm.get(`comment`)!.value;
    }

    public exportCommentAsPDf(): void {
        this.pdfService.exportComment(this.section, this.motion);
    }

    private initForms(): void {
        this.commentForm = this.fb.group({ comment: [``] });
    }

    private createComment(): Promise<Identifiable> {
        return this.commentRepo.create({
            motion_id: this.motion.id,
            section_id: this.section.id,
            comment: this.getCommentTextFromForm()
        });
    }

    private updateComment(): Promise<void> {
        return this.commentRepo.update({ comment: this.getCommentTextFromForm() }, this.comment!);
    }

    private deleteComment(): Promise<void> {
        return this.commentRepo.delete(this.comment!);
    }

    private async handleRequest(request: Promise<any>): Promise<void> {
        // return request.catch(error => this.raiseError(`${error} :"${this.section.name}"`));
    }
}
