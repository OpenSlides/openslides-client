import { Injectable } from '@angular/core';

import { Settings } from 'app/shared/models/event-management/meeting';
import {
    meetingSettings,
    SettingsGroup,
    SettingsItem
} from '../repositories/event-management/meeting-settings-definition';

@Injectable({
    providedIn: 'root'
})
export class MeetingSettingsDefinitionProvider {
    private settingsMap: { [key in keyof Settings]: SettingsItem } = (() => {
        const sm = {};
        for (const group of meetingSettings) {
            for (const subgroup of group.subgroups) {
                for (const setting of subgroup.settings) {
                    this.validateSetting(setting);
                    sm[setting.key] = setting;
                }
            }
        }
        return sm as { [key in keyof Settings]: SettingsItem };
    })();

    private validateSetting(setting: SettingsItem): void {
        if (setting.type === 'choice') {
            if (!setting.choices && !setting.choicesFunc) {
                throw new Error(`You must provide choices for ${setting.key}`);
            }
            if (setting.choices && setting.default && !Object.values(setting.choices).includes(setting.default)) {
                throw new Error(`Invalid default for ${setting.key}: ${setting.default}`);
            }
        }
        if (setting.default) {
            if (setting.type === 'integer' && typeof setting.default !== 'number') {
                throw new Error(`Invalid default for ${setting.key}: ${setting.default} (${typeof setting.default})`);
            }
            if (setting.type === 'boolean' && typeof setting.default !== 'boolean') {
                throw new Error(`Invalid default for ${setting.key}: ${setting.default} (${typeof setting.default})`);
            }
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

    public getDefaultValue(setting: keyof Settings | SettingsItem): any {
        const settingItem = typeof setting === 'string' ? this.settingsMap[setting] : setting;
        return settingItem.default ?? this.getDefaultValueForType(settingItem);
    }

    public getDefaultValueForType(setting: SettingsItem): any {
        switch (setting.type) {
            case 'integer':
                return 0;
            case 'boolean':
                return false;
            case 'choice':
                return Object.values(setting.choices)[0];
            case 'groups':
            case 'translations':
                return [];
            case 'datetime':
                return null;
            case 'string':
            case 'text':
            case 'markupText':
            default:
                // default type is text
                return '';
        }
    }
}
