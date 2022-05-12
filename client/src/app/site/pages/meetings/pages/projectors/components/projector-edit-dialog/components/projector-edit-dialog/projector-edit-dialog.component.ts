import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ViewChild,
    Inject,
    ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ProjectorComponent } from 'src/app/site/pages/meetings/modules/projector/components/projector/projector.component';
import { Projector } from 'src/app/domain/models/projector/projector';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { auditTime } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

const ASPECT_RATIO_FORM_KEY = `aspectRatio`;

/**
 * Dialog to edit the given projector
 * Shows a preview
 */
@Component({
    selector: `os-projector-edit-dialog`,
    templateUrl: `./projector-edit-dialog.component.html`,
    styleUrls: [`./projector-edit-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectorEditDialogComponent extends BaseUiComponent implements OnInit {
    /**
     * import the projector as view child, to determine when to update
     * the preview.
     */
    @ViewChild(`preview`)
    public preview: ProjectorComponent | null = null;

    /**
     * aspect ratios
     */
    public defaultAspectRatio: string[] = [`4:3`, `16:9`, `16:10`];

    /**
     * The update form. Will be refreahed for each projector. Just one update
     * form can be shown per time.
     */
    public updateForm: FormGroup;

    /**
     * show a preview of the changes
     */
    public previewProjector: ViewProjector | null = null;

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
    public customAspectRatio: boolean = false;

    private get _aspectRatioControl(): AbstractControl {
        return this.updateForm.get(ASPECT_RATIO_FORM_KEY)!;
    }

    /**
     * regular expression to check for aspect ratio strings
     */
    private readonly _aspectRatioRe = RegExp(`[1-9]+[0-9]*:[1-9]+[0-9]*`);

    public constructor(
        formBuilder: FormBuilder,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public projector: ViewProjector,
        private dialogRef: MatDialogRef<ProjectorEditDialogComponent>,
        private cd: ChangeDetectorRef
    ) {
        super();

        if (projector) {
            this.previewProjector = new ViewProjector(projector.getModel());

            if (!this.defaultAspectRatio.some(ratio => ratio === this.previewProjector!.aspectRatio)) {
                this.customAspectRatio = true;
            }
        }

        this.updateForm = formBuilder.group({
            name: [``, Validators.required],
            [ASPECT_RATIO_FORM_KEY]: [``, [Validators.required, Validators.pattern(this._aspectRatioRe)]],
            width: [0, Validators.required],
            color: [``, Validators.required],
            background_color: [``, Validators.required],
            header_background_color: [``, Validators.required],
            header_font_color: [``, Validators.required],
            header_h1_color: [``, Validators.required],
            chyron_background_color: [``, Validators.required],
            chyron_font_color: [``, Validators.required],
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
                name: _(this.projector.name),
                aspectRatio: this.projector.aspectRatio
            });
        }
    }

    /**
     * Apply changes and close the dialog
     */
    public async onSubmitProjector(): Promise<void> {
        this.dialogRef.close(this.fitUpdatePayload(this.updateForm.value));
    }

    /**
     * Saves the current changes on the projector
     */
    public applyChanges(): void {
        this.fitUpdatePayload(this.updateForm.value);
    }

    /**
     * React to form changes to update the preview
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
    public resetField(field: keyof Projector): void {
        const patchValue: any = {};
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
        const formRatio = this._aspectRatioControl.value;
        const validatedRatio = formRatio.match(this._aspectRatioRe);
        if (validatedRatio && validatedRatio[0]) {
            const ratio = validatedRatio[0];
            this._aspectRatioControl.setValue(ratio);
        }
    }

    private fitUpdatePayload(contentForm: any): Partial<Projector> {
        const payload: Partial<Projector> = { ...contentForm };
        const aspectRatio = payload.aspectRatio!.split(`:`);
        payload.aspect_ratio_numerator = parseInt(aspectRatio[0], 10);
        payload.aspect_ratio_denominator = parseInt(aspectRatio[1], 10);
        return payload;
    }
}
