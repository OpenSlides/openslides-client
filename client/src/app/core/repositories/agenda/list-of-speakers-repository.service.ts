import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository service for lists of speakers
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class ListOfSpeakersRepositoryService extends BaseRepository<ViewListOfSpeakers, ListOfSpeakers> {
    /**
     * Contructor for agenda repository.
     *
     * @param DS The DataStore
     * @param httpService OpenSlides own HttpService
     * @param mapperService OpenSlides mapping service for collection strings
     * @param config Read config variables
     * @param dataSend send models to the server
     * @param treeService sort the data according to weight and parents
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private httpService: HttpService
    ) {
        super(repositoryServiceCollector, ListOfSpeakers);
    }

    public getFieldsets(): Fieldsets<ListOfSpeakers> {
        return { [DEFAULT_FIELDSET]: ['closed', 'content_object_id', 'speaker_ids'] };
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Lists of speakers' : 'List of speakers');
    };

    public getTitle = (viewListOfSpeakers: ViewListOfSpeakers) => {
        if (viewListOfSpeakers.content_object) {
            return viewListOfSpeakers.content_object.getListOfSpeakersTitle();
        }
    };

    /**
     * Add a new speaker to a list of speakers.
     * Sends the users id to the server
     *
     * @param userId {@link User} id of the new speaker
     * @param listOfSpeakers the target agenda item
     */
    public async createSpeaker(listOfSpeakers: ViewListOfSpeakers, userId: number): Promise<Identifiable> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        return await this.httpService.post<Identifiable>(restUrl, { user: userId });
    }

    /**
     * Removes the given speaker for the list of speakers
     *
     * @param listOfSpeakers the target list of speakers
     * @param speakerId (otional) the speakers id. If no id is given, the speaker with the
     * current operator is removed.
     */
    public async delete(listOfSpeakers: ViewListOfSpeakers, speakerId?: number): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        await this.httpService.delete(restUrl, speakerId ? { speaker: speakerId } : null);
    }

    /**
     * Deletes all speakers of the given list of speakers.
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async deleteAllSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        await this.httpService.delete(restUrl, { speaker: listOfSpeakers.speakers.map(speaker => speaker.id) });
    }

    /**
     * Posts an (manually) sorted speaker list to the server
     *
     * @param speakerIds array of speaker id numbers
     * @param Item the target agenda item
     */
    public async sortSpeakers(listOfSpeakers: ViewListOfSpeakers, speakerIds: number[]): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'sort_speakers');
        await this.httpService.post(restUrl, { speakers: speakerIds });
    }

    /**
     * Readds the last speaker to the list of speakers
     *
     * @param listOfSpeakers the list of speakers to modify
     */
    public async readdLastSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'readd_last_speaker');
        await this.httpService.post(restUrl);
    }

    /**
     * Marks all speakers for a given user
     *
     * @param userId {@link User} id of the user
     * @param marked determine if the user should be marked or not
     * @param listOfSpeakers the target list of speakers
     */
    public async markSpeaker(listOfSpeakers: ViewListOfSpeakers, speaker: ViewSpeaker, marked: boolean): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        await this.httpService.patch(restUrl, { user: speaker.user.id, marked: marked });
    }

    /**
     * Stops the current speaker
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async stopCurrentSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'speak');
        await this.httpService.delete(restUrl);
    }

    /**
     * Sets the given speaker id to speak
     *
     * @param speakerId the speakers id
     * @param listOfSpeakers the target list of speakers
     */
    public async startSpeaker(listOfSpeakers: ViewListOfSpeakers, speaker: ViewSpeaker): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'speak');
        await this.httpService.put(restUrl, { speaker: speaker.id });
    }

    public async deleteAllSpeakersOfAllListsOfSpeakers(): Promise<void> {
        await this.httpService.post('/rest/agenda/list-of-speakers/delete_all_speakers/');
    }

    /**
     * Helper function get the url to the speaker rest address
     *
     * @param listOfSpeakersId id of the list of speakers
     * @param method the desired speaker action
     */
    private getRestUrl(
        listOfSpeakersId: number,
        method: 'manage_speaker' | 'sort_speakers' | 'speak' | 'readd_last_speaker'
    ): string {
        return `/rest/agenda/list-of-speakers/${listOfSpeakersId}/${method}/`;
    }
}
