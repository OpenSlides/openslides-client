import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-privacy-policy-content`,
    templateUrl: `./privacy-policy-content.component.html`,
    styleUrls: [`./privacy-policy-content.component.scss`]
})
export class PrivacyPolicyContentComponent extends BaseUiComponent implements OnInit {
    public readonly OML = OML;

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
    public update = new EventEmitter<string | null>();

    /**
     * FormGroup for editing value.
     */
    public formGroup: UntypedFormGroup;

    /**
     * State, whether this is in editing-mode.
     */
    private _isEditing = false;

    /**
     * The actual privacy policy as string
     */
    public privacyPolicy!: string;

    private _value!: string;

    protected translate = inject(TranslateService);
    private orgaSettings = inject(OrganizationSettingsService);

    public constructor(fb: UntypedFormBuilder) {
        super();
        this.formGroup = fb.group({
            privacyPolicy: ``
        });
    }

    /**
     * Subscribes for the privacy policy text
     */
    public ngOnInit(): void {
        this.orgaSettings.get(`privacy_policy`).subscribe(privacyPolicy => {
            this.privacyPolicy = privacyPolicy;
        });
        if (this.isEditable) {
            this.subscriptions.push(
                this.formGroup.get(`privacyPolicy`)!.valueChanges.subscribe(value => (this._value = value))
            );
        }
    }

    public leaveEditMode(doSendUpdate: boolean): void {
        const toSend = doSendUpdate ? this._value : null;
        this.update.emit(toSend);
        this.isEditing = false;
    }
}
