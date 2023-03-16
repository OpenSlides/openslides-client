import { Injectable } from '@angular/core';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { Action } from 'src/app/gateways/actions';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { ViewPersonalNote } from 'src/app/site/pages/meetings/pages/motions';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { PersonalNoteAction } from './personal-note.action';

/**
 */
@Injectable({
    providedIn: `root`
})
export class PersonalNoteRepositoryService extends BaseMeetingRelatedRepository<ViewPersonalNote, PersonalNote> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PersonalNote);
    }

    public getTitle = (viewPersonalNote: ViewPersonalNote) => this.getVerboseName();

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? `Personal notes` : `Personal note`);

    public create(personalNote: Partial<PersonalNote>, content_object_id: Fqid): Action<Identifiable> {
        if (personalNote.star === undefined && personalNote.note === undefined) {
            throw new Error(`At least one of note or starhas to be given!`);
        }
        return this.createAction(PersonalNoteAction.CREATE, [
            {
                content_object_id,
                star: personalNote.star,
                note: personalNote.note
            }
        ]);
    }

    public update(update: Partial<PersonalNote>, personalNote: Identifiable): Action<void> {
        return this.createAction(PersonalNoteAction.UPDATE, [
            {
                id: personalNote.id,
                star: update.star,
                note: update.note
            }
        ]);
    }

    public delete(model: PersonalNote): Action<void> {
        const payload: Identifiable = {
            id: model.id
        };
        return this.createAction(PersonalNoteAction.DELETE, [payload]);
    }
}
