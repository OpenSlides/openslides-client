import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Collection, Id } from 'src/app/domain/definitions/key-types';
import { HasMeetingId, HasSequentialNumber, isSequentialNumberHaving } from 'src/app/domain/interfaces';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { AutoupdateService, ModelSubscription } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService, SimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../view-models/view-meeting';
import { ActiveMeetingService } from './active-meeting.service';
import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';

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
        return this.activeMeeting.meetingId!;
    }

    private _mapSequentialNumberId: {
        [collection: string]: { [meeting_id_sequential_number: string]: BehaviorSubject<number | null> };
    } = {};

    private _modelRequestSubscription: ModelSubscription | null = null;
    private _subscriptions: Subscription[] = [];
    private _repositories: BaseMeetingRelatedRepository<any, any>[] = [];

    public constructor(
        collectionMapperService: MeetingCollectionMapperService,
        private activeMeeting: ActiveMeetingService,
        private autoupdateService: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService
    ) {
        activeMeeting.meetingIdObservable.subscribe(nextId => {
            this._mapSequentialNumberId = {};
            if (nextId) {
                this.prepareSequentialNumberMapping();
            } else if (!nextId && this._modelRequestSubscription) {
                this._modelRequestSubscription.close();
                this._modelRequestSubscription = null;
            }
        });
        collectionMapperService.getAllRepositoriesObservable().subscribe(repositories => {
            this._repositories = repositories;
            this.updateRepositoriesSubscriptions();
        });
    }

    /**
     * Waits until an id should be available.
     *
     * @returns null if not found otherwise the id
     */
    public async getIdBySequentialNumber({
        collection,
        meetingId,
        sequentialNumber
    }: SequentialNumberMappingConfig): Promise<number | null> {
        if (!collection || !meetingId || !sequentialNumber) {
            return null;
        }

        await this._modelRequestSubscription.receivedData;

        const meetingIdSequentialNumber = `${meetingId}/${sequentialNumber}`;
        return this.getBehaviorSubject(collection, meetingIdSequentialNumber).getValue();
    }

    public getIdObservableBySequentialNumber({
        collection,
        meetingId,
        sequentialNumber
    }: SequentialNumberMappingConfig): Observable<Id | null> {
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
        this._modelRequestSubscription = this.autoupdateService.subscribe(
            await this.modelRequestBuilder.build(this.getSequentialNumberRequest()),
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
            subscription!.unsubscribe();
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

    private getBehaviorSubject(
        collection: Collection,
        meetingIdSequentialNumber: string
    ): BehaviorSubject<number | null> {
        if (!this._mapSequentialNumberId[collection]) {
            this._mapSequentialNumberId[collection] = {};
        }
        if (!this._mapSequentialNumberId[collection][meetingIdSequentialNumber]) {
            this._mapSequentialNumberId[collection][meetingIdSequentialNumber] = new BehaviorSubject<number | null>(
                null
            );
        }
        return this._mapSequentialNumberId[collection][meetingIdSequentialNumber];
    }
}
