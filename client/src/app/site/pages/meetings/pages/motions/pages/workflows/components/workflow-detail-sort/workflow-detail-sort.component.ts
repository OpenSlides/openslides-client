import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { SortingListComponent } from 'src/app/ui/modules/sorting/modules/sorting-list/components/sorting-list/sorting-list.component';

import { ViewMotionState, ViewMotionWorkflow } from '../../../../modules';
import { MotionStateControllerService } from '../../../../modules/states/services';
import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';

const WORKFLOW_DETAIL_SORT_SUBSCRIPTION_NAME = `workflow_detail_sort`;

@Component({
    selector: `os-workflow-detail-sort`,
    templateUrl: `./workflow-detail-sort.component.html`,
    styleUrls: [`./workflow-detail-sort.component.scss`]
})
export class WorkflowDetailSortComponent extends BaseModelRequestHandlerComponent {
    public readonly COLLECTION = ViewMotionWorkflow.COLLECTION;

    /**
     * The Sort Component
     */
    @ViewChild(`sorter`, { static: true })
    public sortingList!: SortingListComponent;

    public get workflowStatesObservable(): Observable<ViewMotionState[]> {
        return this._workflowStatesSubject.asObservable();
    }

    public get hasChanges(): boolean {
        return this._hasChanges;
    }

    private get previousStates(): MotionState[] {
        return this._previousStates;
    }

    private _workflowStatesSubject = new BehaviorSubject<ViewMotionState[]>([]);
    private _workflowStatesSubscription: Subscription | null = null;
    private _previousStates: MotionState[] = [];
    private _hasChanges = false;

    private set previousStates(newStates: MotionState[]) {
        this._previousStates = newStates;
        this.compareStates();
    }

    private _workflowId: Id | null = null;

    public constructor(
        private route: ActivatedRoute,
        private workflowRepo: MotionWorkflowControllerService,
        private stateRepo: MotionStateControllerService,
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService,
        protected translate: TranslateService,
        private promptService: PromptService
    ) {
        super(modelRequestService, router, openslidesRouter);
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._workflowId = id;
            this.initWorkflowSubscription();
            this.initStatesSubscription();
        }
    }

    public onSorting(nextStates: MotionState[]): void {
        this.previousStates = nextStates;
    }

    public async save(): Promise<void> {
        await this.stateRepo.sort(this._workflowId, this.previousStates);
        this.updatePreviousStates(this._previousStates);
    }

    public async onCancel(): Promise<void> {
        let resetList = true;
        if (this.hasChanges) {
            const title = this.translate.instant(_(`Do you really want to discard all your changes?`));
            const content = this.translate.instant(_(`Unsaved changes will not be applied.`));
            resetList = (await this.promptService.open(title, content)) as boolean;
        }
        if (resetList) {
            this.sortingList.restore();
            this.updatePreviousStates(this._workflowStatesSubject.value);
        }
    }

    private compareStates(): void {
        this._hasChanges = !!this.previousStates.filter(
            (state, index) => state.id !== this._workflowStatesSubject.value[index]?.id
        ).length;
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
        const previousStateIds = this.previousStates.map(state => state.id);
        const addedIds = states.map(state => state.id).difference(previousStateIds);
        const removedIds = previousStateIds.difference(states.map(_state => _state.id));
        const previousStatesSet = new Set(previousStateIds);
        for (const id of removedIds) {
            previousStatesSet.delete(id);
        }
        const nextStates = Array.from(previousStatesSet)
            .map(stateId => this.stateRepo.getViewModel(stateId))
            .concat(addedIds.map(id => this.stateRepo.getViewModel(id)))
            .sort((a, b) => a.weight - b.weight);
        this.previousStates = nextStates;
        this._workflowStatesSubject.next(nextStates.map(state => this.stateRepo.getViewModel(state.id)));
        this.compareStates();
    }
}
