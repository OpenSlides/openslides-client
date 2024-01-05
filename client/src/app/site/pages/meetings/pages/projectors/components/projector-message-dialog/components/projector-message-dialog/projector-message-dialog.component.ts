import { Component, Inject, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';

import { MessageDialogData } from '../../definitions';

@Component({
    selector: `os-projector-message-dialog`,
    templateUrl: `./projector-message-dialog.component.html`,
    styleUrls: [`./projector-message-dialog.component.scss`]
})
export class ProjectorMessageDialogComponent extends BaseComponent implements OnInit {
    /**
     * The form data
     */
    public messageForm!: UntypedFormGroup;

    protected override translate = inject(TranslateService);
    private formBuilder = inject(UntypedFormBuilder);

    public constructor(@Inject(MAT_DIALOG_DATA) public data: MessageDialogData) {
        super();
    }

    /**
     * Init create the form
     */
    public ngOnInit(): void {
        this.messageForm = this.formBuilder.group({
            message: [this.data.message, Validators.required]
        });
    }
}
