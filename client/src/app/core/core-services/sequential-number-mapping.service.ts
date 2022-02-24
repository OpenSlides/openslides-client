import { Injectable } from '@angular/core';
import { HasSequentialNumber, isSequentialNumberHaving } from 'app/shared/models/base/has-sequential-number';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';

import { ViewMeeting } from '../../management/models/view-meeting';
import { BaseViewModel } from '../../site/base/base-view-model';
import { Collection, Id } from '../definitions/key-types';
import { BaseRepository } from '../repositories/base-repository';
import { ActiveMeetingService } from './active-meeting.service';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { CollectionMapperService } from './collection-mapper.service';
import { ROUTING_FIELDSET, SimplifiedModelRequest } from './model-request-builder.service';

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

const MODEL_REQUEST_DESCRIPTION = `SequentialNumberMappingService:prepare`;

@Injectable({ providedIn: `root` })
export class SequentialNumberMappingService {
    private get activeMeetingId(): Id {
        return this.activeMeeting.meetingId;
    }

    private _mapSequentialNumberId: { [collection: string]: { [sequential_number: number]: BehaviorSubject<number> } } =
        {};

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

    public getIdObservableBySequentialNumber(
        collection: Collection,
        sequentialNumber: number
    ): Observable<Id | undefined> {
        if (!collection || !sequentialNumber) {
            return of();
        }
        return this.getBehaviorSubject(collection, sequentialNumber);
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
            return { idField, fieldset: ROUTING_FIELDSET };
        };
        return {
            ids: [this.activeMeetingId],
            viewModelCtor: ViewMeeting,
            fieldset: ``,
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
        viewModels: (BaseViewModel & Partial<HasSequentialNumber>)[]
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

    private insertViewModelId(viewModel: BaseViewModel & HasSequentialNumber): void {
        this.getBehaviorSubject(viewModel.collection, viewModel.sequential_number).next(viewModel.id);
    }

    private getBehaviorSubject(collection: Collection, sequentialNumber: number): BehaviorSubject<number> {
        if (!this._mapSequentialNumberId[collection][sequentialNumber]) {
            this._mapSequentialNumberId[collection][sequentialNumber] = new BehaviorSubject(null);
        }
        return this._mapSequentialNumberId[collection][sequentialNumber];
    }
}
