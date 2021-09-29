import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Shared component to hold the content of the Privacy Policy.
 * Used in login and site container.
 */
@Component({
    selector: 'os-privacy-policy-content',
    templateUrl: './privacy-policy-content.component.html',
    styleUrls: ['./privacy-policy-content.component.scss']
})
export class PrivacyPolicyContentComponent extends BaseComponent implements OnInit {
    /**
     * Decides, whether the component can be edited at all.
     * Defaults to `false`.
     */
    @Input()
    public isEditable = false;

    /**
     * Sets the editing-state and updates the FormGroup with the current value.
     *
     * @param isEditing whether the component is currently in editing-mode.
     */
    public set isEditing(isEditing: boolean) {
        this.formGroup.patchValue({ privacyPolicy: this.privacyPolicy });
        this._isEditing = isEditing;
    }

    /**
     * Gets the editing-state.
     *
     * @returns `isEditing`.
     */
    public get isEditing(): boolean {
        return this._isEditing;
    }

    /**
     * Emitter to send updated value to the parent-component.
     */
    @Output()
    public update = new EventEmitter<string>();

    /**
     * FormGroup for editing value.
     */
    public formGroup: FormGroup;

    /**
     * State, whether this is in editing-mode.
     */
    private _isEditing = false;

    /**
     * The actual privacy policy as string
     */
    public privacyPolicy: string;

    private _value: string;

    /**
     * Constructor.
     *
     * @param title
     * @param translate
     * @param matSnackbar
     * @param orgaSettings
     * @param fb
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private orgaSettings: OrganizationSettingsService,
        fb: FormBuilder
    ) {
        super(componentServiceCollector);
        this.formGroup = fb.group({
            privacyPolicy: ''
        });
    }

    /**
     * Subscribes for the privacy policy text
     */
    public ngOnInit(): void {
        this.orgaSettings.get('privacy_policy').subscribe(privacyPolicy => {
            this.privacyPolicy = privacyPolicy;
        });
        if (this.isEditable) {
            this.subscriptions.push(
                this.formGroup.get('privacyPolicy').valueChanges.subscribe(value => (this._value = value))
            );
        }
    }

    public leaveEditMode(doSendUpdate: boolean): void {
        const toSend = doSendUpdate ? this._value : null;
        this.update.emit(toSend);
        this.isEditing = false;
    }
}
