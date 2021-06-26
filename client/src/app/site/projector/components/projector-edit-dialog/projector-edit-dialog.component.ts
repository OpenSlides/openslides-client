import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { auditTime } from 'rxjs/operators';

import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ProjectorComponent } from 'app/shared/components/projector/projector.component';
import { Projector } from 'app/shared/models/projector/projector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewProjector } from '../../models/view-projector';

/**
 * Dialog to edit the given projector
 * Shows a preview
 */
@Component({
    selector: 'os-projector-edit-dialog',
    templateUrl: './projector-edit-dialog.component.html',
    styleUrls: ['./projector-edit-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectorEditDialogComponent extends BaseComponent implements OnInit {
    /**
     * import the projector as view child, to determine when to update
     * the preview.
     */
    @ViewChild('preview')
    public preview: ProjectorComponent;

    /**
     * aspect ratios
     */
    public defaultAspectRatio: string[] = ['4:3', '16:9', '16:10'];

    /**
     * The update form. Will be refreahed for each projector. Just one update
     * form can be shown per time.
     */
    public updateForm: FormGroup;

    /**
     * show a preview of the changes
     */
    public previewProjector: Projector;

    /**
     * define the maximum resolution
     */
    public maxResolution = 2000;

    /**
     * define the minWidth
     */
    public minWidth = 800;

    /**
     * Define the step of resolution changes
     */
    public resolutionChangeStep = 10;

    /**
     * Determine to use custom aspect ratios
     */
    public customAspectRatio: boolean;

    /**
     * regular expression to check for aspect ratio strings
     */
    private aspectRatioRe = RegExp('[1-9]+[0-9]*:[1-9]+[0-9]*');

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public projector: ViewProjector,
        private dialogRef: MatDialogRef<ProjectorEditDialogComponent>,
        private repo: ProjectorRepositoryService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector);

        if (projector) {
            this.previewProjector = new Projector(projector.getModel());

            if (!this.defaultAspectRatio.some(ratio => ratio === this.previewProjector.aspectRatio)) {
                this.customAspectRatio = true;
            }
        }

        this.updateForm = formBuilder.group({
            name: ['', Validators.required],
            aspectRatio: ['', [Validators.required, Validators.pattern(this.aspectRatioRe)]],
            width: [0, Validators.required],
            color: ['', Validators.required],
            background_color: ['', Validators.required],
            header_background_color: ['', Validators.required],
            header_font_color: ['', Validators.required],
            header_h1_color: ['', Validators.required],
            chyron_background_color: ['', Validators.required],
            chyron_font_color: ['', Validators.required],
            show_header_footer: [],
            show_title: [],
            show_logo: [],
            show_clock: []
        });

        // react to form changes
        this.subscriptions.push(
            this.updateForm.valueChanges.pipe(auditTime(100)).subscribe(() => {
                this.onChangeForm();
            })
        );
    }

    /**
     * Watches all projection defaults
     */
    public ngOnInit(): void {
        if (this.projector) {
            this.updateForm.patchValue(this.projector.projector);
            this.updateForm.patchValue({
                name: this.translate.instant(this.projector.name),
                aspectRatio: this.projector.aspectRatio
            });
        }
    }

    /**
     * Apply changes and close the dialog
     */
    public async onSubmitProjector(): Promise<void> {
        await this.applyChanges();
        this.dialogRef.close(true);
    }

    /**
     * Saves the current changes on the projector
     */
    public async applyChanges(): Promise<void> {
        const payload = this.fitUpdatePayload(this.updateForm.value);
        await this.repo.update(payload, this.projector);
    }

    /**
     * React to form changes to update the preview
     * @param previewUpdate
     */
    public onChangeForm(): void {
        if (this.previewProjector && this.projector && this.updateForm.valid) {
            const copy = new Projector(this.previewProjector);
            this.previewProjector = Object.assign(copy, this.updateForm.value);
            this.cd.markForCheck();
        }
    }

    /**
     * Resets the given form field to the given default.
     */
    public resetField(field: string): void {
        const patchValue = {};
        patchValue[field] = this.projector[field];
        this.updateForm.patchValue(patchValue);
    }

    /**
     * Sets the aspect Ratio to custom
     * @param event
     */
    public onCustomAspectRatio(event: boolean): void {
        this.customAspectRatio = event;
    }

    /**
     * Sets and validates custom aspect ratio values
     */
    public setCustomAspectRatio(): void {
        const formRatio = this.updateForm.get('aspectRatio').value;
        const validatedRatio = formRatio.match(this.aspectRatioRe);
        if (validatedRatio && validatedRatio[0]) {
            const ratio = validatedRatio[0];
            this.updateForm.get('aspectRatio').setValue(ratio);
        }
    }

    private fitUpdatePayload(contentForm: any): Partial<Projector> {
        const payload: Partial<Projector> = { ...contentForm };
        const aspectRatio = payload.aspectRatio.split(':');
        payload.aspect_ratio_numerator = parseInt(aspectRatio[0], 10);
        payload.aspect_ratio_denominator = parseInt(aspectRatio[1], 10);
        return payload;
    }
}
