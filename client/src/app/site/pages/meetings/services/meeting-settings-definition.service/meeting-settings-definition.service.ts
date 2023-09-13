import { Injectable } from '@angular/core';
import { Settings } from 'src/app/domain/models/meetings/meeting';

import { meetingSettingsDefaults } from '../../../../../domain/definitions/meeting-settings-defaults';
import { meetingSettings, SettingsGroup, SettingsItem } from './meeting-settings-definitions';

export type SettingsMap = { [key in keyof Settings]: SettingsItem };

@Injectable({
    providedIn: `root`
})
export class MeetingSettingsDefinitionService {
    public get settings(): SettingsGroup[] {
        return meetingSettings;
    }

    public get settingsDefaults(): {
        [key: string]: any;
    } {
        return meetingSettingsDefaults;
    }

    public get settingsMap(): SettingsMap {
        return this._settingsMap;
    }

    private readonly _settingsMap: SettingsMap;

    public constructor() {
        this._settingsMap = this.createSettingsMap();
    }

    public getSettingsGroup(name: string): SettingsGroup | undefined {
        return this.settings.find(group => group.label.toLowerCase() === name.toLowerCase());
    }

    public getSettingsKeys(): (keyof Settings)[] {
        return Object.keys(this.settingsMap) as (keyof Settings)[];
    }

    public getDefaultValue(setting: keyof Settings | SettingsItem): any {
        const settingItem = typeof setting === `string` ? this.settingsMap[setting] : setting;
        return this.getDefaultValueForItem(settingItem) ?? this.getDefaultValueForType(settingItem);
    }

    public getDefaultValueForType(setting: SettingsItem): any {
        switch (setting.type) {
            case `integer`:
                return 0;
            case `boolean`:
                return false;
            case `translations`:
                return {};
            case `groups`:
            case `ranking`:
                return [];
            case `choice`:
            case `date`:
            case `datetime`:
                return null;
            case `daterange`:
                return [null, null];
            case `string`:
            case `text`:
            case `markupText`:
            default:
                // default type is text
                return ``;
        }
    }

    public validateDefault(settingKey: keyof Settings, defaultValue: any): void {
        const setting = this.settingsMap[settingKey];
        if (
            ((!setting.type || [`string`, `text`, `email`, `markupText`].includes(setting.type)) &&
                typeof defaultValue !== `string`) ||
            ([`integer`, `date`, `datetime`, `daterange`].includes(setting.type) && typeof defaultValue !== `number`) ||
            (setting.type === `boolean` && typeof defaultValue !== `boolean`)
        ) {
            throw new Error(`Invalid default for ${setting.key}: ${defaultValue} (${typeof defaultValue})`);
        }
        if (setting.type === `choice` && setting.choices && !setting.choices.hasOwnProperty(defaultValue)) {
            throw new Error(
                `Invalid default for ${setting.key}: ${defaultValue} (valid choices: ${Object.keys(setting.choices)})`
            );
        }
        if ([`ranking`, `groups`].includes(setting.type) && !Array.isArray(defaultValue)) {
            throw new Error(`Invalid default for ${setting.key}: ${defaultValue} is not an array`);
        }
        if (setting.type === `translations` && typeof defaultValue !== `object`) {
            throw new Error(`Invalid default for ${setting.key}: ${defaultValue} is not an object`);
        }
    }

    private getDefaultValueForItem(item: SettingsItem): any {
        const isArray = Array.isArray(item.key);
        const value = this.settingsDefaults[isArray ? item.key[0] : (item.key as keyof Settings)];
        if (item.type === `daterange`) {
            return [value ?? null, this.settingsDefaults[item.key[1]] ?? null];
        }
        return value;
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
        for (const group of this.settings) {
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
