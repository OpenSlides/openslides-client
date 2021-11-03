import { Injectable } from '@angular/core';
import { Settings } from 'app/shared/models/event-management/meeting';

import { meetingSettingsDefaults } from '../repositories/management/meeting-settings-defaults';
import { meetingSettings, SettingsGroup, SettingsItem } from '../repositories/management/meeting-settings-definition';

type SettingsMap = { [key in keyof Settings]: SettingsItem };

@Injectable({
    providedIn: `root`
})
export class MeetingSettingsDefinitionProvider {
    private _settingsMap: SettingsMap;
    private get settingsMap(): SettingsMap {
        if (!this._settingsMap) {
            const sm = {};
            for (const group of meetingSettings) {
                for (const subgroup of group.subgroups) {
                    for (const setting of subgroup.settings) {
                        this.validateSetting(setting);
                        sm[setting.key] = setting;
                    }
                }
            }
            this._settingsMap = sm as SettingsMap;
        }
        return this._settingsMap;
    }

    private validateSetting(setting: SettingsItem): void {
        if (setting.type === `choice`) {
            if (!setting.choices && !setting.choicesFunc) {
                throw new Error(`You must provide choices for ${setting.key}`);
            }
        }
    }

    public validateDefault(settingKey: string, defaultValue: any): void {
        const setting = this.settingsMap[settingKey];
        if (
            ((!setting.type || setting.type === `text`) && typeof defaultValue !== `string`) ||
            (setting.type === `integer` && typeof defaultValue !== `number`) ||
            (setting.type === `boolean` && typeof defaultValue !== `boolean`)
        ) {
            throw new Error(`Invalid default for ${setting.key}: ${defaultValue} (${typeof defaultValue})`);
        }
        if (setting.type === `choice` && setting.choices && !setting.choices.hasOwnProperty(defaultValue)) {
            throw new Error(
                `Invalid default for ${setting.key}: ${defaultValue} (valid choices: ${Object.keys(setting.choices)})`
            );
        }
    }

    public getSettings(): SettingsGroup[] {
        return meetingSettings;
    }

    public getSettingsGroup(name: string): SettingsGroup {
        return meetingSettings.find(group => group.label.toLowerCase() === name);
    }

    public getSettingsKeys(): (keyof Settings)[] {
        return Object.keys(this.settingsMap) as (keyof Settings)[];
    }

    public getSettingsMap(): { [key in keyof Settings]: SettingsItem } {
        return this.settingsMap;
    }

    public getDefaultValue(setting: keyof Settings | SettingsItem): any {
        const settingItem = typeof setting === `string` ? this.settingsMap[setting] : setting;
        return meetingSettingsDefaults[settingItem.key] ?? this.getDefaultValueForType(settingItem);
    }

    public getDefaultValueForType(setting: SettingsItem): any {
        switch (setting.type) {
            case `integer`:
                return 0;
            case `boolean`:
                return false;
            case `choice`:
                return null;
            case `groups`:
            case `translations`:
                return [];
            case `datetime`:
                return null;
            case `string`:
            case `text`:
            case `markupText`:
            default:
                // default type is text
                return ``;
        }
    }
}
