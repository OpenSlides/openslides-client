import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { MergeAmendment, MotionState, Restriction } from 'src/app/domain/models/motions/motion-state';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotionState, ViewMotionWorkflow } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { MotionStateControllerService } from '../../../../modules/states/services';
import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';
import { WorkflowExportService } from '../../services/workflow-export.service/workflow-export.service';

/**
 * Declares data for the workflow dialog
 */
interface DialogData {
    title: string;
    description: string;
    value: string;
    deletable?: boolean;
    allowEmpty?: boolean;
}

/**
 * Determine answers from the dialog
 */
interface DialogResult {
    action: 'update' | 'delete';
    value: string | null;
}

/**
 * Defines state permissions
 */
interface StatePerm {
    name: string;
    selector: keyof MotionState;
    type: `input` | `check` | `restrictions` | `color` | `amendment` | `state`;
    reference?: string;
}

/**
 * Defines the structure of AmendmentIntoFinal
 */
interface AmendmentIntoFinal {
    merge: MergeAmendment;
    label: string;
}

/**
 * Defines the structure of restrictions
 */
interface RestrictionShape {
    key: Restriction;
    label: string;
}

/**
 * Motion workflow detail view to manage corresponding motion states.
 */
@Component({
    selector: `os-workflow-detail`,
    templateUrl: `./workflow-detail.component.html`,
    styleUrls: [`./workflow-detail.component.scss`]
})
export class WorkflowDetailComponent extends BaseMeetingComponent {
    public readonly COLLECTION = ViewMotionWorkflow.COLLECTION;

    /**
     * Holds the dialog data
     */
    public dialogData!: DialogData;

    /**
     * Holds the current workflow
     */
    public get workflow(): ViewMotionWorkflow {
        return this._workflow;
    }

    public get workflowStates(): ViewMotionState[] {
        return this._workflow.states.sort((a, b) => a.weight - b.weight);
    }

    /**
     * The header rows that the table should show
     * Updated through subscription
     */
    public headerRowDef: string[] = [];

    /**
     * Determine label colors. Where they should come from is currently now know
     */
    public labelColors: string[] = [`grey`, `red`, `green`, `lightblue`, `yellow`];

    /**
     * Determines possible restrictions
     */
    public restrictions = [
        { key: Restriction.motionsCanManage, label: `Can manage motions` },
        { key: Restriction.motionsCanSeeInternal, label: `Can see motions in internal state` },
        { key: Restriction.motionsCanManageMetadata, label: `Can manage motion metadata` },
        { key: Restriction.motionsIsSubmitter, label: `Submitters` }
    ] as RestrictionShape[];

    /**
     * Determines possible "Merge amendments into final"
     */
    public amendmentIntoFinal = [
        { merge: MergeAmendment.NO, label: `No` },
        { merge: MergeAmendment.UNDEFINED, label: `-` },
        { merge: MergeAmendment.YES, label: `Yes` }
    ] as AmendmentIntoFinal[];

    private set workflow(workflow: ViewMotionWorkflow) {
        this._workflow = workflow;
        this.updateRowDef();
        this.cd.markForCheck();
    }

    private _workflow!: ViewMotionWorkflow;
    private _workflowId!: Id;

    /**
     * Reference to the workflow dialog
     */
    @ViewChild(`workflowDialog`, { static: true })
    private readonly _workflowDialog!: TemplateRef<string>;

    /**
     * Holds state permissions
     */
    private readonly _statePermissionsList = [
        { name: `Recommendation label`, selector: `recommendation_label`, type: `input` },
        { name: `Allow support`, selector: `allow_support`, type: `check` },
        { name: `Allow create poll`, selector: `allow_create_poll`, type: `check` },
        { name: `Allow submitter edit`, selector: `allow_submitter_edit`, type: `check` },
        { name: `Allow forwarding of motions`, selector: `allow_motion_forwarding`, type: `check` },
        { name: `Set number`, selector: `set_number`, type: `check` },
        { name: `Set timestamp of creation`, selector: `set_created_timestamp`, type: `check` },
        { name: `Show state extension field`, selector: `show_state_extension_field`, type: `check` },
        {
            name: `Show recommendation extension field`,
            selector: `show_recommendation_extension_field`,
            type: `check`
        },
        { name: `Show amendment in parent motion`, selector: `merge_amendment_into_final`, type: `amendment` },
        { name: `Restrictions`, selector: `restrictions`, type: `restrictions` },
        { name: `Label color`, selector: `css_class`, type: `color` },
        { name: `Next states`, selector: `next_states_id`, type: `state` }
    ] as StatePerm[];

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private promptService: PromptService,
        private dialog: MatDialog,
        private workflowRepo: MotionWorkflowControllerService,
        private stateRepo: MotionStateControllerService,
        private exporter: WorkflowExportService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._workflowId = id;
            this.loadWorkflow();
        }
    }

    /**
     * Click handler for the state names.
     * Opens a dialog to rename a state.
     *
     * @param state the selected workflow state
     */
    public onClickStateName(state: ViewMotionState): void {
        this.openEditDialog(state.name, `Rename state`, ``, true).subscribe(result => {
            if (result) {
                if (result.action === `update`) {
                    this.updateWorkflowStateName(result.value!, state);
                } else if (result.action === `delete`) {
                    this.deleteWorkflowState(state);
                }
            }
        });
    }

    /**
     * Click handler for the button to add new states the the current workflow
     * Opens a dialog to enter the workflow name
     */
    public onNewStateButton(): void {
        this.openEditDialog(``, this.translate.instant(`New state`), this.translate.instant(`Name`)).subscribe(
            result => {
                if (result && result.action === `update`) {
                    const state = {
                        name: result.value,
                        workflow_id: this.workflow.id
                    };
                    this.handleRequest(this.stateRepo.create(state));
                }
            }
        );
    }

    /**
     * Click handler for the edit button.
     * Opens a dialog to rename the workflow
     */
    public onEditWorkflowButton(): void {
        this.openEditDialog(this.workflow.name, `Edit name`, `Please enter a new workflow name:`).subscribe(result => {
            if (result && result.action === `update`) {
                this.handleRequest(this.workflowRepo.update({ name: result.value! }, this.workflow).resolve());
            }
        });
    }

    /**
     * Handler for the workflow state "input" fields.
     * Opens a dialog to edit a label.
     *
     * @param perm The permission
     * @param state The selected workflow state
     */
    public onClickInputPerm(perm: StatePerm, state: ViewMotionState): void {
        this.openEditDialog((<any>state)[perm.selector], `Edit`, perm.name, false, true).subscribe(result => {
            if (!result) {
                return;
            }
            if (result.value === ``) {
                result.value = null;
            }
            if (result && result.action === `update`) {
                this.handleRequest(this.stateRepo.update({ [perm.selector]: result.value }, state));
            }
        });
    }

    /**
     * Handler for toggling workflow states
     *
     * @param state The workflow state to edit
     * @param perm The states permission that was changed
     * @param event The change event.
     */
    public onToggleStatePerm(state: ViewMotionState, perm: string, event: MatCheckboxChange): void {
        this.handleRequest(this.stateRepo.update({ [perm]: event.checked }, state));
    }

    /**
     * Handler for selecting colors / css classes for workflow states.
     * Sets the css class for the specific workflow
     *
     * @param state The selected workflow state
     * @param color The selected color
     */
    public onSelectColor(state: ViewMotionState, color: string): void {
        this.handleRequest(this.stateRepo.update({ css_class: color }, state));
    }

    /**
     * Handler to add or remove next states to a workflow state
     *
     * @param nextState the potential next workflow state
     * @param state the state to add or remove another state to
     */
    public onSetNextState(nextState: ViewMotionState, state: ViewMotionState): void {
        const ids = (state.next_state_ids || []).map(id => id);
        const stateIdIndex = ids.findIndex(id => id === nextState.id);

        if (stateIdIndex < 0) {
            ids.push(nextState.id);
        } else {
            ids.splice(stateIdIndex, 1);
        }
        this.handleRequest(this.stateRepo.update({ next_state_ids: ids }, state));
    }

    /**
     * Sets an access level to the given workflow state
     *
     * @param restriction The new restrictions
     * @param state the state to change
     */
    public onSetRestriction(restriction: Restriction, state: ViewMotionState): void {
        const restrictions = [...(state.restrictions ?? [])];
        const restrictionIndex = restrictions.findIndex(r => r === restriction);

        if (restrictionIndex < 0) {
            restrictions.push(restriction);
        } else {
            restrictions.splice(restrictionIndex, 1);
        }
        this.handleRequest(this.stateRepo.update({ restrictions }, state));
    }

    /**
     * @returns the restriction label for the given restriction
     */
    public getRestrictionLabel(restriction: string): string {
        const entry = this.restrictions.find(r => r.key === restriction);
        return entry?.label ?? ``;
    }

    /**
     * Sets the 'merge_amendment_into_final' value
     *
     * @param amendment determines the amendment
     * @param state the state to change
     */
    public setMergeAmendment(amendment: MergeAmendment, state: ViewMotionState): void {
        this.handleRequest(this.stateRepo.update({ merge_amendment_into_final: amendment }, state));
    }

    public exportCurrentWorkflow(): void {
        this.exporter.exportWorkflows(this.workflow);
    }

    /**
     * Function to open the edit dialog. Returns the observable to the result after the dialog
     * was closed
     *
     * @param value holds the valie
     * @param title The title of the dialog
     * @param description The description of the dialog
     * @param deletable determine if a delete button should be offered
     * @param allowEmpty to allow empty values
     */
    private openEditDialog(
        value: string,
        title?: string,
        description?: string,
        deletable?: boolean,
        allowEmpty?: boolean
    ): Observable<DialogResult> {
        this.dialogData = {
            title: title || ``,
            description: description || ``,
            value,
            deletable,
            allowEmpty
        };

        const dialogRef = this.dialog.open(this._workflowDialog, infoDialogSettings);

        return dialogRef.afterClosed();
    }

    /**
     * Returns a merge amendment label from state
     */
    public getMergeAmendmentLabel(mergeAmendment: MergeAmendment): string {
        return this.amendmentIntoFinal.find(amendment => amendment.merge === mergeAmendment)?.label || `-`;
    }

    /**
     * Defines the data source for the workflow state table
     *
     * @returns the MatTableDateSource to iterate over a workflow states contents
     */
    public getTableDataSource(): MatTableDataSource<StatePerm> {
        return new MatTableDataSource<StatePerm>(this._statePermissionsList);
    }

    /**
     * Sorts states by their weight and returns them.
     *
     * @returns The states of this workflow sorted by their weight.
     */
    public getWorkflowStates(): ViewMotionState[] {
        return this.workflow.states.sort((stateA, stateB) => stateA.weight - stateB.weight);
    }

    /**
     * Update the rowDefinition after Reloading or changes
     */
    public updateRowDef(): void {
        // reset the rowDef list first
        this.headerRowDef = [`perm`];
        if (this.workflow) {
            this.workflowStates.forEach(state => {
                this.headerRowDef.push(this.getColumnDef(state));
            });
        }
    }

    /**
     * Creates a unique column-def from the name and the id of a state
     *
     * @param state the workflow state
     * @returns a unique definition
     */
    public getColumnDef(state: ViewMotionState): string {
        return `${state.name}${state.id}`;
    }

    public getValueOfState(state: ViewMotionState, perm: StatePerm): any {
        return (<any>state)[perm.selector];
    }

    private deleteWorkflowState(state: ViewMotionState): void {
        const content = this.translate.instant(`Delete`) + ` ${state.name}?`;

        this.promptService.open(`Are you sure`, content).then(promptResult => {
            if (promptResult) {
                this.handleRequest(this.stateRepo.delete(state));
            }
        });
    }

    private updateWorkflowStateName(name: string, state: ViewMotionState): void {
        this.handleRequest(this.stateRepo.update({ name }, state));
    }

    private handleRequest(request: Promise<any>): void {
        request.catch(this.raiseError);
    }

    private loadWorkflow(): void {
        this.subscriptions.push(
            this.workflowRepo.getViewModelObservable(this._workflowId).subscribe(newWorkflow => {
                if (newWorkflow) {
                    this.workflow = newWorkflow;
                }
            }),
            this.stateRepo.getViewModelListObservable().subscribe(states => {
                if (states) {
                    this.updateRowDef();
                }
            })
        );
    }
}
