import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { getAgendaListMinimalSubscriptionConfig } from 'src/app/site/pages/meetings/pages/agenda/agenda.subscription';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { AgendaContentObjectFormService } from '../../services/agenda-content-object-form.service';

@Component({
    selector: `os-agenda-content-object-form`,
    templateUrl: `./agenda-content-object-form.component.html`,
    styleUrls: [`./agenda-content-object-form.component.scss`]
})
export class AgendaContentObjectFormComponent
    extends BaseModelRequestHandlerComponent
    implements AfterViewInit, OnDestroy
{
    @Input()
    public form!: UntypedFormGroup;

    public get hasItemsObservable(): Observable<boolean> {
        return this._itemsSubject.pipe(map(items => items.length > 0));
    }

    public get itemObserver(): Observable<ViewAgendaItem[]> {
        return this._itemsSubject;
    }

    public permission = Permission;

    public showForm = false;

    public get checkbox(): AbstractControl {
        return this.form.get(`agenda_create`)!;
    }

    /**
     * Determine visibility states for the agenda that will be created implicitly
     */
    public readonly itemVisibilityChoices = ItemTypeChoices;

    /**
     * Subject for agenda items
     */
    private _itemsSubject = new BehaviorSubject<ViewAgendaItem[]>([]);
    private _internalSubscription: Subscription | null = null;

    public constructor(
        private meetingSettingsService: MeetingSettingsService,
        public itemRepo: AgendaContentObjectFormService
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        this.meetingSettingsService.get(`agenda_item_creation`).subscribe(value => {
            if (value === `always`) {
                this.showForm = true;
                this.checkbox.disable();
                this.form.patchValue({ agenda_create: true });
            } else if (value === `never`) {
                this.showForm = false;
                this.checkbox.disable();
                this.form.patchValue({ agenda_create: false });
            } else {
                const defaultValue = value === `default_yes`;
                // check if alrady touched..
                this.showForm = true;
                this.checkbox.enable();
                this.form.patchValue({ agenda_create: defaultValue });
            }
        });

        // Set the default visibility using observers
        this.meetingSettingsService.get(`agenda_new_items_default_visibility`).subscribe(visibility => {
            this.form.get(`agenda_type`)?.setValue(visibility);
        });

        this.setupSubscription();
    }

    public override ngOnDestroy(): void {
        if (this._internalSubscription) {
            this._internalSubscription.unsubscribe();
            this._internalSubscription = null;
        }

        super.ngOnDestroy();
    }

    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAgendaListMinimalSubscriptionConfig(id), { hideWhenDestroyed: true });
        }
    }

    private setupSubscription(): void {
        this._internalSubscription = this.itemRepo.getViewModelListObservable().subscribe(agendaItems => {
            setTimeout(() => this._itemsSubject.next(agendaItems));
        });
    }
}
