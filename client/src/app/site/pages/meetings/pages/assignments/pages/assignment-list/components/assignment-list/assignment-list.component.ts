import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Permission } from '@app/domain/definitions/permission';
import { PROJECTIONDEFAULT } from '@app/domain/models/projector/projection-default';
import { ActionService } from '@app/gateways/actions';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { SpinnerService } from '@app/site/modules/global-spinner/services/spinner.service';
import { BaseMeetingListViewComponent } from '@app/site/pages/meetings/base/base-meeting-list-view.component';
import { AddItemToAgendaDialog } from '@app/site/pages/meetings/pages/agenda/pages/agenda-add-item/agenda-add-item.component';
import { AgendaItemControllerService } from '@app/site/pages/meetings/pages/agenda/services';
import { MultiProjectionBuildDescriptor } from '@app/site/pages/meetings/view-models';
import { OperatorService } from '@app/site/services/operator.service';
import { ViewPortService } from '@app/site/services/view-port.service';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { TranslateService } from '@ngx-translate/core';

import { getAssignmentDetailSubscriptionConfig } from '../../../../assignments.subscription';
import { AssignmentPhases } from '../../../../definitions/index';
import { AssignmentControllerService } from '../../../../services/assignment-controller.service';
import { AssignmentExportService } from '../../../../services/assignment-export.service';
import { ViewAssignment } from '../../../../view-models/view-assignment';
import { AssignmentFilterListService } from '../../services/assignment-filter-list.service';
import { AssignmentSortListService } from '../../services/assignment-sort-list.service';

const ASSIGNMENT_LIST_STORAGE_INDEX = `assignment_list`;
@Component({
    selector: `os-assignment-list`,
    templateUrl: `./assignment-list.component.html`,
    styleUrls: [`./assignment-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AssignmentListComponent extends BaseMeetingListViewComponent<ViewAssignment> implements OnInit {
    /**
     * The different phases of an assignment. Info is fetched from server
     */
    public phaseOptions = AssignmentPhases;

    /**
     * Define extra filter properties
     */
    public filterProps = [`title`, `candidates`, `assignment_related_users`, `tags`, `candidateAmount`];

    private messageForSpinner = this.translate.instant(`Assignments are in process. Please wait ...`);

    public get canManageAssignments(): boolean {
        return this.operator.hasPerms(Permission.assignmentCanManage);
    }

    public repo = inject(AssignmentControllerService);
    public filterService = inject(AssignmentFilterListService);
    public sortService = inject(AssignmentSortListService);
    public dialog = inject(MatDialog);
    public vp = inject(ViewPortService);
    protected override translate = inject(TranslateService);
    protected route = inject(ActivatedRoute);
    private promptService = inject(PromptService);
    private pdfService = inject(AssignmentExportService);
    private operator = inject(OperatorService);
    private itemRepo = inject(AgendaItemControllerService);
    private spinnerService = inject(SpinnerService);
    private actionService = inject(ActionService);

    /**
     * Init function.
     * Sets the title, inits the table
     */
    public ngOnInit(): void {
        super.setTitle(`Elections`);
        this.canMultiSelect = true;
        this.listStorageIndex = ASSIGNMENT_LIST_STORAGE_INDEX;
    }

    /**
     * Handles a click on the plus button delegated from head-bar.
     * Creates a new assignment
     */
    public onPlusButton(): void {
        this.router.navigate([`./new`], { relativeTo: this.route });
    }

    /**
     * @returns all the number of the columns that should be hidden in mobile
     */
    public getColumnsHiddenInMobile(): string[] {
        const hiddenInMobile = [`phase`, `candidates`];

        if (
            !this.operator.hasPerms(
                Permission.listOfSpeakersCanSee,
                Permission.listOfSpeakersCanBeSpeaker,
                Permission.projectorCanManage
            )
        ) {
            hiddenInMobile.push(`menu`);
        }

        return hiddenInMobile;
    }

    /**
     * Function to download the assignment list
     *
     * @param assignments Optional parameter: If given, the chosen list will be exported,
     * otherwise the whole list of assignments is exported.
     */
    public async downloadAssignmentButton(assignments?: ViewAssignment[]): Promise<void> {
        const usedAssignments = assignments ?? this.repo.getViewModelList();
        await this.modelRequestService.fetch(getAssignmentDetailSubscriptionConfig(...usedAssignments.map(a => a.id)));
        this.pdfService.exportMultipleAssignments(usedAssignments);
    }

    public getCandidateAmount(assignments: ViewAssignment): number {
        return assignments.candidateAmount;
    }

    /**
     * Handler for deleting multiple entries. Needs items in selectedRows, which
     * is only filled with any data in multiSelect mode
     */
    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete all selected elections?`);
        if (await this.promptService.open(title)) {
            await this.repo.delete(...this.selectedRows);
        }
    }

    public async addToAgenda(assignments: ViewAssignment[]): Promise<void> {
        if (!assignments.length) return;
        const originalOrder = this.listComponent.source.map(item => item.assignment.id) ?? [];
        const sortedAssignments = [...assignments].sort(
            (a, b) => originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id)
        );
        this.dialog
            .open(AddItemToAgendaDialog, {
                data: {
                    meetingId: this.activeMeetingId,
                    isMultiSelect: true,
                    excludedIds: sortedAssignments.map(a => a.agenda_item_id).filter((id): id is number => !!id)
                },
                ...infoDialogSettings
            })
            .afterClosed()
            .subscribe(async result => {
                if (!result) return;
                const promises: Promise<any>[] = [];
                const itemsToUpdate = sortedAssignments
                    .filter(a => a.agenda_item_id)
                    .map(a => this.itemRepo.getViewModelList().find(item => item.id === a.agenda_item_id))
                    .filter(item => !!item);
                if (sortedAssignments.some(a => !a.agenda_item_id)) {
                    const action = this.itemRepo.addToAgenda(
                        { type: result.agenda_type, parent_id: result.agenda_parent_id },
                        ...sortedAssignments.filter(a => !a.agenda_item_id)
                    );
                    action.setSendActionFn(req => this.actionService.sendRequests(req, true));
                    promises.push(action.resolve());
                }
                if (itemsToUpdate.length) {
                    const action = this.itemRepo.assignToParent({
                        ids: itemsToUpdate.map(item => item.id),
                        parent_id: result.agenda_parent_id
                    });
                    action.setSendActionFn(req => this.actionService.sendRequests(req, true));
                    promises.push(this.itemRepo.bulkSetAgendaType(itemsToUpdate, result.agenda_type));
                    promises.push(action.resolve());
                }
                if (promises.length) {
                    this.spinnerService.show(
                        `${assignments.length} ${this.translate.instant(this.messageForSpinner)}`,
                        { hideAfterPromiseResolved: () => Promise.all(promises) }
                    );
                }
            });
    }

    public addToProjectorQueue(): MultiProjectionBuildDescriptor {
        const toBeProjectedItems = this.isMultiSelect ? this.selectedRows : this.listComponent?.source;
        const originalOrder = this.listComponent?.source.map(i => `assignment/` + i.assignment.id);

        if (toBeProjectedItems) {
            const ids = toBeProjectedItems.map(item => `assignment/` + item.assignment.id);
            if (this.isMultiSelect) {
                ids.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
            }
            return {
                content_object_ids: ids,
                projectionDefault: PROJECTIONDEFAULT.assignment,
                getDialogTitle: (): string => this.translate.instant(`Elections`)
            };
        } else {
            return {
                content_object_ids: null,
                projectionDefault: PROJECTIONDEFAULT.assignment,
                getDialogTitle: (): string => this.translate.instant(`Elections`)
            };
        }
    }
}
