import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { auditTime } from 'rxjs';
import {
    PROJECTIONDEFAULT,
    PROJECTIONDEFAULT_KEYS,
    PROJECTIONDEFAULT_VERBOSE
} from 'src/app/domain/models/projector/projection-default';
import { Projector } from 'src/app/domain/models/projector/projector';
import { ProjectorComponent } from 'src/app/site/pages/meetings/modules/projector/components/projector/projector.component';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

const ASPECT_RATIO_FORM_KEY = `aspectRatio`;

interface ProjectorEditDialogConfig {
    projector?: ViewProjector;
    applyChangesFn?: (projector: Partial<Projector>) => void | Promise<void>;
}

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
    public updateForm: UntypedFormGroup;

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
    public customAspectRatio = false;

    public get projector(): ViewProjector | null {
        return this.data.projector || null;
    }

    /**
     * Options for the `Projection defaults`-selector
     */
    public readonly projectiondefaultVerbose = PROJECTIONDEFAULT_VERBOSE;

    /**
     * Options for the `Projection defaults`-selector
     */
    public readonly projectiondefaultKeys = PROJECTIONDEFAULT;

    public readonly colorFields = {
        color: _(`Foreground color`),
        background_color: _(`Background color`),
        header_background_color: _(`Header background color`),
        header_font_color: _(`Header font color`),
        header_h1_color: _(`Headline color`),
        chyron_background_color: _(`Chyron background color`),
        chyron_font_color: _(`Chyron font color`)
    };

    private get _aspectRatioControl(): AbstractControl {
        return this.updateForm.get(ASPECT_RATIO_FORM_KEY)!;
    }

    /**
     * regular expression to check for aspect ratio strings
     */
    private readonly _aspectRatioRe = RegExp(`[1-9]+[0-9]*:[1-9]+[0-9]*`);

    private _defaultProjectors: { [key: string]: number[] } = {};

    public constructor(
        formBuilder: UntypedFormBuilder,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) private data: ProjectorEditDialogConfig,
        private dialogRef: MatDialogRef<ProjectorEditDialogComponent>,
        private cd: ChangeDetectorRef,
        private activeMeeting: ActiveMeetingService
    ) {
        super();

        if (data.projector) {
            this.previewProjector = new ViewProjector(data.projector.getModel());

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
            show_clock: [],
            is_internal: [],
            projectiondefault_ids: [[]]
        });

        this.subscriptions.push(
            // react to form changes
            this.updateForm.valueChanges.pipe(auditTime(100)).subscribe(() => {
                this.onChangeForm();
            }),
            // react to changes in the meeting (important for projector defaults)
            this.activeMeeting.meetingObservable.subscribe(meeting => {
                this.updateProjectorDefaults(meeting);
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
                name: this.projector.name,
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
        const nextProjector = this.fitUpdatePayload(this.updateForm.value);
        if (this.data.applyChangesFn) {
            this.data.applyChangesFn(nextProjector);
        }
    }

    /**
     * React to form changes to update the preview
     */
    public onChangeForm(): void {
        if (this.previewProjector && this.data.projector && this.updateForm.valid) {
            const copy = new Projector(this.data.projector.getModel());
            this.previewProjector = Object.assign(copy, this.updateForm.value, {
                scale: this.data.projector.scale,
                scroll: this.data.projector.scroll,
                sequential_number: this.data.projector.sequential_number
            });
            this.previewProjector.current_projections = this.data.projector.current_projections;
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

    /**
     * Processes all relevant data in a meeting (such as the projection defaults)
     * @param meeting the changed meeting
     */
    private updateProjectorDefaults(meeting: ViewMeeting): void {
        for (const key of PROJECTIONDEFAULT_KEYS) {
            const defaultProjectorIds = meeting.default_projector_ids(key);
            this.handleChangeInDefaultProjector(key, defaultProjectorIds);
        }
    }

    /**
     * Takes note of changes in a specific ViewModel's default-projector and toggles the corresponding checkbox in the `Projector defaults`-selector if neccessary
     * @param key the key of Projectiondefault, that describes the ViewModel
     * @param defaultProjectorIds the new value for the default projector
     */
    private handleChangeInDefaultProjector(key: string, defaultProjectorIds: number[]): void {
        if (this.getDefaultProjectorIds(key).equals(defaultProjectorIds)) {
            return;
        }
        const toggleCheckbox =
            this.isCurrentProjectorDefault(key) !== defaultProjectorIds.includes(this.projector.id) ? true : false;
        this._defaultProjectors[key] = defaultProjectorIds;
        if (toggleCheckbox && this.updateForm) {
            let formValue = this.updateForm.value[`projectiondefault_ids`] as string[];
            if (formValue.filter(selection => selection === key).length) {
                formValue = formValue.filter(value => !value.includes(key));
            } else {
                formValue.push(key);
            }
            this.updateForm.patchValue({
                projectiondefault_ids: formValue
            });
        }
    }

    private isCurrentProjectorDefault(projectordefaultKey: string): boolean {
        return this.getDefaultProjectorIds(projectordefaultKey).includes(this.projector.id);
    }

    private getDefaultProjectorIds(projectordefaultKey: string): number[] {
        return this._defaultProjectors[projectordefaultKey] || [];
    }

    private fitUpdatePayload(contentForm: any): Partial<Projector> {
        const payload: Partial<Projector> = { ...this.processPayload(contentForm) };
        return payload;
    }

    /**
     * Ensures that the update forms content is brought into the form that it should have in the payload
     */
    private processPayload(contentFormData: any): any {
        if (Object.keys(contentFormData).includes(`projectiondefault_ids`)) {
            const projectiondefaults = contentFormData[`projectiondefault_ids`];
            if (Array.isArray(contentFormData[`projectiondefault_ids`])) {
                contentFormData.projectiondefault_ids = this.getProjectionDefaultsPayload(projectiondefaults);
            } else {
                contentFormData.projectiondefault_ids = projectiondefaults;
            }
        }
        const aspectRatio = (contentFormData.aspectRatio! as string).split(`:`);
        contentFormData.aspect_ratio_numerator = parseInt(aspectRatio[0], 10);
        contentFormData.aspect_ratio_denominator = parseInt(aspectRatio[1], 10);
        return contentFormData;
    }

    private getProjectionDefaultsPayload(projectiondefaultKeys: string[]): { [key: string]: any } {
        const payload = {};
        // All defaults that are set to true should be set to the current projectors id
        for (let i = 0; i < projectiondefaultKeys.length; i++) {
            payload[projectiondefaultKeys[i]] = [
                ...new Set([this.projector.id, ...this.getDefaultProjectorIds(projectiondefaultKeys[i])])
            ];
        }
        // All defaults that were set to false should be set to standard, if they were previously set to current projector
        const notSelectedKeys = Object.keys(this.projectiondefaultVerbose).filter(
            key => !projectiondefaultKeys.includes(this.projectiondefaultKeys[key])
        );
        for (let i = 0; i < notSelectedKeys.length; i++) {
            const key = this.projectiondefaultKeys[notSelectedKeys[i]];
            if (this.isCurrentProjectorDefault(key)) {
                if (this.getDefaultProjectorIds(key).length === 1) {
                    payload[PROJECTIONDEFAULT[notSelectedKeys[i]]] = [
                        this.activeMeeting.meeting!.reference_projector_id
                    ];
                } else {
                    payload[PROJECTIONDEFAULT[notSelectedKeys[i]]] = this.getDefaultProjectorIds(key).filter(
                        id => id !== this.projector.id
                    );
                }
            }
        }
        return payload;
    }
}
