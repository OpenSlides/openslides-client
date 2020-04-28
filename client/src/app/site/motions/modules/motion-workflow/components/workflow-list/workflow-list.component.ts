import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PblColumnDefinition } from '@pebula/ngrid';

import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component.';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';

/**
 * List view for workflows
 */
@Component({
    selector: 'os-workflow-list',
    templateUrl: './workflow-list.component.html',
    styleUrls: ['./workflow-list.component.scss']
})
export class WorkflowListComponent extends BaseListViewComponent<ViewMotionWorkflow> implements OnInit {
    /**
     * Holds the new workflow title
     */
    public newWorkflowTitle: string;

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'name',
            width: 'auto'
        },
        {
            prop: 'delete'
        }
    ];

    /**
     * Define extra filter properties
     */
    public filterProps = ['name', 'states'];

    /**
     * Constructor
     *
     * @param titleService Sets the title
     * @param matSnackBar Showing errors
     * @param translate handle trandlations
     * @param dialog Dialog options
     * @param workflowRepo Repository for Workflows
     * @param promptService Before delete, ask
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private dialog: MatDialog,
        public workflowRepo: MotionWorkflowRepositoryService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Init. Observe the repository
     */
    public ngOnInit(): void {
        super.setTitle('Workflows');
    }

    /**
     * Main Event handler. Create new Workflow
     *
     * @param templateRef The reference to the dialog
     */
    public onNewButton(templateRef: TemplateRef<string>): void {
        this.newWorkflowTitle = '';
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.workflowRepo.create(new MotionWorkflow({ name: result })).then(() => {}, this.raiseError);
            }
        });
    }

    /**
     * Click delete button for workflow
     *
     * @param selected the selected workflow
     */
    public async onDeleteWorkflow(selected: ViewMotionWorkflow): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this workflow?');
        const content = selected.getTitle();
        if (await this.promptService.open(title, content)) {
            this.workflowRepo.delete(selected).then(() => {}, this.raiseError);
        }
    }
}
