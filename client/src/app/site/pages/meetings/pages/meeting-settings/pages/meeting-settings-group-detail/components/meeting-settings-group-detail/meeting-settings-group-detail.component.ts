import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Meeting, Settings } from 'src/app/domain/models/meetings/meeting';
import { Action } from 'src/app/gateways/actions';
import { canPerformListUpdates } from 'src/app/gateways/repositories/base-repository';
import { Relation, RELATIONS } from 'src/app/infrastructure/definitions/relations';
import { ObjectReplaceKeysConfig, partitionModelsForUpdate, replaceObjectKeys } from 'src/app/infrastructure/utils';
import { deepCopy } from 'src/app/infrastructure/utils/transform-functions';
import { CanComponentDeactivate } from 'src/app/site/guards/watch-for-changes.guard';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { MeetingSettingsDefinitionService } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';
import {
    isSettingsInput,
    SettingsGroup,
    SettingsHelpText,
    SettingsHelpTextLinkType,
    SettingsInput,
    SettingsItem,
    SKIPPED_SETTINGS
} from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definitions';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { ensureIdField } from 'src/app/site/services/relation-manager.service';
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
    private changedSettings: { [key in keyof Settings]?: any } = {};

    /**
     * Map of original values for settings that were transformed.
     */
    private originalSettings: { [key in keyof Settings]?: any } = {};

    private keyTransformConfigs: { [key in keyof Settings]?: ObjectReplaceKeysConfig } = {};

    private keyRelations: { [key in keyof Settings]?: Relation } = {};

    /** Provides access to all created settings fields. */
    @ViewChildren(`settingsFields`) public settingsFields!: QueryList<MeetingSettingsGroupDetailFieldComponent>;

    public constructor(
        protected override translate: TranslateService,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private promptDialog: PromptService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionService,
        private repo: MeetingControllerService,
        private collectionMapper: CollectionMapperService
    ) {
        super();
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
                if (meeting && this.settingsGroup) {
                    for (const subgroup of this.settingsGroup.subgroups) {
                        for (const setting of subgroup.settings) {
                            if (isSettingsInput(setting)) {
                                const keys = Array.isArray(setting.key) ? setting.key : [setting.key];
                                const value = this.getDetailFieldValue(meeting, setting);
                                const valueArray = Array.isArray(setting.key) ? value : [value];
                                for (let i = 0; i < keys.length; i++) {
                                    this.originalSettings[keys[i]] = valueArray[i];
                                }
                            }
                        }
                    }
                }
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
            const data = deepCopy(this.changedSettings);
            for (const field of this.settingsFields) {
                if (field.disabled) {
                    const keys = Array.isArray(field.setting.key) ? field.setting.key : [field.setting.key];
                    for (const key of keys) {
                        delete data[key];
                    }
                }
            }
            for (const key of Object.keys(this.keyTransformConfigs)) {
                if (Array.isArray(data[key])) {
                    data[key] = data[key].map((val: unknown) =>
                        typeof val === `object` ? replaceObjectKeys(val, this.keyTransformConfigs[key], true) : val
                    );
                } else if (typeof data[key] === `object`) {
                    data[key] = replaceObjectKeys(data[key], this.keyTransformConfigs[key], true);
                }
            }
            const actions: Action<any>[] = [];
            for (const key of Object.keys(this.keyRelations)) {
                if (data[key] === undefined) {
                    continue;
                }
                const relation = this.keyRelations[key];
                const repo = this.collectionMapper.getRepository(relation.foreignViewModel?.COLLECTION);
                if (!repo || !canPerformListUpdates(repo)) {
                    console.warn(
                        `Can't perform update on ${key}, repository was not suitable. Skipping this key.`,
                        repo
                    );
                } else {
                    actions.push(
                        repo.listUpdate(
                            relation.many
                                ? partitionModelsForUpdate(data[key], this.originalSettings[key])
                                : { toUpdate: data[key] }
                        )
                    );
                }
                delete data[key];
            }
            if (actions.length) {
                await Action.from(...actions).resolve();
            }
            if (Object.keys(data).length) {
                await this.repo.update(data, { meeting: this.meeting });
            }
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
            `Are you sure you want to reset all options to default settings? All changes of this settings group will be lost!`
        );
        if (await this.promptDialog.open(title)) {
            for (const settingsField of this.settingsFields) {
                if (!SKIPPED_SETTINGS.includes(settingsField.setting.key.toString())) {
                    settingsField.onResetButton();
                }
            }
            await this.saveAll();
        }
    }

    /**
     * Returns whether the user made any changes so far by checking the
     * `changedSettings` object.
     */
    public hasChanges(): boolean {
        return this.settingsFields?.some(field => {
            const keys = Array.isArray(field.setting.key) ? field.setting.key : [field.setting.key];
            return keys.some(key => this.changedSettings.hasOwnProperty(key) && !field.disabled);
        });
    }

    public hasErrors(): boolean {
        return this.settingsFields?.some(field => !field.disabled && !field.hasWarning() && !field.valid);
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

    public getDetailFieldValue(meeting: ViewMeeting, setting: SettingsInput): any {
        const isArray = Array.isArray(setting.key);
        let key: keyof ViewMeeting;
        if (setting.type === `daterange`) {
            if (!isArray || setting.key.length < 2 || setting.key[0] === setting.key[1]) {
                throw new Error(
                    `Daterange settings must always cover two different setting keys (${setting.key.toString()})`
                );
            } else {
                return [
                    this.getValueForKey(meeting, setting.key[0] as keyof Settings, setting),
                    this.getValueForKey(meeting, setting.key[1] as keyof Settings, setting)
                ];
            }
        }
        if (isArray) {
            if (!setting.key.length) {
                throw new Error(`Missing setting key`);
            }
            if (setting.key.length > 1) {
                console.warn(`Additional setting keys for ${setting.key[0]} will be skipped.`);
            }
            key = meeting[setting.key[0]] as keyof Settings;
        } else {
            key = setting.key as keyof Settings;
        }
        return this.getValueForKey(meeting, key, setting);
    }

    public isSettingsInput(setting: SettingsItem): setting is SettingsInput {
        return isSettingsInput(setting);
    }

    public hasExternalLink(setting: SettingsHelpText): boolean {
        return setting.buttonLinkType === SettingsHelpTextLinkType.External;
    }

    public getHelpLink(setting: SettingsHelpText): string {
        let link = setting.buttonLink;
        if (setting.buttonLinkType != SettingsHelpTextLinkType.External) {
            if (!link.startsWith(`/`)) {
                link = `/` + link;
            }
            if (setting.buttonLinkType != SettingsHelpTextLinkType.Organization) {
                link = `/` + this.meeting.id + link;
            }
        }
        return link;
    }

    public isSettingDisabled(setting: SettingsInput): boolean {
        return setting.disable?.({ ...this.originalSettings, ...this.changedSettings });
    }

    public isForbidden(setting: SettingsInput): boolean {
        return setting.forbidden?.(this.meeting);
    }

    private getValueForKey(meeting: ViewMeeting, key: keyof Settings, setting: SettingsInput): any {
        let newKey: keyof ViewMeeting = key;
        if (setting.useRelation) {
            if (!this.keyRelations[key]) {
                this.keyRelations[key] = RELATIONS.find(
                    relation =>
                        relation.ownViewModels.some(model => model.COLLECTION === Meeting.COLLECTION) &&
                        ensureIdField(relation) === key
                );
            }
            newKey = this.keyRelations[key]?.ownField as keyof ViewMeeting;
            if (!newKey) {
                console.warn(`Couldn't find relation for ${key}, will instead use id values`);
            }
            newKey = newKey || key;
        }
        let result: any = meeting[newKey];
        if (setting.pickKeys) {
            if (Array.isArray(result)) {
                result = result.map(val =>
                    typeof val === `object` ? setting.pickKeys.mapToObject(key => ({ [key]: val[key] })) : val
                );
            } else if (typeof result === `object`) {
                result = setting.pickKeys.mapToObject(key => ({ [key]: result[key] }));
            }
        }
        if (setting.keyTransformationConfig) {
            this.keyTransformConfigs[key] = setting.keyTransformationConfig;
            if (Array.isArray(result)) {
                result = result.map(val =>
                    typeof val === `object` ? replaceObjectKeys(val, setting.keyTransformationConfig) : val
                );
            } else if (typeof result === `object`) {
                result = replaceObjectKeys(result, setting.keyTransformationConfig);
            }
        }
        return result;
    }

    /**
     * Updates the specified settings item indicated by the given key.
     */
    private calculateAutomaticFieldChanges(update: SettingsFieldUpdate): void {
        const detailFields =
            this.settingsFields?.filter(field =>
                (Array.isArray(update.key) ? update.key : [update.key]).some(key =>
                    field.watchProperties?.includes(key)
                )
            ) ?? [];
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
