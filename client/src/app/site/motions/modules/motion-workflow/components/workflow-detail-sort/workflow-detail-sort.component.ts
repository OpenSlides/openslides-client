import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentServiceCollector } from '../../../../../../core/ui-services/component-service-collector';
import { TranslateService } from '@ngx-translate/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { MotionState } from 'app/shared/models/motions/motion-state';
import { MotionWorkflowRepositoryService } from '../../../../../../core/repositories/motions/motion-workflow-repository.service';
import { map } from 'rxjs/operators';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { Id } from 'app/core/definitions/key-types';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { DECIMAL_RADIX } from 'app/core/core-services/key-transforms';
import { MotionStateRepositoryService } from '../../../../../../core/repositories/motions/motion-state-repository.service';

const WORKFLOW_DETAIL_SORT_SUBSCRIPTION_NAME = `workflow_detail_sort`;

@Component({
    selector: `os-workflow-detail-sort`,
    templateUrl: `./workflow-detail-sort.component.html`,
    styleUrls: [`./workflow-detail-sort.component.scss`]
})
export class WorkflowDetailSortComponent extends BaseModelContextComponent implements OnInit {
    public get workflowStatesObservable(): Observable<MotionState[]> {
        return this._workflowStatesSubject.asObservable();
    }

    private _workflowStatesSubject = new BehaviorSubject<MotionState[]>([]);
    private _workflowStatesSubscription: Subscription | null = null;
    private _previousStates: MotionState[] = [];

    private _workflowId: Id | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        private route: ActivatedRoute,
        private workflowRepo: MotionWorkflowRepositoryService,
        private stateRepo: MotionStateRepositoryService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params.id) {
                this._workflowId = parseInt(params.id, DECIMAL_RADIX);
                this.initWorkflowSubscription();
                this.initStatesSubscription();
            }
        });
    }

    public onSorting(nextStates: MotionState[]): void {
        this._previousStates = nextStates;
    }

    private initWorkflowSubscription(): void {
        this.requestModels(
            {
                ids: [this._workflowId],
                viewModelCtor: ViewMotionWorkflow,
                follow: [
                    {
                        idField: `state_ids`,
                        fieldset: `title`
                    }
                ],
                fieldset: ``
            },
            WORKFLOW_DETAIL_SORT_SUBSCRIPTION_NAME
        );
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
        this._workflowStatesSubject.next(nextStates);
    }
}
