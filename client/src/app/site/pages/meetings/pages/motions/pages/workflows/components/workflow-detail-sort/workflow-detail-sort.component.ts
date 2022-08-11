import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { MotionStateRepositoryService, MotionWorkflowRepositoryService } from 'src/app/gateways/repositories/motions';
import { DECIMAL_RADIX } from 'src/app/infrastructure/utils/transform-functions';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { ViewMotionState, ViewMotionWorkflow } from '../../../../modules';

const WORKFLOW_DETAIL_SORT_SUBSCRIPTION_NAME = `workflow_detail_sort`;

@Component({
    selector: `os-workflow-detail-sort`,
    templateUrl: `./workflow-detail-sort.component.html`,
    styleUrls: [`./workflow-detail-sort.component.scss`]
})
export class WorkflowDetailSortComponent extends BaseModelRequestHandlerComponent implements OnInit {
    public get workflowStatesObservable(): Observable<ViewMotionState[]> {
        return this._workflowStatesSubject.asObservable();
    }

    private _workflowStatesSubject = new BehaviorSubject<ViewMotionState[]>([]);
    private _workflowStatesSubscription: Subscription | null = null;
    private _previousStates: MotionState[] = [];

    private _workflowId: Id | null = null;

    public constructor(
        private route: ActivatedRoute,
        private workflowRepo: MotionWorkflowRepositoryService,
        private stateRepo: MotionStateRepositoryService,
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService
    ) {
        super(modelRequestService, router, openslidesRouter);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.route.params.subscribe(params => {
            if (params[`id`]) {
                this._workflowId = parseInt(params[`id`], DECIMAL_RADIX);
                this.initWorkflowSubscription();
                this.initStatesSubscription();
            }
        });
    }

    public onSorting(nextStates: MotionState[]): void {
        this._previousStates = nextStates;
    }

    private initWorkflowSubscription(): void {
        this.updateSubscribeTo({
            modelRequest: {
                ids: [this._workflowId],
                viewModelCtor: ViewMotionWorkflow,
                follow: [
                    {
                        idField: `state_ids`
                    }
                ],
                fieldset: ``
            },
            subscriptionName: WORKFLOW_DETAIL_SORT_SUBSCRIPTION_NAME,
            hideWhenDestroyed: true
        });
    }

    private initStatesSubscription(): void {
        if (this._workflowStatesSubscription) {
            this._workflowStatesSubscription.unsubscribe();
            this._workflowStatesSubscription = null;
        }
        this._workflowStatesSubscription = this.workflowRepo
            .getViewModelObservable(this._workflowId)
            .pipe(map(workflow => workflow?.states || []))
            .subscribe(states => this.updatePreviousStates(states));
    }

    private updatePreviousStates(states: MotionState[]): void {
        const previousStateIds = this._previousStates.map(state => state.id);
        const addedIds = states.map(state => state.id).difference(previousStateIds);
        const removedIds = previousStateIds.difference(states.map(_state => _state.id));
        const previousStatesSet = new Set(previousStateIds);
        for (const id of removedIds) {
            previousStatesSet.delete(id);
        }
        const nextStates = Array.from(previousStatesSet)
            .map(stateId => this.stateRepo.getViewModel(stateId))
            .concat(addedIds.map(id => this.stateRepo.getViewModel(id)));
        this._previousStates = nextStates;
        this._workflowStatesSubject.next(nextStates.map(state => this.stateRepo.getViewModel(state.id)));
    }
}
