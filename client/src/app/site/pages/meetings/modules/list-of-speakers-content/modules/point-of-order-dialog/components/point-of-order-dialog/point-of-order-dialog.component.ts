import { Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, Subscription } from 'rxjs';
import { ViewListOfSpeakers, ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda';

@Component({
    selector: `os-point-of-order-dialog`,
    templateUrl: `./point-of-order-dialog.component.html`,
    styleUrls: [`./point-of-order-dialog.component.scss`]
})
export class PointOfOrderDialogComponent implements OnDestroy {
    public editForm: UntypedFormGroup;

    public readonly MAX_LENGTH = 80;

    public title: string;
    private _titleSubscription: Subscription;

    public constructor(
        public readonly dialogRef: MatDialogRef<PointOfOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public readonly data: { listOfSpeakers: ViewListOfSpeakers; category?: ViewPointOfOrderCategory },
        private fb: UntypedFormBuilder,
        private translate: TranslateService
    ) {
        this.editForm = this.fb.group({
            note: [``, [Validators.required, Validators.maxLength(this.MAX_LENGTH)]]
        });
        this._titleSubscription = this.translate
            .get(_(`Are you sure you want to submit a %pointOfOrder%?`))
            .pipe(
                map((text: string) =>
                    text.replace(
                        `%pointOfOrder%`,
                        this.translate.instant(this.data.category?.text ?? _(`point of order`))
                    )
                )
            )
            .subscribe(title => (this.title = title));
    }

    public ngOnDestroy(): void {
        this._titleSubscription?.unsubscribe();
    }

    public onOk(): void {
        if (!this.editForm.valid) {
            return;
        }
        const note = this.editForm.value.note;
        this.dialogRef.close({ note });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
