import { Injectable } from '@angular/core';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { PersonalNoteServiceModule } from '../../personal-note-service.module';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { HasPersonalNote, ViewPersonalNote } from '../../view-models';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { PersonalNoteRepositoryService } from 'src/app/gateways/repositories/motions/personal-note-repository.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { Action } from 'src/app/gateways/actions';
import { Identifiable } from 'src/app/domain/interfaces';

@Injectable({
    providedIn: PersonalNoteServiceModule
})
export class PersonalNoteControllerService extends BaseMeetingControllerService<ViewPersonalNote, PersonalNote> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PersonalNoteRepositoryService
    ) {
        super(controllerServiceCollector, PersonalNote, repo);
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
