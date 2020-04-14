import { Component, Input, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Follow } from 'app/core/core-services/model-request-builder.service';
import { Fqid } from 'app/core/definitions/key-types';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { HasListOfSpeakers, hasListOfSpeakers, ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseViewModel } from 'app/site/base/base-view-model';

export const SPEAKER_BUTTON_FOLLOW: Follow = {
    idField: 'list_of_speakers_id',
    follow: [
        {
            idField: 'speaker_ids',
            fieldset: ['begin_time', 'end_time'] // required for ViewSpeaker.state -> waitingSpeakersAmount
        }
    ],
    fieldset: ['closed']
};

/**
 * A generic button to go to the list of speakers. Give the content object with
 * [object]=object, which can be a ContentObject or a ViewModelWithListOfSpeakers.
 * - Usage as a mini-fab (like in the agenda) with [menuItem]=false (default)
 * - Usage in a dropdown (=list) with [menuItem]=true
 */
@Component({
    selector: 'os-speaker-button',
    templateUrl: './speaker-button.component.html'
})
export class SpeakerButtonComponent implements OnDestroy {
    @Input()
    public set object(obj: (BaseViewModel & HasListOfSpeakers) | Fqid | null) {
        const listOfSpeakers = hasListOfSpeakers(obj) ? obj.list_of_speakers : null;

        this.cleanLosSub();
        if (listOfSpeakers) {
            this.losSub = this.listOfSpeakersRepo
                .getViewModelObservable(listOfSpeakers.id)
                .pipe(distinctUntilChanged())
                .subscribe(speakerObj => {
                    this.listOfSpeakers = speakerObj;
                });
        }
    }

    public listOfSpeakers: ViewListOfSpeakers | null;

    @Input()
    public disabled: boolean;

    @Input()
    public menuItem = false;

    public get listOfSpeakersUrl(): string {
        if (!this.disabled) {
            return this.listOfSpeakers.listOfSpeakersUrl;
        }
    }

    public get icon(): string {
        return this.listOfSpeakers.closed ? 'voice_over_off' : 'record_voice_over';
    }

    public get tooltip(): string {
        return this.listOfSpeakers.closed ? 'The list of speakers is closed.' : 'List of speakers';
    }

    private losSub: Subscription;

    /**
     * The constructor
     */
    public constructor(private listOfSpeakersRepo: ListOfSpeakersRepositoryService) {}

    public ngOnDestroy(): void {
        this.cleanLosSub();
    }

    private cleanLosSub(): void {
        if (this.losSub) {
            this.losSub.unsubscribe();
            this.losSub = null;
        }
    }
}
