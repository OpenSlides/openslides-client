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
import { AgendaItemRepositoryService } from 'src/app/gateways/repositories/agenda';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewAgendaItem, ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ListOfSpeakersContentTitleDirective } from '../../directives/list-of-speakers-content-title.directive';

@Component({
    selector: `os-moderation-note`,
    templateUrl: `./moderation-note.component.html`,
    styleUrls: [`./moderation-note.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModerationNoteComponent extends BaseMeetingComponent implements OnInit {
    public isEditing = false;

    public moderatorNoteForm: UntypedFormGroup;

    public get agendaItem(): ViewAgendaItem<any> {
        return this.agendaItemRepo.getViewModelUnsafe(this._contentObject?.getModel().agenda_item_id);
    }

    @Input()
    public set listOfSpeakers(los: ViewListOfSpeakers) {
        if (los) {
            this._listOfSpeakers = los;
            this._contentObject = this._listOfSpeakers.content_object;
        }
    }

    public get moderatorNotes(): Observable<string> {
        return this.agendaItemRepo
            .getViewModelObservable(this._contentObject?.getModel().agenda_item_id)
            .pipe(map(item => item?.moderator_notes));
    }

    private get moderatorNotesForForm(): string {
        return this.agendaItemRepo.getViewModel(this._contentObject?.getModel().agenda_item_id).moderator_notes;
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
        protected agendaItemRepo: AgendaItemRepositoryService,
        private cd: ChangeDetectorRef
    ) {
        super();

        this.moderatorNoteForm = this.formBuilder.group({
            moderator_notes: ``
        });
    }

    public ngOnInit(): void {
        this.operator.permissionsObservable.subscribe(() => {
            this._canSeeModerationNote = this.operator.hasPerms(Permission.agendaItemCanSeeModeratorNotes);
            this._canManageModerationNote = this.operator.hasPerms(Permission.agendaItemCanManageModeratorNotes);
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
        this.agendaItemRepo
            .update(this.moderatorNoteForm.value, this.agendaItem)
            .then(() => {
                this.isEditing = false;
            })
            .catch(this.raiseError);
    }
}
