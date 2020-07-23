import { Injectable } from '@angular/core';

import { Meeting } from 'app/shared/models/event-management/meeting';
import { meetingSettings, SettingsGroup, SettingsItem } from '../repositories/event-management/meeting-settings';

@Injectable({
    providedIn: 'root'
})
export class MeetingSettingsService {
    private settingsMap: { [key: string]: SettingsItem } = {};

    public constructor() {
        for (const group of meetingSettings) {
            for (const subgroup of group.subgroups) {
                for (const setting of subgroup.settings) {
                    this.settingsMap[setting.key] = setting;
                }
            }
        }
    }

    public getSettings(): SettingsGroup[] {
        return meetingSettings;
    }

    public getSettingsGroup(name: string): SettingsGroup {
        return meetingSettings.find(group => group.label.toLowerCase() === name);
    }

    public getSettingsKeys(): (keyof Meeting)[] {
        return Object.keys(this.settingsMap) as (keyof Meeting)[];
    }

    public getDefaultValue(setting: string | SettingsItem): any {
        if (typeof setting === "string") {
            setting = this.settingsMap[setting];
        }
        return setting.default ?? this.getDefaultValueForType(setting);
    }

    public getDefaultValueForType(setting: SettingsItem): any {
        switch (setting.type) {
            case 'string':
            case 'text':
            case 'markupText':
                return '';
            case 'integer':
                return 0;
            case 'boolean':
                return false;
            case 'choice':
                return setting.choices[0];
            case 'groups':
            case 'translations':
                return [];
            case 'datetime':
            default:
                return null;
        }
    }
}
