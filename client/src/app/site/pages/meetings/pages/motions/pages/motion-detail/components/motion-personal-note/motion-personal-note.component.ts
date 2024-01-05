import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { ViewPersonalNote } from 'src/app/site/pages/meetings/pages/motions';

import { PersonalNoteControllerService } from '../../../../modules/personal-notes/services/personal-note-controller.service/personal-note-controller.service';
import { MotionPdfExportService } from '../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';
import { BaseMotionDetailActionCardComponent } from '../../base/base-motion-detail-action-card.component';

const SUBSCRIPTION_NAME = `personal_note_subscription`;

@Component({
    selector: `os-motion-personal-note`,
    templateUrl: `./motion-personal-note.component.html`,
    styleUrls: [`./motion-personal-note.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPersonalNoteComponent extends BaseMotionDetailActionCardComponent {
    public get personalNoteObservable(): Observable<PersonalNote | null> {
        return this._personalNoteSubject;
    }

    public get hasPersonalNoteObservable(): Observable<boolean> {
        return this._personalNoteSubject.pipe(map(note => !!note?.note));
    }

    private get personalNote(): PersonalNote | null {
        return this._personalNoteSubject.value;
    }

    private readonly _personalNoteSubject = new BehaviorSubject<ViewPersonalNote | null>(null);

    protected override translate = inject(TranslateService);
    private repo = inject(PersonalNoteControllerService);
    private pdfService = inject(MotionPdfExportService);

    public editPersonalNote(): void {
        this.enterEditMode(this.personalNote?.note);
    }

    /**
     * Saves the personal note. If it does not exists, it will be created.
     */
    public async savePersonalNote(): Promise<void> {
        const contentObject: any = !!this.personalNote ? { getPersonalNote: () => this.personalNote } : this.motion;
        await this.repo.setPersonalNote({ note: this.getTextFromForm() }, contentObject);
        await this.leaveEditMode();
    }

    /**
     * Triggers a pdf export of the personal note
     */
    public printPersonalNote(): void {
        this.pdfService.exportPersonalNote(this.motion);
    }

    protected override onUpdate(): void {
        this.subscriptions.updateSubscription(
            SUBSCRIPTION_NAME,
            this.repo.getPersonalNoteFor(this.motion.fqid).subscribe(note => this._personalNoteSubject.next(note))
        );
    }

    protected getStorageIndex(): string {
        return `${PersonalNote.COLLECTION}:${this.motion.id}`;
    }
}
