import { Injectable } from '@angular/core';

import { PersonalNoteAction } from 'app/core/actions/personal-note-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Fqid } from 'app/core/definitions/key-types';
import { PersonalNote } from 'app/shared/models/users/personal-note';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { HasPersonalNote, ViewPersonalNote } from 'app/site/users/models/view-personal-note';
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

    public getTitle = (viewPersonalNote: ViewPersonalNote) => this.getVerboseName();

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? 'Personal notes' : 'Personal note');

    public getFieldsets(): Fieldsets<PersonalNote> {
        const detailFields: (keyof PersonalNote)[] = ['id', 'star', 'note'];
        return {
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    public async setPersonalNote(
        partialNote: PersonalNoteAction.BasePayload,
        ...contentObjects: (BaseViewModel & HasPersonalNote)[]
    ): Promise<void> {
        const createPayload: PersonalNoteAction.CreatePayload[] = [];
        const updatePayload: PersonalNoteAction.UpdatePayload[] = [];
        for (const object of contentObjects) {
            if (object.getPersonalNote()) {
                updatePayload.push(this.getUpdatePayload(partialNote, object.getPersonalNote()));
            } else {
                createPayload.push(this.getCreatePayload(partialNote, object.fqid));
            }
        }
        const actions = [];
        if (createPayload.length) {
            actions.push({ action: PersonalNoteAction.CREATE, data: createPayload });
        }
        if (updatePayload.length) {
            actions.push({ action: PersonalNoteAction.UPDATE, data: updatePayload });
        }
        await this.sendActionsToBackend(actions);
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

    private getCreatePayload(
        data: PersonalNoteAction.BasePayload,
        content_object_id: Fqid
    ): PersonalNoteAction.CreatePayload {
        if (data.star === undefined && data.note === undefined) {
            throw new Error('At least one of note or starhas to be given!');
        }
        return {
            content_object_id,
            star: data.star,
            note: data.note
        };
    }

    private getUpdatePayload(
        data: PersonalNoteAction.BasePayload,
        model: PersonalNote
    ): PersonalNoteAction.UpdatePayload {
        return {
            id: model.id,
            star: data.star,
            note: data.note
        };
    }
}
