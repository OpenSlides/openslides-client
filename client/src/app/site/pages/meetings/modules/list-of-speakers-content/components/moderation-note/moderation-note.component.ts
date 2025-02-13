import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Input,
    OnInit,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/list-of-speakers/list-of-speakers-repository.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ListOfSpeakersContentTitleDirective } from '../../directives/list-of-speakers-content-title.directive';
import { ModerationNotePdfService } from '../../services/moderation-note-pdf.service/moderation-note-pdf.service';

@Component({
    selector: `os-moderation-note`,
    templateUrl: `./moderation-note.component.html`,
    styleUrls: [`./moderation-note.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ModerationNotePdfService]
})
export class ModerationNoteComponent extends BaseMeetingComponent implements OnInit {
    public isEditing = false;

    public moderatorNoteForm: UntypedFormGroup;

    public get listOfSpeakers(): ViewListOfSpeakers {
        return this._listOfSpeakers;
    }

    @Input()
    public set listOfSpeakers(los: ViewListOfSpeakers) {
        if (los) {
            this._listOfSpeakers = los;
            this._contentObject = this._listOfSpeakers.content_object;
        }
    }

    @Input()
    public set contentObject(contentObject: BaseViewModel) {
        this._contentObject = contentObject;
    }

    @Input()
    public showModerationNotesExport = true;

    public get moderatorNotes(): Observable<string> {
        return this.LoSRepo.getViewModelObservable(this._listOfSpeakers?.getModel().id).pipe(
            map(item => item?.moderator_notes)
        );
    }

    private get moderatorNotesForForm(): string {
        return this._listOfSpeakers?.getModel().moderator_notes;
    }

    public get canSeeModerationNote(): boolean {
        return this._canSeeModerationNote;
    }

    private _canSeeModerationNote: boolean;

    public get canManageModerationNote(): boolean {
        return this._canManageModerationNote;
    }

    private _canManageModerationNote: boolean;

    @ContentChild(ListOfSpeakersContentTitleDirective, { read: TemplateRef })
    public explicitTitleContent: TemplateRef<any> | null = null;

    private _listOfSpeakers: ViewListOfSpeakers | null = null;

    private _contentObject: BaseViewModel = this._listOfSpeakers?.content_object;

    public constructor(
        protected override translate: TranslateService,
        private operator: OperatorService,
        private formBuilder: FormBuilder,
        protected LoSRepo: ListOfSpeakersRepositoryService,
        private moderationNotePdfService: ModerationNotePdfService,
        private cd: ChangeDetectorRef
    ) {
        super();

        this.moderatorNoteForm = this.formBuilder.group({
            moderator_notes: ``
        });
    }

    public ngOnInit(): void {
        this.operator.permissionsObservable.subscribe(() => {
            this._canSeeModerationNote = this.operator.hasPerms(Permission.listOfSpeakersCanSeeModeratorNotes);
            this._canManageModerationNote = this.operator.hasPerms(Permission.listOfSpeakersCanManageModeratorNotes);
            this.cd.markForCheck();
        });
    }

    public toggleEditModeratorNote(): void {
        this.isEditing = !this.isEditing;
        if (this.isEditing && !!this.moderatorNotesForForm) {
            this.moderatorNoteForm.setValue({ moderator_notes: this.moderatorNotesForForm });
        }
    }

    public saveChangesModerationNote(): void {
        this.LoSRepo.update(this.moderatorNoteForm.value, this.listOfSpeakers)
            .then(() => {
                this.isEditing = false;
            })
            .catch(this.raiseError);
    }

    public onDownloadPDF(): void {
        this.moderationNotePdfService.exportSingleModerationNote(
            this.moderatorNotesForForm,
            this._listOfSpeakers?.getTitle()
        );
    }
}
