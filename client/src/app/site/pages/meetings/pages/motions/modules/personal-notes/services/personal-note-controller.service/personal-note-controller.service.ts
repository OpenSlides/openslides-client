import { inject, Service } from '@angular/core';
import { Fqid } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { PersonalNote } from '@app/domain/models/motions/personal-note';
import { Action } from '@app/gateways/actions';
import { PersonalNoteRepositoryService } from '@app/gateways/repositories/motions/personal-note-repository.service';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { map, Observable } from 'rxjs';

import { HasPersonalNote, ViewPersonalNote } from '../../view-models';

@Service()
export class PersonalNoteControllerService extends BaseMeetingControllerService<ViewPersonalNote, PersonalNote> {
    protected override repo: PersonalNoteRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(PersonalNoteRepositoryService);
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
