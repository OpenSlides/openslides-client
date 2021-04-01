import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { Moment } from 'moment';

import { MeetingAction } from 'app/core/actions/meeting-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { MeetingSettingsDefinitionProvider } from 'app/core/ui-services/meeting-settings-definition-provider.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { Projection } from 'app/shared/models/projector/projection';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from '../repository-service-collector-without-active-meeting-service';

export enum MeetingProjectionType {
    CurrentListOfSpeakers = 'current-list-of-speakers',
    CurrentSpeakerChyron = 'current-speaker-chyron',
    AgendaItemList = 'agenda-item-list'
}

@Injectable({
    providedIn: 'root'
})
export class MeetingRepositoryService extends BaseRepository<ViewMeeting, Meeting> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorWithoutActiveMeetingService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionProvider
    ) {
        super(repositoryServiceCollector, Meeting);
    }

    public getFieldsets(): Fieldsets<Meeting> {
        const nameFields: (keyof Meeting)[] = ['name', 'start_time', 'end_time'];
        const listFields: (keyof Meeting)[] = nameFields.concat('user_ids');
        const editFields: (keyof Meeting)[] = nameFields.concat([
            'welcome_title',
            'description',
            'location',
            'url_name',
            'guest_ids',
            'enable_anonymous',
            'is_template'
        ]);
        const dashboardFields: (keyof Meeting)[] = listFields.concat('location');

        return {
            [DEFAULT_FIELDSET]: nameFields,
            list: listFields,
            edit: editFields,
            dashboard: dashboardFields,
            settings: this.meetingSettingsDefinitionProvider.getSettingsKeys()
        };
    }

    public getTitle = (viewMeeting: ViewMeeting) => {
        return viewMeeting.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Meetings' : 'Meeting');
    };

    public getProjectorTitle = (viewMeeting: ViewMeeting, projection: Projection) => {
        let title;

        switch (projection.type as MeetingProjectionType) {
            case MeetingProjectionType.CurrentListOfSpeakers:
                title = 'Current list of speakers';
                break;
            case MeetingProjectionType.CurrentSpeakerChyron:
                title = 'Current speaker chyron';
                break;
            case MeetingProjectionType.AgendaItemList:
                title = 'Agenda';
                break;
            default:
                console.warn('Unknown slide type for meeting:', projection.type);
                title = '<unknown>';
                break;
        }

        return { title };
    };

    protected createViewModel(model: Meeting): ViewMeeting {
        const viewModel = super.createViewModel(model);
        viewModel.getProjectorTitle = (projection: Projection) => this.getProjectorTitle(viewModel, projection);
        return viewModel;
    }

    public create(meetingPayload: Partial<MeetingAction.CreatePayload>): Promise<Identifiable> {
        meetingPayload.start_time = this.anyDateToUnix(meetingPayload.start_time);
        meetingPayload.end_time = this.anyDateToUnix(meetingPayload.end_time);
        return this.sendActionToBackend(MeetingAction.CREATE, meetingPayload);
    }

    /**
     * If required again, out into service. Casting dates out of most things
     * DATE
     * simply saving forms will fire an empty "date"
     * NUMBER
     * automatic functions (multi stack actions) will use numbers
     * MOMENT
     * using the date picker will send a moment object
     */
    private anyDateToUnix(date: Date | Moment | number): number {
        if (date instanceof Date) {
            return Math.round(date.getTime() / 1000);
        } else if (typeof date === 'number') {
            return date;
        } else if (moment.isMoment(date)) {
            return date.unix();
        } else {
            throw new Error('Invalid type of date: ' + date);
        }
    }

    public update(update: MeetingAction.OptionalUpdatePayload, meeting: ViewMeeting): Promise<void> {
        update.start_time = this.anyDateToUnix(update.start_time);
        update.end_time = this.anyDateToUnix(update.end_time);
        const payload: MeetingAction.UpdatePayload = {
            ...update,
            id: meeting.id
        };
        return this.sendActionToBackend(MeetingAction.UPDATE, payload);
    }

    public delete(committee: ViewMeeting): Promise<void> {
        return this.sendActionToBackend(MeetingAction.DELETE, { id: committee.id });
    }

    public deleteAllSpeakersOfAllListsOfSpeakersInAMeeting(meetingId: Id): Promise<void> {
        const payload: MeetingAction.DeleteAllSpeakersOfAllListsPayload = {
            id: meetingId
        };
        return this.sendActionToBackend(MeetingAction.DELETE_ALL_SPEAKERS_OF_ALL_LISTS, payload);
    }
}
