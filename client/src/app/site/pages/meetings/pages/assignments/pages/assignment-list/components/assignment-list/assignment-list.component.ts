import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AssignmentPhases } from '../../../../definitions/index';
import { AssignmentControllerService } from '../../../../services/assignment-controller.service';
import { AssignmentExportService } from '../../../../services/assignment-export.service';
import { ViewAssignment } from '../../../../view-models';
import { AssignmentFilterListService } from '../../services/assignment-filter-list.service';
import { AssignmentSortListService } from '../../services/assignment-sort-list.service';

const ASSIGNMENT_LIST_STORAGE_INDEX = `assignment_list`;
@Component({
    selector: `os-assignment-list`,
    templateUrl: `./assignment-list.component.html`,
    styleUrls: [`./assignment-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
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

    public get canManageAssignments(): boolean {
        return this.operator.hasPerms(Permission.assignmentCanManage);
    }

    public constructor(
        protected override translate: TranslateService,
        public repo: AssignmentControllerService,
        private promptService: PromptService,
        public filterService: AssignmentFilterListService,
        public sortService: AssignmentSortListService,
        private pdfService: AssignmentExportService,
        protected route: ActivatedRoute,
        private operator: OperatorService,
        public vp: ViewPortService
    ) {
        super();
        this.canMultiSelect = true;
        this.listStorageIndex = ASSIGNMENT_LIST_STORAGE_INDEX;
    }

    /**
     * Init function.
     * Sets the title, inits the table
     */
    public ngOnInit(): void {
        super.setTitle(`Elections`);
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
        this.pdfService.exportMultipleAssignments(assignments ?? this.repo.getViewModelList());
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
}
