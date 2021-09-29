import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Observable } from 'rxjs';

/**
 * Shared component to hold the content of the Legal notice.
 * Used in login and site container.
 */
@Component({
    selector: 'os-legal-notice-content',
    templateUrl: './legal-notice-content.component.html',
    styleUrls: ['./legal-notice-content.component.scss']
})
export class LegalNoticeContentComponent extends BaseComponent implements OnInit {
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
     * The legal notive text for the ui.
     */
    public legalNotice: string;

    /**
     * Get an observable to the version info
     */
    public versionInfo: Observable<string> = this.httpClient.get('/assets/version.txt', { responseType: 'text' });

    private _value: string;

    /**
     * Imports the OrgaSettingsService, the translations and the HTTP Service
     * @param orgaSettings
     * @param translate
     * @param http
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private orgaSettings: OrganizationSettingsService,
        private httpClient: HttpClient,
        fb: FormBuilder
    ) {
        super(componentServiceCollector);
        this.formGroup = fb.group({
            legalNotice: ''
        });
    }

    /**
     * Subscribes for the legal notice text.
     */
    public ngOnInit(): void {
        this.orgaSettings.get('legal_notice').subscribe(legalNotice => {
            this.legalNotice = legalNotice;
        });

        if (this.isEditable) {
            this.subscriptions.push(
                this.formGroup.get('legalNotice').valueChanges.subscribe(value => (this._value = value))
            );
        }
    }

    public leaveEditMode(doSendUpdate: boolean): void {
        const toSend = doSendUpdate ? this._value : null;
        this.update.emit(toSend);
        this.isEditing = false;
    }
}
