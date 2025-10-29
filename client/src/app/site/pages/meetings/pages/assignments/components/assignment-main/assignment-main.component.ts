import { Component, inject } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { SequentialNumberMappingService } from '../../../../services/sequential-number-mapping.service';
import {
    ASSIGNMENT_LIST_SUBSCRIPTION,
    getAssignmentDetailSubscriptionConfig,
    getAssignmentSubscriptionConfig
} from '../../assignments.subscription';

@Component({
    selector: `os-assignment-main`,
    templateUrl: `./assignment-main.component.html`,
    styleUrls: [`./assignment-main.component.scss`],
    standalone: false
})
export class AssignmentMainComponent extends BaseModelRequestHandlerComponent {
    private _currentAssignmentId: Id | null = null;
    private sequentialNumberMapping = inject(SequentialNumberMappingService);

    protected override onShouldCreateModelRequests(params: any, meetingId: any): void {
        if (meetingId) {
            if (+params[`id`]) {
                this.loadAssignmentDetail(+params[`id`], +params[`meetingId`]);
            } else {
                this.loadAssignmentList(+params[`meetingId`]);
            }
        }
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (
            params[`id`] !== oldParams[`id`] ||
            (+params[`meetingId`] && params[`meetingId`] !== oldParams[`meetingId`])
        ) {
            if (+params[`id`]) {
                this.loadAssignmentDetail(+params[`id`], +params[`meetingId`]);
            } else {
                this.loadAssignmentList(+params[`meetingId`]);
            }
        }
    }

    private loadAssignmentDetail(sNr: Id, meetingId: Id): void {
        this.sequentialNumberMapping
            .getIdBySequentialNumber({
                collection: Assignment.COLLECTION,
                meetingId,
                sequentialNumber: sNr
            })
            .then(id => {
                if (id && this._currentAssignmentId !== id) {
                    this._currentAssignmentId = id;
                    this.updateSubscribeTo(getAssignmentDetailSubscriptionConfig(this._currentAssignmentId), {
                        hideWhenDestroyed: true
                    });
                }
            });
    }

    private async loadAssignmentList(meetingId: number): Promise<void> {
        try {
            await this.modelRequestService.waitSubscriptionReady(ASSIGNMENT_LIST_SUBSCRIPTION, 500);
        } catch (e) {
            await this.updateSubscribeTo(getAssignmentSubscriptionConfig(meetingId));
        }
    }
}
