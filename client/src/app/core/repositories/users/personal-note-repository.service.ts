import { Injectable } from '@angular/core';

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

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async create(): Promise<Identifiable> {
        throw new Error('Not supported');
    }

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async update(): Promise<void> {
        throw new Error('Not supported');
    }

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async patch(): Promise<void> {
        throw new Error('Not supported');
    }

    /**
     * Overwrite the default procedure
     *
     * @ignore
     */
    public async delete(): Promise<void> {
        throw new Error('Not supported');
    }
}
