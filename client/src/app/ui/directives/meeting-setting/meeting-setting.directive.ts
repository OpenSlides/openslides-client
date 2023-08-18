import { Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

const SUBSCRIPTION_NAME = `settingsSubscription`;

@Directive({
    selector: `[osMeetingSetting]`
})
export class MeetingSettingDirective extends BaseUiComponent {
    @Input()
    public set osMeetingSetting(settingsKey: keyof Settings) {
        this.updateSubscription(
            SUBSCRIPTION_NAME,
            this.meetingSettingsService.get(settingsKey).subscribe(value => {
                this._settingsValue = value;
                this.checkForChanges();
            })
        );
    }

    @Input()
    public set osMeetingSettingAnd(andValue: boolean) {
        this._and = andValue;
        this.checkForChanges();
    }

    @Input()
    public set osMeetingSettingThen(template: TemplateRef<unknown>) {
        if (template) {
            this._thenTemplate = template;
            this.updateView(true);
        }
    }

    @Input()
    public set osMeetingSettingElse(template: TemplateRef<unknown>) {
        if (template) {
            this._elseTemplate = template;
            this.updateView(true);
        }
    }

    private _settingsValue: unknown = null;
    private _lastEnabledCheckResult: boolean | null = null;

    /**
     * Add a true-false-condition additional to osPerms
     * `*osPerms="permission.mediafileCanManage; and: !isMultiSelect"`
     */
    private _and = true;

    private _thenTemplate: TemplateRef<unknown>;
    private _thenViewRef: EmbeddedViewRef<unknown> | null = null;
    private _elseTemplate: TemplateRef<unknown> | null = null;
    private _elseViewRef: EmbeddedViewRef<unknown> | null = null;

    public constructor(
        template: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super();
        this._thenTemplate = template;
    }

    /**
     * This clears the parent container's content and adds optionally a template as next content.
     *
     * @param forceUpdate Whether the view should be updated in any case. This is necessary, if the templates changed
     * but a view was already initiated.
     */
    private updateView(forceUpdate = false): void {
        if (this.isEnabled() && (!this._thenViewRef || forceUpdate)) {
            // clean up and add the template,
            this.viewContainer.clear();
            this._elseViewRef = null;
            this.initThenView();
        } else if (!this.isEnabled() && (!this._elseViewRef || forceUpdate)) {
            // will remove the content of the container
            this.viewContainer.clear();
            this._thenViewRef = null;
            this.initElseView();
        }
    }

    private initThenView(): void {
        if (this._thenTemplate) {
            this._thenViewRef = this.viewContainer.createEmbeddedView(this._thenTemplate);
        }
    }

    private initElseView(): void {
        if (this._elseTemplate) {
            this._elseViewRef = this.viewContainer.createEmbeddedView(this._elseTemplate);
        }
    }

    private checkForChanges(): void {
        const isEnabled = this.isEnabled();
        const hasUpdates = isEnabled !== this._lastEnabledCheckResult;
        if (hasUpdates) {
            this._lastEnabledCheckResult = isEnabled;
            this.updateView();
        }
    }

    private isEnabled(): boolean {
        const isSettingEnabled = !!this._settingsValue;
        return isSettingEnabled && this._and;
    }
}
