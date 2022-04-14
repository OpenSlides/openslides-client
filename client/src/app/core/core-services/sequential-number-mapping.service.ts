import { Injectable } from '@angular/core';
import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { HasSequentialNumber, isSequentialNumberHaving } from 'app/shared/models/base/has-sequential-number';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';

import { ViewMeeting } from '../../management/models/view-meeting';
import { BaseViewModel } from '../../site/base/base-view-model';
import { Collection, Id } from '../definitions/key-types';
import { BaseRepository } from '../repositories/base-repository';
import { ActiveMeetingService } from './active-meeting.service';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { CollectionMapperService } from './collection-mapper.service';
import { SimplifiedModelRequest } from './model-request-builder.service';

const SEQUENTIAL_NUMBER_ID_FIELDS: (keyof ViewMeeting)[] = [
    `motion_ids`,
    `topic_ids`,
    `motion_block_ids`,
    `motion_workflow_ids`,
    `poll_ids`,
    `projector_ids`,
    `motion_category_ids`,
    `assignment_ids`,
    `list_of_speakers_ids`
];

const SEQUENTIAL_NUMBER_REQUIRED_FIELDS = [`sequential_number`, `meeting_id`];

const MODEL_REQUEST_DESCRIPTION = `SequentialNumberMappingService:prepare`;

interface SequentialNumberMappingConfig {
    collection: Collection;
    sequentialNumber: number;
    meetingId: number;
}

@Injectable({ providedIn: `root` })
export class SequentialNumberMappingService {
    private get activeMeetingId(): Id {
        return this.activeMeeting.meetingId;
    }

    private _mapSequentialNumberId: {
        [collection: string]: { [meeting_id_sequential_number: string]: BehaviorSubject<number> };
    } = {};

    private _modelRequestSubscription: ModelSubscription | null = null;
    private _subscriptions: Subscription[] = [];
    private _repositories: BaseRepository<any, any>[] = [];

    public constructor(
        collectionMapperService: CollectionMapperService,
        private activeMeeting: ActiveMeetingService,
        private autoupdateService: AutoupdateService
    ) {
        activeMeeting.meetingIdObservable.subscribe(() => {
            this._mapSequentialNumberId = {};
            this.prepareSequentialNumberMapping();
        });
        collectionMapperService.getAllRepositoriesObservable().subscribe(repositories => {
            this._repositories = repositories;
            this.updateRepositoriesSubscriptions();
        });
    }

    public getIdObservableBySequentialNumber({
        collection,
        meetingId,
        sequentialNumber
    }: SequentialNumberMappingConfig): Observable<Id | undefined> {
        if (!collection || !meetingId || !sequentialNumber) {
            return of();
        }
        const meetingIdSequentialNumber = `${meetingId}/${sequentialNumber}`;
        return this.getBehaviorSubject(collection, meetingIdSequentialNumber);
    }

    private async prepareSequentialNumberMapping(): Promise<void> {
        if (this._modelRequestSubscription) {
            this._modelRequestSubscription.close();
            this._modelRequestSubscription = null;
        }
        this._modelRequestSubscription = await this.autoupdateService.subscribe(
            this.getSequentialNumberRequest(),
            MODEL_REQUEST_DESCRIPTION
        );
    }

    private getSequentialNumberRequest(): SimplifiedModelRequest {
        const createRoutingFollow = (idField: keyof ViewMeeting) => {
            return { idField, fieldset: [], additionalFields: SEQUENTIAL_NUMBER_REQUIRED_FIELDS };
        };
        return {
            ids: [this.activeMeetingId],
            viewModelCtor: ViewMeeting,
            fieldset: [],
            follow: SEQUENTIAL_NUMBER_ID_FIELDS.map(idField => createRoutingFollow(idField))
        };
    }

    private updateRepositoriesSubscriptions(): void {
        while (this._subscriptions.length > 0) {
            const subscription = this._subscriptions.shift();
            subscription.unsubscribe();
        }
        for (const repository of this._repositories) {
            this._subscriptions.push(
                repository
                    .getViewModelListUnsafeObservable()
                    .subscribe(viewModels => this.doSequentialNumberMapping(repository.collection, viewModels))
            );
        }
    }

    private doSequentialNumberMapping(
        collection: Collection,
        viewModels: (BaseViewModel & HasMeetingId & Partial<HasSequentialNumber>)[]
    ): void {
        if (!this._mapSequentialNumberId[collection]) {
            this._mapSequentialNumberId[collection] = {};
        }
        for (const viewModel of viewModels) {
            if (isSequentialNumberHaving(viewModel)) {
                this.insertViewModelId(viewModel);
            }
        }
    }

    private insertViewModelId(viewModel: BaseViewModel & HasSequentialNumber & HasMeetingId): void {
        const meetingIdSequentialNumber = `${viewModel.meeting_id}/${viewModel.sequential_number}`;
        this.getBehaviorSubject(viewModel.collection, meetingIdSequentialNumber).next(viewModel.id);
    }

    private getBehaviorSubject(collection: Collection, meetingIdSequentialNumber: string): BehaviorSubject<number> {
        if (!this._mapSequentialNumberId[collection]) {
            this._mapSequentialNumberId[collection] = {};
        }
        if (!this._mapSequentialNumberId[collection][meetingIdSequentialNumber]) {
            this._mapSequentialNumberId[collection][meetingIdSequentialNumber] = new BehaviorSubject(null);
        }
        return this._mapSequentialNumberId[collection][meetingIdSequentialNumber];
    }
}
