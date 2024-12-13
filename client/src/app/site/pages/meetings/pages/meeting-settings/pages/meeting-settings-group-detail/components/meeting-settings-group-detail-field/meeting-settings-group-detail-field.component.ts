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
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { fromUnixTime, getHours, getMinutes, getUnixTime, setHours, setMinutes } from 'date-fns';
import { distinctUntilChanged, filter, map, Observable } from 'rxjs';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { MeetingSettingsDefinitionService } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';
import { SettingsInput } from 'src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definitions';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { ParentErrorStateMatcher } from 'src/app/ui/modules/search-selector/validators';

import { GroupControllerService } from '../../../../../participants/modules/groups/services/group-controller.service';
import { AllocationListConfig } from '../allocation-list/allocation-list.component';

export interface SettingsFieldUpdate {
    key: keyof Settings | (keyof Settings)[];
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
    selector: `os-meeting-settings-group-detail-field`,
    templateUrl: `./meeting-settings-group-detail-field.component.html`,
    styleUrls: [`./meeting-settings-group-detail-field.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None // to style the date and time pickers
})
export class MeetingSettingsGroupDetailFieldComponent extends BaseComponent implements OnInit, OnDestroy {
    /**
     * The amount of pixels to indent the field per indentation level.
     */
    public readonly INDENTATION_PIXEL_AMOUNT = 15;

    /**
     * Option to show a green check-icon.
     */
    public updateSuccessIcon = false;

    /**
     * A possible error send by the server.
     */
    public error: string | null = null;

    /**
     * Current value for internal use
     */
    public internalValue!: any;

    /**
     * The settings item for this component.
     */
    @Input()
    public setting!: SettingsInput;

    @Input()
    public set disabled(disabled: boolean) {
        this._disabled = disabled;
        if (disabled) {
            this.form?.disable();
        } else {
            this.form?.enable();
        }
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    private _disabled = false;

    /**
     * The current value of this component's setting.
     */
    @Input()
    public set value(nextValue: any) {
        if (Array.isArray(nextValue)) {
            this._firstValue = [...nextValue];
        } else {
            this._firstValue = nextValue;
        }
        this._value = nextValue;
    }

    public get value(): any {
        return this._value;
    }

    public get currentValue(): any {
        const value = this.form.get(`value`);
        if (this.setting.type === `datetime` || this.setting.type === `date`) {
            const date = this.form.get(`date`)!.value;
            const time = this.form.get(`time`)!.value;
            return this.dateAndTimeToUnix(date, time);
        }
        return value.value;
    }

    /**
     * The form for this configItem.
     */
    public form!: UntypedFormGroup;

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
    public groupObservable: Observable<ViewGroup[]> | null = null;

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    public get watchProperties(): (keyof Settings)[] {
        return this.setting.automaticChangesSetting?.watchProperties;
    }

    public get getChangeFn(): (currentValue: any, currentWatchPropertyValues: any[]) => any {
        return (
            this.setting.automaticChangesSetting?.getChangeFn ??
            ((currentValue, _currentWatchPropertyValues): any => currentValue)
        );
    }

    public readonly TRANSLATION_CONFIG: AllocationListConfig = {
        entryLabel: _(`Original`),
        allocationLabel: _(`Translation`),
        addButtonLabel: _(`Add new custom translation`)
    };

    public readonly RANKING_CONFIG: AllocationListConfig = {
        entryLabel: _(`Name`),
        allocationLabel: _(`Rank`),
        addButtonLabel: _(`Add new entry`),
        isNumberAllocation: true
    };

    private _comparedForm = false;

    /**
     * The current value of this setting. It is usually the first value, but this does not work for groups...
     */
    private _value: any;
    /**
     * This is the first value this setting received. Used to determine if the value changed. It is especially for
     * groups necessary, since the `value` is always the current value when this setting is a group.
     */
    private _firstValue: any;

    public constructor(
        protected override translate: TranslateService,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef,
        private groupRepo: GroupControllerService,
        public meetingSettingsDefinitionProvider: MeetingSettingsDefinitionService,
        private mapper: CollectionMapperService,
        private orgaSettings: OrganizationSettingsService
    ) {
        super();
    }

    /**
     * Sets up the form for this settings field.
     */
    public ngOnInit(): void {
        // filter out empty results in group observable. We never have no groups and it messes up
        // the settings change detection
        this.groupObservable = this.groupRepo.getViewModelListWithoutSystemGroupsObservable().pipe(
            filter(groups => !!groups.length),
            map(groups => this.getRestrictedValue(groups))
        );

        if (this.setting.choicesFunc) {
            const def = this.setting.choicesFunc;
            const repo = this.mapper.getRepository<any, any>(def.collection);
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
            value: [``, this.setting.validators ?? []],
            date: [``],
            time: [``],
            daterange: [
                {
                    start: null,
                    end: null
                }
            ]
        });
        if (this.disabled || this.hasWarning()) {
            this.form.disable();
        }
        this.internalValue = this.value ?? this.meetingSettingsDefinitionProvider.getDefaultValue(this.setting);
        if ((this.setting.type === `datetime` || this.setting.type === `date`) && this.value) {
            const datetimeObj = this.getRestrictedValue(this.unixToDateAndTime(this.value as number));
            this.form.patchValue(datetimeObj);
        }
        if (this.setting.type === `daterange` && this.value) {
            const daterangeObj = {
                start: this.getRestrictedValue(this.value[0] ? new Date(this.value[0] * 1000) : null),
                end: this.getRestrictedValue(this.value[1] ? new Date(this.value[1] * 1000) : null)
            };
            this.form.get(`daterange`).patchValue(daterangeObj);
        }
        this.form.patchValue({
            value: this.getRestrictedValue(this.internalValue)
        });
        this.form.valueChanges
            // The editor fires changes whenever content was changed. Even by AutoUpdate.
            // This checks for discting content
            .pipe(
                distinctUntilChanged((previous, next) => {
                    this._comparedForm = true;
                    if (this.setting.type === `groups`) {
                        return JSON.stringify(this._firstValue) === JSON.stringify(next.value);
                    }
                    return JSON.stringify(previous) === JSON.stringify(next);
                })
            )
            .subscribe(form => {
                if (
                    this._comparedForm ||
                    (JSON.stringify(form.value) !== JSON.stringify(this._firstValue) && this.setting.type !== `groups`)
                ) {
                    this.onChange(form.value);
                }
            });
    }

    /**
     * Stops the change detection
     */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cd.detach();
    }

    /**
     * Checks if a warning should be given
     *
     */
    public hasWarning(): boolean {
        if (this.setting.warn) {
            return this.setting.warn(this.orgaSettings);
        } else {
            return false;
        }
    }

    public getRestrictedValue<T>(value: T): T {
        if (this.setting.restrictionFn) {
            return this.setting.restrictionFn(this.orgaSettings, value);
        }
        if (typeof value === `number`) {
            value = value.toString() as any;
        }
        return value;
    }

    public updateValue(newValue: any): void {
        if ((this.setting.type === `datetime` || this.setting.type === `date`) && newValue) {
            const datetimeObj = this.getRestrictedValue(this.unixToDateAndTime(newValue as number));
            this.form.patchValue(datetimeObj);
        }
        if (this.setting.type === `daterange` && newValue) {
            const daterangeObj = {
                start: this.getRestrictedValue(newValue[0] ? new Date(newValue[0]) : null),
                end: this.getRestrictedValue(newValue[1] ? new Date(newValue[1]) : null)
            };
            this.form.get(`daterange`).patchValue(daterangeObj);
        }
        this.form.patchValue({
            value: this.getRestrictedValue(newValue)
        });
    }

    public getAllocationConfig(setting: SettingsInput<any>): AllocationListConfig {
        return {
            ...(setting.type === `translations` ? this.TRANSLATION_CONFIG : this.RANKING_CONFIG),
            useIds: setting.useRelation
        };
    }

    /**
     * Helper function to split a unix timestamp into a date as a date object and a time string in the form of HH:SS
     *
     * @param unix the timestamp
     *
     * @return an object with a date and a time field
     */
    private unixToDateAndTime(unix: number): { date: Date; time: string } {
        const date = fromUnixTime(unix);
        const time = getHours(date) + `:` + getMinutes(date);
        return { date, time };
    }

    /**
     * Helper function to fuse a date object as the date part and a time string (HH:SS) as the time part.
     *
     * @param date the date object
     * @param time the time string
     *
     * @return a unix timestamp
     */
    private dateAndTimeToUnix(date: Date, time: string): number | null {
        if (date) {
            if (time) {
                const timeSplit = time.split(`:`);
                // + is faster than parseint and number(). ~~ would be fastest but prevented by linter...
                setHours(date, +timeSplit[0]);
                setMinutes(date, +timeSplit[1]);
            }
            return getUnixTime(date);
        } else {
            return null;
        }
    }

    /**
     * Trigger an update of the data
     */
    private onChange(value: any): void {
        switch (this.setting.type) {
            case `markupText`:
                // tinyMCE markuptext does not autoupdate on change, only when entering or leaving
                return;
            case `date`:
            case `datetime`:
                // datetime has to be converted
                const date = this.form.get(`date`)!.value;
                const time = this.form.get(`time`)!.value;
                value = this.dateAndTimeToUnix(date, time);
                break;
            case `daterange`:
                // daterange has to be formatted
                const start = this.form.get(`daterange`)!.value.start;
                const end = this.form.get(`daterange`)!.value.end;
                value = [start, end];
                break;
            case `groups`:
                // we have to check here explicitly if nothing changed because of the search value selector
                const newS = new Set(value);
                const oldS = new Set(this._firstValue);
                if (newS.equals(oldS)) {
                    return;
                }
                break;
            case `integer`:
                // convert to an actual integer
                value = +value;
                break;
            case `choice`:
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
        this.form.controls[`value`].setValue(this.meetingSettingsDefinitionProvider.getDefaultValue(this.setting));
    }

    public onClearDate(): void {
        this.form.controls[`date`].setValue(null);
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
            case `integer`:
                return `number`;
            case `colorpicker`:
                return `color`;
            default:
                return `text`;
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
        const excluded = [`boolean`, `markupText`, `text`, `translations`, `ranking`, `datetime`, `date`, `daterange`];
        return excluded.includes(type);
    }

    public onEditorBlur(): void {
        if (this.value !== this.internalValue) {
            this.sendUpdate(this.value);
        }
    }

    /**
     * compare function used with the KeyValuePipe to display the percent bases in original order
     */
    public keepEntryOrder(): number {
        return 0;
    }
}
