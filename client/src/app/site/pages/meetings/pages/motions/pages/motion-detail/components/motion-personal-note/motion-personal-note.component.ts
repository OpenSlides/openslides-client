import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

import { PersonalNoteControllerService } from '../../../../modules/personal-notes/services/personal-note-controller.service/personal-note-controller.service';
import { MotionPdfExportService } from '../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';

@Component({
    selector: `os-motion-personal-note`,
    templateUrl: `./motion-personal-note.component.html`,
    styleUrls: [`./motion-personal-note.component.scss`]
})
export class MotionPersonalNoteComponent extends BaseComponent {
    /**
     * The motion, which the personal note belong to.
     */
    @Input()
    public motion!: ViewMotion;

    /**
     * The edit form for the note
     */
    public personalNoteForm: FormGroup;

    /**
     * Saves, if the users edits the note.
     */
    public isEditMode = false;

    public get personalNoteText(): string {
        const pn = this.motion?.getPersonalNote();
        return pn ? pn.note : ``;
    }

    public get hasPersonalNote(): boolean {
        return !!this.motion?.getPersonalNote();
    }

    public get personalNote(): PersonalNote | null {
        return this.motion?.getPersonalNote();
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        formBuilder: FormBuilder,
        private repo: PersonalNoteControllerService,
        private pdfService: MotionPdfExportService
    ) {
        super(componentServiceCollector, translate);
        this.personalNoteForm = formBuilder.group({
            note: [``]
        });
    }

    /**
     * Sets up the form.
     */
    public editPersonalNote(): void {
        this.personalNoteForm.reset();
        this.personalNoteForm.patchValue({
            note: this.personalNoteText
        });
        this.isEditMode = true;
    }

    /**
     * Saves the personal note. If it does not exists, it will be created.
     */
    public async savePersonalNote(): Promise<void> {
        await this.repo.setPersonalNote({ note: this.personalNoteForm.get(`note`)?.value }, this.motion);
        this.isEditMode = false;
    }

    /**
     * Triggers a pdf export of the personal note
     */
    public printPersonalNote(): void {
        this.pdfService.exportPersonalNote(this.motion);
    }
}
