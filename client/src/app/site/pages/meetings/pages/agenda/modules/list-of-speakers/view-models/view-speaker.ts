import { _ } from '@ngx-translate/core';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';
import { CountdownData } from 'src/app/site/pages/meetings/modules/projector/modules/countdown-time/countdown-time.component';
import { ViewStructureLevelListOfSpeakers } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';

import { Id } from '../../../../../../../../domain/definitions/key-types';
import { Speaker } from '../../../../../../../../domain/models/speakers/speaker';
import { SpeakerState } from '../../../../../../../../domain/models/speakers/speaker-state';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../../motions';
import { ViewListOfSpeakers } from './view-list-of-speakers';
import { ViewPointOfOrderCategory } from './view-point-of-order-category';

export interface SpeakerSpeechStateData {
    speech_state: SpeechState;
    answer: boolean;
}

export function getSpeakerVerboseState(speaker: SpeakerSpeechStateData): string {
    switch (speaker.speech_state) {
        case SpeechState.INTERPOSED_QUESTION:
            if (speaker.answer) {
                return _(`Answer to interposed question`);
            }
            return _(`Interposed question`);
        case SpeechState.INTERVENTION:
            if (speaker.answer) {
                return _(`Answer to intervention`);
            }
            return _(`Intervention`);
        case SpeechState.PRO:
            return _(`Forspeech`);
        case SpeechState.CONTRA:
            return _(`Counter speech`);
        case SpeechState.CONTRIBUTION:
            return _(`Contribution`);
    }
}

export function getSpeakerStateIcon(speaker: SpeakerSpeechStateData): string {
    switch (speaker.speech_state) {
        case SpeechState.INTERPOSED_QUESTION:
            return `contact_support`;
        case SpeechState.INTERVENTION:
            return `feedback`;
        case SpeechState.PRO:
            return `add_circle`;
        case SpeechState.CONTRA:
            return `remove_circle`;
        case SpeechState.CONTRIBUTION:
            return `star`;
    }
}

export enum SpeechWaitingState {
    WAITING = `waiting`,
    STARTED = `started`,
    FINISHED = `finished`
}

/**
 * Provides "safe" access to a speaker with all it's components
 */
export class ViewSpeaker extends BaseHasMeetingUserViewModel<Speaker> {
    public static COLLECTION = Speaker.COLLECTION;
    protected _collection = Speaker.COLLECTION;

    public get speaker(): Speaker {
        return this._model;
    }

    /**
     * @returns
     *  - waiting if there is no begin nor end time
     *  - current if there is a begin time and not end time
     *  - finished if there are both begin and end time
     */
    public get state(): SpeakerState {
        if (this.speaker.speech_state === SpeechState.INTERPOSED_QUESTION && !this.speaker.end_time) {
            return SpeakerState.INTERPOSED_QUESTION;
        } else if (!this.speaker.begin_time && !this.speaker.end_time) {
            return SpeakerState.WAITING;
        } else if (this.speaker.begin_time && (this.speaker.pause_time || !this.speaker.end_time)) {
            return SpeakerState.CURRENT;
        } else {
            return SpeakerState.FINISHED;
        }
    }

    public get speechStateStr(): string {
        const speechState = this.speaker.speech_state;
        switch (speechState) {
            case SpeechState.INTERPOSED_QUESTION:
                return _(`Interposed question`);
            case SpeechState.INTERVENTION:
                return _(`Intervention`);
            case SpeechState.CONTRIBUTION:
                return _(`Contribution`);
            case SpeechState.CONTRA:
                return _(`Contra`);
            case SpeechState.PRO:
                return _(`Pro`);
        }
    }

    public get isSpeaking(): boolean {
        return this.speaker.begin_time && !this.speaker.end_time && !this.speaker.pause_time;
    }

    public get isCurrentSpeaker(): boolean {
        return this.speaker.begin_time && !this.speaker.end_time;
    }

    public get isFinished(): boolean {
        return this.state === SpeakerState.FINISHED;
    }

    public get isWaiting(): boolean {
        return (
            this.state === SpeakerState.WAITING ||
            (this.state === SpeakerState.INTERPOSED_QUESTION && !this.speaker.begin_time)
        );
    }

    public get numbering(): string {
        if (this.list_of_speakers?.content_object.collection === `motion`) {
            return (this.list_of_speakers?.content_object as ViewMotion).number;
        } else if (this.list_of_speakers?.content_object.collection === `topic`) {
            return this.list_of_speakers?.content_object.agenda_item.item_number;
        }
        return null;
    }

    public get name(): string {
        return this.user ? this.user.getFullName(this.structure_level_list_of_speakers?.structure_level) : ``;
    }

    public getLOSName(listAllStructureLevels: boolean): string {
        if (listAllStructureLevels) {
            return this.user?.getFullName() || ``;
        }

        return this.user ? this.user.getFullName(this.structure_level_list_of_speakers?.structure_level || null) : ``;
    }

    public getLOSStructureLevels(listAllStructureLevels: boolean): string {
        if (listAllStructureLevels) {
            return this.user?.structureLevels() || ``;
        }

        return this.structure_level_list_of_speakers?.structure_level?.getTitle() || ``;
    }

    public get user_short_name(): string {
        return this.user ? this.user.short_name : ``;
    }

    public get user_pronoun(): string {
        return this.user ? this.user.pronoun : ``;
    }

    public get user_title(): string {
        return this.user ? this.user.title : ``;
    }

    public get user_first_name(): string {
        return this.user ? this.user.first_name : ``;
    }

    public get user_last_name(): string {
        return this.user ? this.user.last_name : ``;
    }

    public get user_number(): string {
        return this.user ? this.meeting_user.number : ``;
    }

    public get userId(): Id {
        return this.user_id;
    }

    public get gender(): string {
        return this.user ? this.user.gender?.name : ``;
    }

    public get contentType(): string {
        if (!this.list_of_speakers?.content_object_id) {
            return null;
        }

        return collectionFromFqid(this.list_of_speakers?.content_object_id);
    }

    public get contentSeqNum(): string {
        if (!this.list_of_speakers?.content_object) {
            return null;
        }
        return this.list_of_speakers?.content_object[`sequential_number`];
    }

    public get topic(): string {
        const number = this.list_of_speakers?.content_object?.agenda_item?.item_number;
        const title = this.list_of_speakers?.content_object?.getTitle();

        return number ? `${number} - ${title}` : title || ``;
    }

    public get structureLevelName(): string {
        return this.structure_level_list_of_speakers?.structure_level
            ? this.structure_level_list_of_speakers.structure_level.name
            : ``;
    }

    public get structureLevelId(): Id {
        return this.structure_level_list_of_speakers ? this.structure_level_list_of_speakers.structure_level_id : null;
    }

    public get speakingTime(): number {
        return this.speaker.end_time
            ? this.speaker.end_time - this.speaker.begin_time - (this.speaker.total_pause || 0)
            : null;
    }

    public get verboseState(): string {
        return getSpeakerVerboseState(this);
    }

    public get stateIcon(): string {
        return getSpeakerStateIcon(this);
    }

    public get hasSpoken(): SpeechWaitingState {
        if (this.speaker.begin_time) {
            if (this.speaker.end_time) {
                return SpeechWaitingState.FINISHED;
            }
            return SpeechWaitingState.STARTED;
        }
        return SpeechWaitingState.WAITING;
    }

    public getBeginTimeAsDate(): Date | null {
        return this.speaker.begin_time ? new Date(this.speaker.begin_time * 1000) : null;
    }

    public getEndTimeAsDate(): Date | null {
        return this.speaker.end_time ? new Date(this.speaker.end_time * 1000) : null;
    }

    public getCountupData(): CountdownData {
        const total_pause = this.total_pause || 0;
        const end = this.pause_time || this.end_time || 0;
        return {
            running: this.isSpeaking,
            default_time: 0,
            countdown_time: this.isSpeaking
                ? this.begin_time + total_pause
                : (end - (this.begin_time + total_pause) || 0) * -1
        };
    }

    public getCountdownData(default_time: number): CountdownData {
        const total_pause = this.total_pause || 0;
        const end = this.pause_time || this.end_time || 0;
        const countdown_time = this.isSpeaking
            ? this.begin_time + total_pause + default_time
            : (end - (this.begin_time + total_pause + default_time)) * -1;
        return {
            running: this.isSpeaking,
            default_time,
            countdown_time: this.begin_time ? countdown_time : default_time
        };
    }
}
interface ISpeakerRelations {
    list_of_speakers: ViewListOfSpeakers;
    point_of_order_category: ViewPointOfOrderCategory;
    structure_level_list_of_speakers: ViewStructureLevelListOfSpeakers;
}
export interface ViewSpeaker extends Speaker, ViewModelRelations<ISpeakerRelations>, HasMeeting {}
