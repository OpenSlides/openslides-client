import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewMotionWorkflow } from '../../../../modules';
import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';
import { WorkflowExportService } from '../../services';

const WORKFLOW_LIST_STORAGE_INDEX = `workflows`;

@Component({
    selector: `os-workflow-list`,
    templateUrl: `./workflow-list.component.html`,
    styleUrls: [`./workflow-list.component.scss`]
})
export class WorkflowListComponent extends BaseMeetingListViewComponent<ViewMotionWorkflow> implements OnInit {
    /**
     * Holds the new workflow title
     */
    public newWorkflowTitle = ``;

    /**
     * Define extra filter properties
     */
    public filterProps = [`name`, `states`];

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private dialog: MatDialog,
        public workflowRepo: MotionWorkflowControllerService,
        private promptService: PromptService,
        private exporter: WorkflowExportService
    ) {
        super(componentServiceCollector, translate);
        this.canMultiSelect = true;
        this.listStorageIndex = WORKFLOW_LIST_STORAGE_INDEX;
    }

    /**
     * Init. Observe the repository
     */
    public ngOnInit(): void {
        super.setTitle(`Workflows`);
    }

    /**
     * Main Event handler. Create new Workflow
     *
     * @param templateRef The reference to the dialog
     */
    public onNewButton(templateRef: TemplateRef<string>): void {
        this.newWorkflowTitle = ``;
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.workflowRepo.create({ name: result });
            }
        });
    }

    /**
     * Click delete button for workflow
     *
     * @param selected the selected workflow
     */
    public async onDeleteWorkflow(selected: ViewMotionWorkflow): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this workflow?`);
        const content = selected.getTitle();
        if (await this.promptService.open(title, content)) {
            this.workflowRepo.delete(selected);
        }
    }

    public async exportWorkflows(): Promise<void> {
        // await this.instant(getAllWorkflowStates(this.activeMeetingId!), `all_workflow_states`);
        this.exporter.exportWorkflows(...this.selectedRows.map(entry => this.workflowRepo.getViewModel(entry.id)!));
    }
}
