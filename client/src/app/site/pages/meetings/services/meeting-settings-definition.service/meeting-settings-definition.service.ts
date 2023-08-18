import { Injectable } from '@angular/core';
import { Settings } from 'src/app/domain/models/meetings/meeting';

import { meetingSettingsDefaults } from '../../../../../domain/definitions/meeting-settings-defaults';
import { meetingSettings, SettingsGroup, SettingsItem } from './meeting-settings-definitions';

type SettingsMap = { [key in keyof Settings]: SettingsItem };

@Injectable({
    providedIn: `root`
})
export class MeetingSettingsDefinitionService {
    private readonly _settingsMap: SettingsMap;

    public constructor() {
        this._settingsMap = this.createSettingsMap();
    }

    public validateDefault(settingKey: keyof Settings, defaultValue: any): void {
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

    public getSettingsGroup(name: string): SettingsGroup | undefined {
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
        return this.getDefaultValueForItem(settingItem) ?? this.getDefaultValueForType(settingItem);
    }

    private getDefaultValueForItem(item: SettingsItem): any {
        const isArray = Array.isArray(item.key);
        const value = meetingSettingsDefaults[isArray ? item.key[0] : (item.key as keyof Settings)];
        if (item.type === `daterange`) {
            return [value ?? null, meetingSettingsDefaults[item.key[1]] ?? null];
        }
        return value;
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
            case `ranking`:
                return [];
            case `datetime`:
                return null;
            case `daterange`:
                return [Date.now(), Date.now()];
            case `string`:
            case `text`:
            case `markupText`:
            default:
                // default type is text
                return ``;
        }
    }

    private get settingsMap(): SettingsMap {
        return this._settingsMap;
    }

    private validateSetting(setting: SettingsItem): void {
        if (setting.type === `choice`) {
            if (!setting.choices && !setting.choicesFunc) {
                throw new Error(`You must provide choices for ${setting.key}`);
            }
        }
    }

    private createSettingsMap(): SettingsMap {
        const localSettingsMap: any = {};
        for (const group of meetingSettings) {
            for (const subgroup of group.subgroups) {
                for (const setting of subgroup.settings) {
                    this.validateSetting(setting);
                    const keys = Array.isArray(setting.key) ? setting.key : [setting.key];
                    for (const key of keys) {
                        localSettingsMap[key] = setting;
                    }
                }
            }
        }
        return localSettingsMap;
    }
}
