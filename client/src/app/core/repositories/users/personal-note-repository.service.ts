import { Injectable } from '@angular/core';

import { PersonalNoteAction } from 'app/core/actions/personal-note-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { PersonalNote } from 'app/shared/models/users/personal-note';
import { ViewPersonalNote } from 'app/site/users/models/view-personal-note';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 */
@Injectable({
    providedIn: 'root'
})
export class PersonalNoteRepositoryService extends BaseRepositoryWithActiveMeeting<ViewPersonalNote, PersonalNote> {
    /**
     * @param DS The DataStore
     * @param mapperService Maps collection strings to classes
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, PersonalNote);
    }

    public getTitle = (viewPersonalNote: ViewPersonalNote) => {
        return this.getVerboseName();
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Personal notes' : 'Personal note');
    };

    public getFieldsets(): Fieldsets<PersonalNote> {
        const detailFields: (keyof PersonalNote)[] = ['id', 'star', 'note'];
        return {
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async create(data: PersonalNoteAction.CreatePayload): Promise<Identifiable> {
        if (!data.star && !data.note) {
            throw new Error('At least one of note or star has to be given!');
        }
        const payload: PersonalNoteAction.CreatePayload = {
            content_object_id: data.content_object_id,
            star: data.star,
            note: data.note
        };
        return this.actions.sendRequest(PersonalNoteAction.CREATE, payload);
    }

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async update(data: Partial<PersonalNoteAction.UpdatePayload>, model: PersonalNote): Promise<void> {
        const payload: PersonalNoteAction.UpdatePayload = {
            id: model.id,
            star: data.star,
            note: data.note
        };
        return this.actions.sendRequest(PersonalNoteAction.UPDATE, payload);
    }

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async delete(model: PersonalNote): Promise<void> {
        const payload: PersonalNoteAction.DeletePayload = {
            id: model.id
        };
        return this.actions.sendRequest(PersonalNoteAction.DELETE, payload);
    }
}
