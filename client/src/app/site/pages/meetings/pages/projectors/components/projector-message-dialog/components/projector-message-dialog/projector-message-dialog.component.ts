import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

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

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
    ) {
        super(componentServiceCollector, translate);
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
