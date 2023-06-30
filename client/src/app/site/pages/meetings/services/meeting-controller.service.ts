import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Action } from 'src/app/gateways/actions';
import { ImportMeeting } from 'src/app/gateways/repositories/meeting-repository.service';
import { PointOfOrderCategoryRepositoryService } from 'src/app/gateways/repositories/point-of-order-category/point-of-order-category-repository.service';
import { BaseController } from 'src/app/site/base/base-controller';

import { Identifiable } from '../../../../domain/interfaces';
import { Meeting } from '../../../../domain/models/meetings/meeting';
import { MeetingRepositoryService } from '../../../../gateways/repositories/meeting-repository.service';
import { ControllerServiceCollectorService } from '../../../services/controller-service-collector.service';
import { ViewMeeting } from '../view-models/view-meeting';
import { ViewUser } from '../view-models/view-user';

export interface MeetingUserModifiedFields {
    addedUsers?: ViewUser[];
    removedUsers?: ViewUser[];
    addedAdmins?: ViewUser[];
    removedAdmins?: ViewUser[];
}

@Injectable({
    providedIn: `root`
})
export class MeetingControllerService extends BaseController<ViewMeeting, Meeting> {
    private get pointOfOrdercategoryRepo(): PointOfOrderCategoryRepositoryService {
        if (!this._pointOfOrdercategoryRepo) {
            this._pointOfOrdercategoryRepo = this.injector.get(PointOfOrderCategoryRepositoryService);
        }
        return this._pointOfOrdercategoryRepo;
    }

    private _pointOfOrdercategoryRepo: PointOfOrderCategoryRepositoryService;

    public constructor(
        repositoryServiceCollector: ControllerServiceCollectorService,
        protected override repo: MeetingRepositoryService,
        private injector: Injector
    ) {
        super(repositoryServiceCollector, Meeting, repo);
    }

    public create(...payload: any[]): Action<Identifiable[]> {
        return this.repo.create(...payload);
    }

    public async update(
        updateData: any,
        config: {
            meeting?: ViewMeeting;
            options?: MeetingUserModifiedFields;
        } = {}
    ): Promise<void> {
        const { point_of_order_category_ids, ...update } = updateData;
        let pointOfOrderCategoryAction: Action<void | Identifiable>;
        if (point_of_order_category_ids) {
            pointOfOrderCategoryAction = this.pointOfOrdercategoryRepo.bulkUpdateCategories(
                point_of_order_category_ids,
                updateData.id || config.meeting.id
            );
        }
        await this.repo.update(update, config.meeting, config.options);
        await pointOfOrderCategoryAction?.resolve();
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

    public import(committeeId: Id, meeting: ImportMeeting): Promise<Identifiable> {
        return this.repo.import(committeeId, meeting);
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
