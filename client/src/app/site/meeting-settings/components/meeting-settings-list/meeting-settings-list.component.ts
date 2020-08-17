import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { CanComponentDeactivate } from 'app/shared/utils/watch-for-changes.guard';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { SettingsGroup } from '../../../../core/repositories/event-management/meeting-settings';
import {
    MeetingSettingsFieldComponent,
    SettingsFieldUpdate
} from '../meeting-settings-field/meeting-settings-field.component';

/**
 * List view for the global settings
 */
@Component({
    selector: 'os-meeting-settings-list',
    templateUrl: './meeting-settings-list.component.html',
    styleUrls: ['./meeting-settings-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingSettingsListComponent extends BaseModelContextComponent
    implements CanComponentDeactivate, OnInit, OnDestroy {
    public settingsGroup: SettingsGroup;

    public meeting: ViewMeeting;

    /**
     * Map of all changed settings.
     */
    private changedSettings: { [key: string]: any } = {};

    /** Provides access to all created settings fields. */
    @ViewChildren('settingsFields') public settingsFields: QueryList<MeetingSettingsFieldComponent>;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private promptDialog: PromptService,
        private meetingSettingsService: MeetingSettingsService,
        private activeMeetingService: ActiveMeetingService,
        private repo: MeetingRepositoryService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Sets the title, inits the table and calls the repo
     */
    public ngOnInit(): void {
        super.ngOnInit();
        const settings = this.translate.instant('Settings');
        this.route.params.subscribe(params => {
            if (params.group) {
                this.settingsGroup = this.meetingSettingsService.getSettingsGroup(params.group);
                const groupName = this.translate.instant(this.settingsGroup.label);
                super.setTitle(`${settings} - ${groupName}`);
                this.cd.markForCheck();
            }
        });
        this.activeMeetingService.getMeetingObservable().subscribe(meeting => {
            this.meeting = meeting;
        });
    }

    /**
     * Updates the specified settings item indicated by the given key.
     */
    public updateSetting(update: SettingsFieldUpdate): void {
        this.changedSettings[update.key] = update.value;
        this.cd.markForCheck();
    }

    /**
     * Saves every field in this config-group.
     */
    public saveAll(): void {
        this.cd.detach();
        this.repo.update(this.changedSettings, this.meeting).then(
            result => {
                this.changedSettings = {};
                this.cd.reattach();
                this.cd.markForCheck();
            },
            error => {
                this.matSnackBar.open(error, this.translate.instant('Ok'), {
                    duration: 0
                });
            }
        );
    }

    /**
     * This resets all values to their defaults.
     */
    public async resetAll(): Promise<void> {
        const title = this.translate.instant(
            'Are you sure you want to reset all options to factory defaults? All changes of this settings group will be lost!'
        );
        if (await this.promptDialog.open(title)) {
            for (const settingsField of this.settingsFields) {
                settingsField.onResetButton();
            }
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
            const title = this.translate.instant('Do you really want to exit this page?');
            const content = this.translate.instant('You made changes.');
            return await this.promptDialog.open(title, content);
        }
        return true;
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [1], // TODO
            follow: [
                {
                    idField: 'group_ids',
                    fieldset: 'name'
                },
                {
                    idField: 'motion_workflow_ids',
                    fieldset: 'name'
                }
            ]
        };
    }
}
