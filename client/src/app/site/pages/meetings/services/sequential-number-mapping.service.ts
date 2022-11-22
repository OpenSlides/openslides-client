import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Collection, Id } from 'src/app/domain/definitions/key-types';
import { HasMeetingId, HasSequentialNumber, isSequentialNumberHaving } from 'src/app/domain/interfaces';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { Mutex } from 'src/app/infrastructure/utils/promises';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService, SimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

import { ViewTopic } from '../pages/agenda';
import { ViewAssignment } from '../pages/assignments';
import { ViewMotion, ViewMotionBlock, ViewMotionCategory, ViewMotionWorkflow } from '../pages/motions';
import { ViewPoll } from '../pages/polls';
import { ViewProjector } from '../pages/projectors';
import { ViewMeeting } from '../view-models/view-meeting';
import { ActiveMeetingService } from './active-meeting.service';
import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';

const SEQUENTIAL_NUMBER_ID_FIELDS: {
    [collection: string]: (keyof ViewMeeting)[];
} = {
    [ViewAssignment.COLLECTION]: [`assignment_ids`],
    // [ViewListOfSpeakers.COLLECTION]: [`list_of_speakers_ids`],
    [ViewMotion.COLLECTION]: [`motion_ids`],
    [ViewMotionBlock.COLLECTION]: [`motion_block_ids`],
    [ViewMotionCategory.COLLECTION]: [`motion_category_ids`],
    [ViewMotionWorkflow.COLLECTION]: [`motion_workflow_ids`],
    [ViewPoll.COLLECTION]: [`poll_ids`],
    [ViewProjector.COLLECTION]: [`projector_ids`],
    // [ViewTopic.COLLECTION]: [`topic_ids`]
};

const SEQUENTIAL_NUMBER_REQUIRED_FIELDS = [`sequential_number`, `meeting_id`];

const MODEL_REQUEST_DESCRIPTION = `SequentialNumberMappingService:prepare`;

interface SequentialNumberMappingConfig {
    collection: Collection;
    sequentialNumber: number;
    meetingId: number;
}

@Injectable({ providedIn: `root` })
export class SequentialNumberMappingService {
    private _mutex = new Mutex();
    private get activeMeetingId(): Id {
        return this.activeMeeting.meetingId!;
    }

    private _mapSequentialNumberId: {
        [collection: string]: { [meeting_id_sequential_number: string]: number };
    } = {};

    private _subscriptions: Subscription[] = [];
    private _repositories: BaseMeetingRelatedRepository<any, any>[] = [];

    public constructor(
        collectionMapperService: MeetingCollectionMapperService,
        private activeMeeting: ActiveMeetingService,
        private autoupdateService: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService
    ) {
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
    }: SequentialNumberMappingConfig): Promise<Id | null> {
        if (!collection || !meetingId || !sequentialNumber) {
            return null;
        }

        console.log(`get id by sequential number: `, collection, meetingId, sequentialNumber);
        // await this._modelRequestSubscription.receivedData;

        console.log(this._mapSequentialNumberId);
        const meetingIdSequentialNumber = `${meetingId}/${sequentialNumber}`;
        return await this.getBehaviorSubject(collection, meetingIdSequentialNumber);
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
        this.setBehaviorSubject(viewModel.collection, meetingIdSequentialNumber, viewModel.id);
    }

    private getSequentialNumberRequest(collection: string): SimplifiedModelRequest {
        const createRoutingFollow = (idField: keyof ViewMeeting) => {
            return { idField, fieldset: [], additionalFields: SEQUENTIAL_NUMBER_REQUIRED_FIELDS };
        };

        return {
            ids: [this.activeMeetingId],
            viewModelCtor: ViewMeeting,
            fieldset: [],
            follow: SEQUENTIAL_NUMBER_ID_FIELDS[collection].map(idField => createRoutingFollow(idField))
        };
    }

    private async getBehaviorSubject(
        collection: Collection,
        meetingIdSequentialNumber: string
    ): Promise<number | null> {
        if (!this._mapSequentialNumberId[collection]) {
            this._mapSequentialNumberId[collection] = {};
        }

        const unlock = await this._mutex.lock();
        if (!this._mapSequentialNumberId[collection][meetingIdSequentialNumber]) {
            try {
                const data = await this.autoupdateService.single(
                    await this.modelRequestBuilder.build(this.getSequentialNumberRequest(collection)),
                    MODEL_REQUEST_DESCRIPTION + `:` + collection
                );
                
                const val = Object.values(data[collection]).find(el => el['meeting_id'] + '/' + el['sequential_number'] === meetingIdSequentialNumber);
                this._mapSequentialNumberId[collection][meetingIdSequentialNumber] = val['id'];
            } catch(e) {}
        }
        unlock();

        return this._mapSequentialNumberId[collection][meetingIdSequentialNumber] || null;
    }

    private setBehaviorSubject(collection: Collection, meetingIdSequentialNumber: string, value: number): void {
        if (!this._mapSequentialNumberId[collection]) {
            this._mapSequentialNumberId[collection] = {};
        }

        this._mapSequentialNumberId[collection][meetingIdSequentialNumber] = value;
    }
}
