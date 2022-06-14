import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { Action } from 'src/app/gateways/actions';
import { PersonalNoteRepositoryService } from 'src/app/gateways/repositories/motions/personal-note-repository.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { HasPersonalNote, ViewPersonalNote } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class PersonalNoteControllerService extends BaseMeetingControllerService<ViewPersonalNote, PersonalNote> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PersonalNoteRepositoryService
    ) {
        super(controllerServiceCollector, PersonalNote, repo);
    }

    public getPersonalNoteFor(contentObjectId: Fqid): Observable<ViewPersonalNote> {
        return this.getViewModelListObservable().pipe(
            map(notes => notes.find(note => note.content_object_id === contentObjectId))
        );
    }

    public async setPersonalNote(
        partialNote: any,
        ...contentObjects: (BaseViewModel & HasPersonalNote)[]
    ): Promise<void> {
        const createActions: Action<Identifiable>[] = [];
        const updateActions: Action<void>[] = [];
        for (const object of contentObjects) {
            if (object.getPersonalNote()) {
                updateActions.push(this.repo.update(partialNote, object.getPersonalNote()!));
            } else {
                createActions.push(this.repo.create(partialNote, object.fqid));
            }
        }
        await Action.from(...createActions, ...updateActions).resolve();
    }
}
