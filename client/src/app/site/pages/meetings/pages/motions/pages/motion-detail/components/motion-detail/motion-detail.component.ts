import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { Motion } from 'src/app/domain/models/motions/motion';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';

const MOTION_DETAIL_SEQUENTIAL_NUMBER_MAPPING = `motion_detail_sequential_number_mapping`;
const MOTION_DETAIL_SUBSCRIPTION = `motion_detail`;
const MOTION_DETAIL_ADDITIONAL_SUBSCRIPTION = `motion_detail_additional`;

@Component({
    selector: `os-motion-detail`,
    templateUrl: `./motion-detail.component.html`,
    styleUrls: [`./motion-detail.component.scss`]
})
export class MotionDetailComponent extends BaseModelRequestHandlerComponent {
    private _currentMotionId: Id | null = null;
    private _watchingMap: { [field in keyof Motion]?: Ids } = {};

    public constructor(
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService,
        private sequentialNumberMapping: SequentialNumberMappingService,
        private repo: MotionControllerService
    ) {
        super(modelRequestService, router, openslidesRouter);
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`] || params[`meetingId`] !== oldParams[`meetingId`]) {
            this.sequentialNumberMapping
                .getIdBySequentialNumber({
                    collection: Motion.COLLECTION,
                    meetingId: params[`meetingId`],
                    sequentialNumber: +params[`id`]
                })
                .then(id => {
                    if (id && this._currentMotionId !== id) {
                        this._currentMotionId = id;
                        this._watchingMap = {};
                        this.loadMotionDetail();
                    }
                });
        }
    }

    private loadMotionDetail(): void {
        this.updateSubscribeTo({
            modelRequest: {
                ids: [this._currentMotionId!],
                viewModelCtor: ViewMotion,
                additionalFields: [
                    `all_origin_ids`,
                    `origin_meeting_id`,
                    `derived_motion_ids`,
                    `amendment_ids`,
                    { templateField: `amendment_paragraph_$` }
                ]
            },
            subscriptionName: MOTION_DETAIL_SUBSCRIPTION,
            hideWhenDestroyed: true
        });
        this.updateSubscription(
            MOTION_DETAIL_SUBSCRIPTION,
            this.repo.getViewModelObservable(this._currentMotionId!).subscribe(motion => {
                if (motion) {
                    this.watchForChanges(motion, `all_origin_ids`, `derived_motion_ids`);
                }
            })
        );
    }

    private watchForChanges(motion: ViewMotion, ...fields: (keyof Motion)[]): void {
        const ids: Ids = [];
        for (const field of fields) {
            const idsToWatch = (motion[field] || []) as Ids;
            if (!this._watchingMap[field]) {
                (<any>this._watchingMap)[field] = [];
            }
            const difference = idsToWatch.difference((<any>this._watchingMap)[field]);
            if (difference.length > 0) {
                const nextIds = Array.from(new Set(this._watchingMap[field]?.concat(idsToWatch)));
                ids.push(...nextIds);
                (<any>this._watchingMap)[field] = nextIds;
            }
        }
        if (ids.length) {
            this.makeAdditionalSubscription(ids);
        }
    }

    private makeAdditionalSubscription(ids: Ids): void {
        this.updateSubscribeTo({
            modelRequest: {
                ids,
                viewModelCtor: ViewMotion,
                fieldset: [`forwarded`, `created`, `sequential_number`],
                follow: [{ idField: `meeting_id`, fieldset: [], additionalFields: [`name`, `description`] }]
            },
            subscriptionName: MOTION_DETAIL_ADDITIONAL_SUBSCRIPTION,
            hideWhenDestroyed: true
        });
    }
}
