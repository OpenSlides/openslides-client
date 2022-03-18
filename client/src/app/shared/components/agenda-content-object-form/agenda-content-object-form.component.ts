import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AutoupdateService } from 'app/core/core-services/autoupdate.service';
import { Permission } from 'app/core/core-services/permission';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ItemTypeChoices } from 'app/shared/models/agenda/agenda-item';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ModelSubscription } from '../../../core/core-services/autoupdate.service';

@Component({
    selector: `os-agenda-content-object-form`,
    templateUrl: `./agenda-content-object-form.component.html`,
    styleUrls: [`./agenda-content-object-form.component.scss`]
})
export class AgendaContentObjectFormComponent implements OnInit, OnDestroy {
    @Input()
    public form: FormGroup;

    public get isShown(): boolean {
        return this._itemsSubject.value.length > 0;
    }

    public get itemObserver(): Observable<ViewAgendaItem[]> {
        return this._itemsSubject.asObservable();
    }

    public permission = Permission;

    public showForm = false;

    public checkbox: FormControl;

    /**
     * Determine visibility states for the agenda that will be created implicitly
     */
    public ItemVisibilityChoices = ItemTypeChoices;

    /**
     * Subject for agenda items
     */
    private _itemsSubject = new BehaviorSubject<ViewAgendaItem[]>([]);
    private _internalSubscription: Subscription | null = null;
    private _internalModelSubscription: ModelSubscription | null = null;

    public constructor(
        private meetingSettingsService: MeetingSettingsService,
        private autoupdate: AutoupdateService,
        public itemRepo: AgendaItemRepositoryService
    ) {}

    public ngOnInit(): void {
        this.checkbox = this.form.controls.agenda_create as FormControl;

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
            this.form.get(`agenda_type`).setValue(visibility);
        });

        this.setupModelSubscription();
        this.setupSubscription();
    }

    public ngOnDestroy(): void {
        if (this._internalSubscription) {
            this._internalSubscription.unsubscribe();
            this._internalSubscription = null;
        }
        if (this._internalModelSubscription) {
            this._internalModelSubscription.close();
            this._internalModelSubscription = null;
        }
    }

    private setupSubscription(): void {
        this._internalSubscription = this.itemRepo
            .getViewModelListObservable()
            .subscribe(agendaItems => this._itemsSubject.next(agendaItems));
    }

    private async setupModelSubscription(): Promise<void> {
        this._internalModelSubscription = await this.autoupdate.subscribe(
            this.itemRepo.getRequestToGetAllModels(),
            `AgendaItemContentComponent:AgendaItems`
        );
    }
}
