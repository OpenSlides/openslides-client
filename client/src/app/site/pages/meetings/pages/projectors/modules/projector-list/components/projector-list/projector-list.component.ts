import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, timer } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Projector } from 'src/app/domain/models/projector/projector';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { OpenSlidesStatusService } from 'src/app/site/services/openslides-status.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-projector-list`,
    templateUrl: `./projector-list.component.html`,
    styleUrls: [`./projector-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ProjectorListComponent extends BaseMeetingComponent implements OnInit, OnDestroy, AfterViewInit {
    /**
     * The create form.
     */
    public createForm: UntypedFormGroup;

    /**
     * All aspect ratio keys/strings for the UI.
     */
    public aspectRatiosKeys: string[] = [];

    /**
     * All projectors.
     */
    public projectors!: Observable<ViewProjector[]>;

    /**
     * Helper to check manage permissions
     *
     * @returns true if the user can manage projectors
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.projectorCanManage);
    }

    protected override translate = inject(TranslateService);
    private repo = inject(ProjectorControllerService);
    private formBuilder = inject(UntypedFormBuilder);
    private operator = inject(OperatorService);
    private dialogService = inject(MatDialog);
    private cd = inject(ChangeDetectorRef);
    private openslidesStatus = inject(OpenSlidesStatusService);

    public constructor() {
        super();

        this.createForm = this.formBuilder.group({
            name: [``, Validators.required],
            is_internal: []
        });

        this.installUpdater();
    }

    /**
     * Watches all projectors.
     */
    public ngOnInit(): void {
        super.setTitle(`Projectors`);
        this.projectors = this.repo.getViewModelListObservable();
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
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cd.detach();
    }

    public createNewProjector(dialog: TemplateRef<string>): void {
        this.createForm.reset();
        const dialogRef = this.dialogService.open(dialog, { ...infoDialogSettings, disableClose: true });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const projectorToCreate: Partial<Projector> = this.createForm.value;

                this.repo.create(projectorToCreate as Projector).then(() => {
                    this.cd.detectChanges();
                }, this.raiseError);
            }
        });
    }

    private async installUpdater(): Promise<void> {
        await this.openslidesStatus.stable;
        /**
         * Angulars change detection goes nuts, since countdown and motios with long texts are pushing too much data
         */
        this.subscriptions.push(
            timer(0, 1000).subscribe(() => {
                this.cd.detectChanges();
            })
        );
    }
}
