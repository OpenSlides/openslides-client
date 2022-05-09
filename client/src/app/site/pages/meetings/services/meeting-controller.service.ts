import { Injectable } from '@angular/core';
import { ControllerServiceCollectorService } from '../../../services/controller-service-collector.service';
import { Meeting } from '../../../../domain/models/meetings/meeting';
import { ViewMeeting } from '../view-models/view-meeting';
import { MeetingRepositoryService } from '../../../../gateways/repositories/meeting-repository.service';
import { Identifiable } from '../../../../domain/interfaces';
import { Observable } from 'rxjs';
import { BaseController } from 'src/app/site/base/base-controller';
import { ViewUser } from '../view-models/view-user';
import { Id } from 'src/app/domain/definitions/key-types';
import { Action } from 'src/app/gateways/actions';

export interface MeetingUserModifiedFields {
    addedUsers?: ViewUser[];
    removedUsers?: ViewUser[];
    addedAdmins?: ViewUser[];
    removedAdmins?: ViewUser[];
}

@Injectable({
    providedIn: 'root'
})
export class MeetingControllerService extends BaseController<ViewMeeting, Meeting> {
    public constructor(
        repositoryServiceCollector: ControllerServiceCollectorService,
        protected override repo: MeetingRepositoryService
    ) {
        super(repositoryServiceCollector, Meeting, repo);
    }

    public create(...payload: any[]): Action<Identifiable[]> {
        return this.repo.create(...payload);
    }

    public update(
        update: any,
        config: {
            meeting?: ViewMeeting;
            options?: MeetingUserModifiedFields;
        } = {}
    ): Promise<void> {
        return this.repo.update(update, config.meeting, config.options);
    }

    public delete(...meetings: Identifiable[]): Promise<void> {
        return this.repo.delete(...meetings);
    }

    public duplicate(...meetings: (Partial<Meeting> & { meeting_id: Id })[]): Action<Identifiable[]> {
        return this.repo.duplicate(...meetings);
    }

    public duplicateFrom(
        committeeId: Id,
        ...meetings: (Partial<Meeting> & { meeting_id: Id })[]
    ): Action<Identifiable[]> {
        return this.repo.duplicateFrom(committeeId, ...meetings);
    }

    public archive(...meetings: ViewMeeting[]): Promise<void> {
        return this.repo.archive(...meetings);
    }

    public unarchive(...meetings: ViewMeeting[]): Promise<void> {
        return this.repo.unarchive(...meetings);
    }

    public deleteAllSpeakersOfAllListsOfSpeakersIn(meetingId: Id): Promise<void> {
        return this.repo.deleteAllSpeakersOfAllListsOfSpeakersIn(meetingId);
    }

    public getGeneralViewModelObservable(): Observable<ViewMeeting> {
        return this.repo.getGeneralViewModelObservable();
    }

    public parseUnixToMeetingTime(time?: number): string {
        if (!time) {
            return ``;
        }
        const date = new Date(time);
        const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
        return `${date.getFullYear()}${month}${date.getDate()}`;
    }
}
