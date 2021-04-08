import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { environment } from 'environments/environment';

import { HttpService } from 'app/core/core-services/http.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Characterize a plugin. This data is retrieved from the server
 */
interface PluginDescription {
    /**
     * The name of the plugin
     */
    verbose_name: string;

    /**
     * the version
     */
    version: string;

    /**
     * The url to the main webpage of the plugin
     */
    url: string;

    /**
     * The license
     */
    license: string;
}

/**
 * Represents metadata about the current installation.
 */
interface VersionResponse {
    /**
     * The lience string. Like 'MIT', 'GPLv2', ...
     */
    openslides_license: string;

    /**
     * The URl to the main webpage of OpenSlides.
     */
    openslides_url: string;

    /**
     * The current version.
     */
    openslides_version: string;

    /**
     * A list of installed plugins.
     */
    plugins: PluginDescription[];
}

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
    public canBeEdited = false;

    /**
     * Sets the editing-state and updates the FormGroup with the current value.
     *
     * @param isEditing whether the component is currently in editing-mode.
     */
    @Input()
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
     * Holds the version info retrieved from the server for the ui.
     */
    public versionInfo: VersionResponse;

    /**
     * Imports the OrgaSettingsService, the translations and the HTTP Service
     * @param orgaSettings
     * @param translate
     * @param http
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private orgaSettings: OrganisationSettingsService,
        private http: HttpService,
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

        // Query the version info.
        this.http.get<VersionResponse>(environment.urlPrefix + '/core/version/', {}).then(
            info => {
                this.versionInfo = info;
            },
            () => {
                // TODO: error handling if the version info could not be loaded
            }
        );

        if (this.canBeEdited) {
            this.subscriptions.push(
                this.formGroup.get('legalNotice').valueChanges.subscribe(value => this.update.emit(value))
            );
        }
    }
}
