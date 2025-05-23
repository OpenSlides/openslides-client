import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { PointOfOrderData } from '../../services/point-of-order-dialog.service';

@Component({
    selector: `os-point-of-order-dialog`,
    templateUrl: `./point-of-order-dialog.component.html`,
    styleUrls: [`./point-of-order-dialog.component.scss`],
    standalone: false
})
export class PointOfOrderDialogComponent {
    public editForm: UntypedFormGroup;

    public readonly MAX_LENGTH = 80;

    public title: string;

    public categoriesSubject = new BehaviorSubject<ViewPointOfOrderCategory[]>([]);

    public get showCategorySelect(): boolean {
        return this._showCategorySelect;
    }

    private _showCategorySelect = false;

    public constructor(
        public readonly dialogRef: MatDialogRef<PointOfOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public readonly data: PointOfOrderData,
        private fb: UntypedFormBuilder,
        private meetingSettings: MeetingSettingsService,
        private activeMeeting: ActiveMeetingService
    ) {
        this.activeMeeting.meeting.point_of_order_categories$
            .pipe(
                map(categories =>
                    categories.sort((a, b) => {
                        const comparison = a.text.localeCompare(b.text);
                        return comparison || a.rank - b.rank;
                    })
                )
            )
            .subscribe(this.categoriesSubject);

        this.editForm = this.fb.group({
            note: [data?.note ?? ``, [Validators.maxLength(this.MAX_LENGTH)]],
            category: []
        });

        combineLatest([
            this.meetingSettings.get(`list_of_speakers_enable_point_of_order_categories`),
            this.categoriesSubject
        ]).subscribe(([enabled, categories]) => {
            const show = categories.length && enabled;
            const categoryForm = this.editForm.get(`category`);
            if (show) {
                categoryForm.setValidators([Validators.required]);
                if (!categories.map(cat => cat.id).includes(categoryForm.value)) {
                    categoryForm.setValue(data?.point_of_order_category_id ?? categories[0].id);
                }
            } else {
                categoryForm.clearValidators();
            }
            this.editForm.updateValueAndValidity();
            this._showCategorySelect = show;
        });
    }

    public onOk(): void {
        if (!this.editForm.valid) {
            return;
        }
        const note = this.editForm.value.note;
        const point_of_order_category_id = this._showCategorySelect
            ? this.editForm.value.category || undefined
            : undefined;
        this.dialogRef.close({ note, point_of_order_category_id });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
