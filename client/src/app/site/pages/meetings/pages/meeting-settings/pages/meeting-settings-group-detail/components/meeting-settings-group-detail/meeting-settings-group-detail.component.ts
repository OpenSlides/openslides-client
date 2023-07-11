import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { CanComponentDeactivate } from 'src/app/site/guards/watch-for-changes.guard';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { MeetingSettingsDefinitionService } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';
import {
    SettingsGroup,
    SettingsItem
} from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definitions';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import {
    MeetingSettingsGroupDetailFieldComponent,
    SettingsFieldUpdate
} from '../meeting-settings-group-detail-field/meeting-settings-group-detail-field.component';

@Component({
    selector: `os-meeting-settings-group-detail`,
    templateUrl: `./meeting-settings-group-detail.component.html`,
    styleUrls: [`./meeting-settings-group-detail.component.scss`]
})
export class MeetingSettingsGroupDetailComponent
    extends BaseMeetingComponent
    implements OnInit, CanComponentDeactivate, OnDestroy
{
    public settingsGroup!: SettingsGroup;

    public meeting!: ViewMeeting;

    /**
     * Map of all changed settings.
     */
    private changedSettings: { [key: string]: any } = {};

    /** Provides access to all created settings fields. */
    @ViewChildren(`settingsFields`) public settingsFields!: QueryList<MeetingSettingsGroupDetailFieldComponent>;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private promptDialog: PromptService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionService,
        private repo: MeetingControllerService
    ) {
        super(componentServiceCollector, translate);
    }

    /**
     * Sets the title, inits the table and calls the repo
     */
    public ngOnInit(): void {
        const settings = this.translate.instant(`Settings`);

        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params[`group`]) {
                    this.settingsGroup = this.meetingSettingsDefinitionProvider.getSettingsGroup(params[`group`])!;
                    const groupName = this.translate.instant(this.settingsGroup.label);
                    super.setTitle(`${settings} - ${groupName}`);
                    this.cd.markForCheck();
                }
            }),
            this.activeMeetingService.meetingObservable.subscribe(meeting => {
                this.meeting = meeting as ViewMeeting;
            })
        );
    }

    /**
     * Updates the specified settings item indicated by the given key.
     */
    public updateSetting(update: SettingsFieldUpdate): void {
        const { keys, values } = Array.isArray(update.key)
            ? { keys: update.key, values: update.value }
            : { keys: [update.key], values: [update.value] };
        for (let i = 0; i < keys.length; i++) {
            this.changedSettings[keys[i]] = values[i];
        }
        this.calculateAutomaticFieldChanges(update);
        this.cd.markForCheck();
    }

    /**
     * Saves every field in this config-group.
     */
    public async saveAll(): Promise<void> {
        this.cd.detach();
        try {
            await this.repo.update(this.changedSettings, { meeting: this.meeting });
            this.changedSettings = {};
            this.cd.reattach();
            this.cd.markForCheck();
        } catch (e: any) {
            this.matSnackBar.open(e, this.translate.instant(`Ok`), {
                duration: 0
            });
        }
    }

    /**
     * This resets all values to their defaults.
     */
    public async resetAll(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to reset all options to factory defaults? All changes of this settings group will be lost!`
        );
        if (await this.promptDialog.open(title)) {
            for (const settingsField of this.settingsFields) {
                settingsField.onResetButton();
            }
            await this.saveAll();
        }
    }

    /**
     * Returns whether the user made any changes so far by checking the
     * `changedSettings` object.
     */
    public hasChanges(): boolean {
        return Object.keys(this.changedSettings).length > 0;
    }

    public hasErrors(): boolean {
        return this.settingsFields?.some(field => !field.valid);
    }

    /**
     * Lifecycle-hook to hook into, before the route changes.
     *
     * @returns The answer of the user, if he made changes, `true` otherwise.
     */
    public async canDeactivate(): Promise<boolean> {
        if (this.hasChanges()) {
            return await this.promptDialog.discardChangesConfirmation();
        }
        return true;
    }

    public getDetailFieldValue(meeting: ViewMeeting, setting: SettingsItem): any {
        const isArray = Array.isArray(setting.key);
        if (setting.type === `daterange`) {
            if (!isArray || setting.key.length < 2 || setting.key[0] === setting.key[1]) {
                throw new Error(
                    `Daterange settings must always cover two different setting keys (${setting.key.toString()})`
                );
            } else {
                return [meeting[setting.key[0]], meeting[setting.key[1]]];
            }
        }
        if (isArray) {
            if (!setting.key.length) {
                throw new Error(`Missing setting key`);
            }
            if (setting.key.length > 1) {
                console.warn(`Additional setting keys for ${setting.key[0]} will be skipped.`);
            }
            return meeting[setting.key[0]];
        }
        return meeting[setting.key as keyof Settings];
    }

    /**
     * Updates the specified settings item indicated by the given key.
     */
    private calculateAutomaticFieldChanges(update: SettingsFieldUpdate): void {
        const detailFields = this.settingsFields?.filter(field =>
            (Array.isArray(update.key) ? update.key : [update.key]).some(key => field.watchProperties?.includes(key))
        );
        detailFields.forEach(detailField => {
            const currentValue = detailField.currentValue;
            const changedValues = detailField.watchProperties.map(key => this.changedSettings[key]);
            const newValue = detailField.getChangeFn(currentValue, changedValues);
            if (newValue !== currentValue) {
                detailField.updateValue(newValue);
            }
        });
    }
}
