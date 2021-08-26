import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as moment from 'moment';
import { Moment } from 'moment';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsDefinitionProvider } from 'app/core/ui-services/meeting-settings-definition-provider.service';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewGroup } from 'app/site/users/models/view-group';
import { SettingsItem } from '../../../../core/repositories/management/meeting-settings-definition';

export interface SettingsFieldUpdate {
    key: string;
    value: any;
}

/**
 * Component for a config field, used by the {@link ConfigListComponent}. Handles
 * all input types defined by the server, as well as updating the configs
 *
 * @example
 * ```ts
 * <os-config-field [config]="<ViewConfig>"></os-config-field>
 * ```
 */
@Component({
    selector: 'os-meeting-settings-field',
    templateUrl: './meeting-settings-field.component.html',
    styleUrls: ['./meeting-settings-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None // to style the date and time pickers
})
export class MeetingSettingsFieldComponent extends BaseComponent implements OnInit, OnDestroy {
    /**
     * Option to show a green check-icon.
     */
    public updateSuccessIcon = false;

    /**
     * A possible error send by the server.
     */
    public error: string | null = null;

    /**
     * Translated config value for template
     */
    public translatedValue: object;

    /**
     * The settings item for this component.
     */
    @Input()
    public setting: SettingsItem;

    /**
     * The current value of this component's setting.
     */
    @Input()
    public value: any;

    /**
     * The form for this configItem.
     */
    public form: FormGroup;

    /** Accessor to get the validity of this field. */
    public get valid(): boolean {
        return this.form?.valid;
    }

    /**
     * The matcher for custom (request) errors.
     */
    public matcher = new ParentErrorStateMatcher();

    @Output()
    public update = new EventEmitter<SettingsFieldUpdate>();

    /** used by the groups config type */
    public groupObservable: Observable<ViewGroup[]> = null;

    /**
     * The usual component constructor. datetime pickers will set their locale
     * to the current language chosen
     *
     * @param titleService Title
     * @param translate TranslateService
     * @param formBuilder FormBuilder
     * @param cd ChangeDetectorRef
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private formBuilder: FormBuilder,
        private cd: ChangeDetectorRef,
        private groupRepo: GroupRepositoryService,
        public meetingSettingsDefinitionProvider: MeetingSettingsDefinitionProvider,
        private mapper: CollectionMapperService,
        private orgaSettings: OrganizationSettingsService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Sets up the form for this settings field.
     */
    public ngOnInit(): void {
        // filter out empty results in group observable. We never have no groups and it messes up
        // the settings change detection
        this.groupObservable = this.groupRepo.getViewModelListObservableWithoutDefaultGroup().pipe(
            filter(groups => !!groups.length),
            map(groups => this.getRestrictedValue(groups))
        );

        if (this.setting.choicesFunc) {
            const def = this.setting.choicesFunc;
            const repo = this.mapper.getRepository(def.collection);
            if (!repo) {
                throw new Error(`Repository for collection "${def.collection}" not found.`);
            }
            this.subscriptions.push(
                repo.getViewModelListObservable().subscribe(models => {
                    this.setting.choices = models.mapToObject(model => ({
                        [model[def.idKey]]: model[def.labelKey]
                    }));
                    this.cd.markForCheck();
                })
            );
        }

        this.form = this.formBuilder.group({
            value: ['', this.setting.validators ?? []],
            date: [''],
            time: ['']
        });
        this.translatedValue = this.value ?? this.meetingSettingsDefinitionProvider.getDefaultValue(this.setting);
        if (this.setting.type === 'string' || this.setting.type === 'markupText' || this.setting.type === 'text') {
            if (typeof this.value === 'string' && this.value !== '') {
                this.translatedValue = this.translate.instant(this.value);
            }
        }
        if ((this.setting.type === 'datetime' || this.setting.type === 'date') && this.value) {
            const datetimeObj = this.getRestrictedValue(this.unixToDateAndTime(this.value as number));
            this.form.patchValue(datetimeObj);
        }
        this.form.patchValue({
            value: this.getRestrictedValue(this.translatedValue)
        });
        this.form.valueChanges
            // The editor fires changes whenever content was changed. Even by AutoUpdate.
            // This checks for discting content
            .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
            .subscribe(form => {
                this.onChange(form.value);
            });
    }

    /**
     * Stops the change detection
     */
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cd.detach();
    }

    public getRestrictedValue<T>(value: T): T {
        if (this.setting.restrictionFn) {
            return this.setting.restrictionFn(this.orgaSettings, value);
        }
        if (typeof value === 'number') {
            value = value.toString() as any;
        }
        return value;
    }

    /**
     * Helper function to split a unix timestamp into a date as a moment object and a time string in the form of HH:SS
     *
     * @param unix the timestamp
     *
     * @return an object with a date and a time field
     */
    private unixToDateAndTime(unix: number): { date: Moment; time: string } {
        const date = moment.unix(unix);
        const time = date.hours() + ':' + date.minutes();
        return { date, time };
    }

    /**
     * Helper function to fuse a moment object as the date part and a time string (HH:SS) as the time part.
     *
     * @param date the moment date object
     * @param time the time string
     *
     * @return a unix timestamp
     */
    private dateAndTimeToUnix(date: Moment, time: string): number {
        if (date) {
            if (time) {
                const timeSplit = time.split(':');
                // + is faster than parseint and number(). ~~ would be fastest but prevented by linter...
                date.hour(+timeSplit[0]);
                date.minute(+timeSplit[1]);
            }
            return date.unix();
        } else {
            return null;
        }
    }

    /**
     * Trigger an update of the data
     */
    private onChange(value: any): void {
        switch (this.setting.type) {
            case 'markupText':
                // tinyMCE markuptext does not autoupdate on change, only when entering or leaving
                return;
            case 'date':
            case 'datetime':
                // datetime has to be converted
                const date = this.form.get('date').value;
                const time = this.form.get('time').value;
                value = this.dateAndTimeToUnix(date, time);
                break;
            case 'groups':
                // we have to check here explicitly if nothing changed because of the search value selector
                const newS = new Set(value);
                const oldS = new Set(this.value);
                if (newS.equals(oldS)) {
                    return;
                }
                break;
            case 'integer':
                // convert to an actual integer
                value = +value;
                break;
            case 'choice':
                // if choicesFunc is set, the keys are ids and therefore need to be converted to ints
                if (this.setting.choicesFunc) {
                    value = +value;
                }
                break;
        }
        this.sendUpdate(value);
        this.cd.detectChanges();
    }

    /**
     * Triggers a reset to the default value
     */
    public onResetButton(): void {
        this.form.controls.value.setValue(this.meetingSettingsDefinitionProvider.getDefaultValue(this.setting));
    }

    /**
     * Sends an update request for the config item to the server.
     * @param value The new value to set.
     */
    private sendUpdate(value: any): void {
        this.update.emit({ key: this.setting.key, value });
    }

    /**
     * Uses the configItem to determine the kind of interation:
     * input, textarea, choice or date
     *
     * @param type: the type of a config item
     *
     * @returns the template type
     */
    public formType(type: string): string {
        switch (type) {
            case 'integer':
                return 'number';
            case 'colorpicker':
                return 'color';
            default:
                return 'text';
        }
    }

    /**
     * Checks of the config.type can be part of the form
     *
     * @param type the config.type of a setting
     *
     * @returns wheather it should be excluded or not
     */
    public isExcludedType(type: string): boolean {
        const excluded = ['boolean', 'markupText', 'text', 'translations', 'datetime', 'date'];
        return excluded.includes(type);
    }

    /**
     * Amends the application-wide tinyMCE settings with update triggers that
     * send updated values only after leaving focus (Blur) or closing the editor (Remove)
     *
     * @returns an instance of tinyMCE settings with additional setup definitions
     */
    public getTinyMceSettings(): object {
        return {
            ...this.tinyMceSettings,
            setup: editor => {
                editor.on('Blur', ev => {
                    if (ev.target.getContent() !== this.translatedValue) {
                        this.sendUpdate(ev.target.getContent());
                    }
                });
            }
        };
    }

    /**
     * compare function used with the KeyValuePipe to display the percent bases in original order
     */
    public keepEntryOrder(): number {
        return 0;
    }
}
