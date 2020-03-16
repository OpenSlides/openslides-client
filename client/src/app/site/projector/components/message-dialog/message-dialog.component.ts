import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Determine what to send
 */
export interface MessageData {
    text: string;
}

/**
 * Dialog component to edit projector messages
 */
@Component({
    selector: 'os-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent extends BaseComponent implements OnInit {
    /**
     * The form data
     */
    public messageForm: FormGroup;

    /**
     * Constrcutor
     *
     * @param title required by parent
     * @param matSnackBar to show errors
     * @param translate to translate properties
     * @param formBuilder to create the message form
     * @param data the injected data, i.e the current text of a message to edit
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: MessageData
    ) {
        super(componentServiceCollector);
    }

    /**
     * Init create the form
     */
    public ngOnInit(): void {
        this.messageForm = this.formBuilder.group({
            text: [this.data.text, Validators.required]
        });
    }
}
