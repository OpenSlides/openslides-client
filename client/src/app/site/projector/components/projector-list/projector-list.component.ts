import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, timer } from 'rxjs';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { Projector } from 'app/shared/models/projector/projector';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewProjector } from '../../models/view-projector';

/**
 * List for all projectors.
 */
@Component({
    selector: 'os-projector-list',
    templateUrl: './projector-list.component.html',
    styleUrls: ['./projector-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ProjectorListComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * The create form.
     */
    public createForm: FormGroup;

    /**
     * All aspect ratio keys/strings for the UI.
     */
    public aspectRatiosKeys: string[];

    /**
     * All projectors.
     */
    public projectors: BehaviorSubject<ViewProjector[]>;

    /**
     * Helper to check manage permissions
     *
     * @returns true if the user can manage projectors
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.coreCanManageProjector);
    }

    /**
     * Constructor. Initializes all forms.
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
        private formBuilder: FormBuilder,
        private operator: OperatorService,
        private dialogService: MatDialog,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector);

        this.createForm = this.formBuilder.group({
            name: ['', Validators.required]
        });

        /**
         * Angulars change detection goes nuts, since countdown and motios with long texts are pushing too much data
         */
        this.subscriptions.push(
            timer(0, 1000).subscribe(() => {
                this.cd.detectChanges();
            })
        );
    }

    /**
     * Watches all projectors.
     */
    public ngOnInit(): void {
        super.setTitle('Projectors');
        this.projectors = this.repo.getViewModelListBehaviorSubject();
    }

    /**
     * @param dialog
     */
    public createNewProjector(dialog: TemplateRef<string>): void {
        throw new Error('TODO!');
        // this.createForm.reset();
        // const dialogRef = this.dialogService.open(dialog, { ...infoDialogSettings, disableClose: true });
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         const projectorToCreate: Partial<Projector> = {
        //             name: this.createForm.value.name
        //         };

        //         this.repo.create(projectorToCreate as Projector).then(() => {
        //             this.cd.detectChanges();
        //         }, this.raiseError);
        //     }
        // });
    }

    /**
     * Initial change detection
     */
    public ngAfterViewInit(): void {
        this.cd.detectChanges();
    }

    /**
     * implicitly Destroy the timer sub and detach the CD
     */
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cd.detach();
    }
}
