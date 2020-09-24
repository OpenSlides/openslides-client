import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ProjectorEditDialogComponent } from '../projector-edit-dialog/projector-edit-dialog.component';
import { ViewProjector } from '../../models/view-projector';

/**
 * List for all projectors.
 */
@Component({
    selector: 'os-projector-list-entry',
    templateUrl: './projector-list-entry.component.html',
    styleUrls: ['./projector-list-entry.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProjectorListEntryComponent extends BaseComponent implements OnInit {
    /**
     * The projector shown by this entry.
     */
    @Input()
    public set projector(value: ViewProjector) {
        this._projector = value;
    }

    public get projector(): ViewProjector {
        return this._projector;
    }

    public get projectionTarget(): '_blank' | '_self' {
        if (this.operator.hasPerms(Permission.coreCanManageProjector)) {
            return '_self';
        } else {
            return '_blank';
        }
    }

    private _projector: ViewProjector;

    /**
     * Constructor. Initializes the update form.
     *
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param repo
     * @param formBuilder
     * @param promptService
     * @param clockSlideService
     * @param operator OperatorService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private repo: ProjectorRepositoryService,
        private promptService: PromptService,
        private dialogService: MatDialog,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {}

    /**
     * Starts editing for the given projector.
     */
    public editProjector(): void {
        this.dialogService.open(ProjectorEditDialogComponent, {
            data: this.projector,
            ...largeDialogSettings
        });
    }

    /**
     * Handler to set the selected projector as CLOS reference
     */
    public onSetAsClosRef(): void {
        this.repo.setReferenceProjector(this.projector.id);
    }

    /**
     * Determines the detail link by permission.
     * Without manage permission, the user should see the full screen projector
     * and not the detail view
     */
    public getDetailLink(): string {
        if (this.operator.hasPerms(Permission.coreCanManageProjector)) {
            return `/projectors/detail/${this.projector.id}`;
        } else {
            return `/projector/${this.projector.id}`;
        }
    }

    /**
     * Delete the projector.
     */
    public async onDeleteButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this projector?');
        if (await this.promptService.open(title, this.projector.name)) {
            // this.repo.delete(this.projector).catch(this.raiseError);
        }
        throw new Error('TODO!');
    }
}
