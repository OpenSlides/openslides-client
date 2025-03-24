import { Component } from '@angular/core';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { Motion } from 'src/app/domain/models/motions/motion';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import {
    getMotionAdditionalDetailSubscriptionConfig,
    getMotionDetailSubscriptionConfig,
    MOTION_DETAIL_SUBSCRIPTION
} from '../../../../motions.subscription';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';

@Component({
    selector: `os-motion-detail`,
    templateUrl: `./motion-detail.component.html`,
    styleUrls: [`./motion-detail.component.scss`],
    standalone: false
})
export class MotionDetailComponent extends BaseModelRequestHandlerComponent {
    private _currentMotionId: Id | null = null;
    private _watchingMap: { [field in keyof Motion]?: Ids } = {};

    public constructor(
        private sequentialNumberMapping: SequentialNumberMappingService,
        private repo: MotionControllerService
    ) {
        super();
    }

    protected override onShouldCreateModelRequests(params: any, meetingId: Id): void {
        const id = params[`id`] || params[`parent`];
        if (id && meetingId) {
            this.loadMotionDetail(meetingId, +id);
        }
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        const oldId = oldParams[`id`] || oldParams[`parent`];
        const newId = params[`id`] || params[`parent`];
        if (newId !== oldId || params[`meetingId`] !== oldParams[`meetingId`]) {
            this.loadMotionDetail(+params[`meetingId`], +newId);
        }
    }

    private loadMotionDetail(meetingId: Id, motionId: Id): void {
        this.sequentialNumberMapping
            .getIdBySequentialNumber({
                collection: Motion.COLLECTION,
                meetingId,
                sequentialNumber: motionId
            })
            .then(id => {
                if (id && this._currentMotionId !== id) {
                    this._currentMotionId = id;
                    this._watchingMap = {};
                    this.updateSubscribeTo(getMotionDetailSubscriptionConfig(this._currentMotionId));
                    this.updateSubscription(
                        MOTION_DETAIL_SUBSCRIPTION,
                        this.repo.getViewModelObservable(this._currentMotionId!).subscribe(motion => {
                            if (motion) {
                                this.watchForChanges(motion, `all_origin_ids`, `derived_motion_ids`);
                            }
                        })
                    );
                }
            });
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
        this.updateSubscribeTo(getMotionAdditionalDetailSubscriptionConfig(...ids), { hideWhenDestroyed: true });
    }
}
