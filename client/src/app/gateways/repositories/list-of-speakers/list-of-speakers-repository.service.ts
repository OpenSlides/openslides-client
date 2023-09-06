import { Injectable } from '@angular/core';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { hasListOfSpeakers, ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { SpeakerAction } from '../speakers/speaker.action';
import { ListOfSpeakersAction } from './list-of-speakers.action';

/**
 * Repository service for lists of speakers
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: `root`
})
export class ListOfSpeakersRepositoryService extends BaseMeetingRelatedRepository<ViewListOfSpeakers, ListOfSpeakers> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, ListOfSpeakers);
    }

    public getVerboseName = (plural = false) =>
        this.translate.instant(plural ? `Lists of speakers` : `List of speakers`);

    public override getTitle = (viewListOfSpeakers: ViewListOfSpeakers) => {
        if (viewListOfSpeakers?.content_object) {
            return viewListOfSpeakers.content_object.getListOfSpeakersTitle();
        }
        return ``;
    };

    /**
     * Sets the closed attribute for one or many List Of Speakers
     * Extracts the ViewListOfSpeakers from BaseViewModel automatically if they contain any.
     * Offers a lot of convinience since closing the a List Of Speakers is required in many differnent
     * contexts
     *
     * @param closed Open or close the ListOfSpeakers
     * @param modelObjects Can be either ViewListOfSpeakers or BaseViewModels with list of speakers
     * @returns void
     */
    public async setClosed(closed: boolean, ...modelObjects: ViewListOfSpeakers[] | BaseViewModel[]): Promise<void> {
        const payload = modelObjects.map((model: ViewListOfSpeakers | BaseViewModel) => {
            let los: ViewListOfSpeakers;
            if (model instanceof ViewListOfSpeakers) {
                los = model;
            } else if (hasListOfSpeakers(model)) {
                los = model.list_of_speakers!;
            }
            return { id: los!.id, closed: closed };
        });

        return await this.sendBulkActionToBackend(ListOfSpeakersAction.UPDATE, payload);
    }

    /**
     * Deletes all speakers of the given list of speakers.
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async deleteAllSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const payload = { id: listOfSpeakers.id };
        return await this.sendActionToBackend(ListOfSpeakersAction.DELETE_ALL_SPEAKERS, payload);
    }

    /**
     * Readds the last speaker to the list of speakers
     *
     * @param listOfSpeakers the list of speakers to modify
     */
    public async readdLastSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const payload = { id: listOfSpeakers.id };
        return await this.sendActionToBackend(ListOfSpeakersAction.RE_ADD_LAST_SPEAKER, payload);
    }

    /**
     * Deletes all next speakers of the given list of speakers.
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async deleteAllNextSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const payload = listOfSpeakers.waitingSpeakers.map(speaker => ({ id: speaker.id }));
        return await this.sendBulkActionToBackend(SpeakerAction.DELETE, payload);
    }

    /**
     * Deletes all previous speakers of the given list of speakers.
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async deleteAllPreviousSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const payload = listOfSpeakers.finishedSpeakers.map(speaker => ({ id: speaker.id }));
        return await this.sendBulkActionToBackend(SpeakerAction.DELETE, payload);
    }
}
