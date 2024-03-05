import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-legal-notice-content`,
    templateUrl: `./legal-notice-content.component.html`,
    styleUrls: [`./legal-notice-content.component.scss`]
})
export class LegalNoticeContentComponent extends BaseUiComponent implements OnInit {
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
        this.formGroup.patchValue({ legalNotice: this.legalNotice });
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
     * The legal notive text for the ui.
     */
    public legalNotice = ``;

    /**
     * Get an observable to the version info
     */
    public versionInfo: Observable<string> = this.httpClient.get(`/assets/version.txt`, { responseType: `text` });

    private _value = ``;

    public constructor(
        protected translate: TranslateService,
        private orgaSettings: OrganizationSettingsService,
        private httpClient: HttpClient,
        fb: UntypedFormBuilder
    ) {
        super();
        this.formGroup = fb.group({
            legalNotice: ``
        });
    }

    /**
     * Subscribes for the legal notice text.
     */
    public ngOnInit(): void {
        this.orgaSettings.get(`legal_notice`).subscribe(legalNotice => {
            this.legalNotice = legalNotice;
        });

        if (this.isEditable) {
            this.subscriptions.push(
                this.formGroup.get(`legalNotice`)!.valueChanges.subscribe(value => (this._value = value))
            );
        }
    }

    public leaveEditMode(doSendUpdate: boolean): void {
        const toSend = doSendUpdate ? this._value : null;
        this.update.emit(toSend);
        this.isEditing = false;
    }
}
