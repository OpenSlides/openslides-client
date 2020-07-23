import { Injectable, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Meeting } from 'app/shared/models/event-management/meeting';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { CollectionMapperService } from '../core-services/collection-mapper.service';
import {
    ChoicesFunctionDefinition,
    ChoicesMap,
    meetingSettings,
    SettingsGroup,
    SettingsItem
} from '../repositories/event-management/meeting-settings';
import { MotionWorkflowRepositoryService } from '../repositories/motions/motion-workflow-repository.service';
import { RepositoryServiceCollector } from '../repositories/repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class MeetingSettingsService {
    private settingsMap: { [key: string]: SettingsItem } = {};

    public constructor() {
        for (const group of meetingSettings) {
            for (const subgroup of group.subgroups) {
                for (const setting of subgroup.settings) {
                    this.validateSetting(setting);
                    this.settingsMap[setting.key] = setting;
                }
            }
        }
    }

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

    public getSettingsKeys(): (keyof Meeting)[] {
        return Object.keys(this.settingsMap) as (keyof Meeting)[];
    }

    public getDefaultValue(setting: string | SettingsItem): any {
        if (typeof setting === 'string') {
            setting = this.settingsMap[setting];
        }
        return setting.default ?? this.getDefaultValueForType(setting);
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
