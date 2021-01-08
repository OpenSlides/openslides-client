import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';

@Component({
    selector: 'os-agenda-content-object-form',
    templateUrl: './agenda-content-object-form.component.html',
    styleUrls: ['./agenda-content-object-form.component.scss']
})
export class AgendaContentObjectFormComponent implements OnInit {
    @Input()
    public form: FormGroup;

    public showForm = false;

    public checkbox: FormControl;

    /**
     * Determine visibility states for the agenda that will be created implicitly
     */
    public ItemVisibilityChoices = ItemVisibilityChoices;

    /**
     * Subject for agenda items
     */
    public itemObserver: BehaviorSubject<ViewAgendaItem[]>;

    public constructor(
        private meetingSettingsService: MeetingSettingsService,
        private itemRepo: AgendaItemRepositoryService
    ) {}

    public ngOnInit(): void {
        this.checkbox = this.form.controls.agenda_create as FormControl;

        this.meetingSettingsService.get('agenda_item_creation').subscribe(value => {
            if (value === 'always') {
                this.showForm = true;
                this.checkbox.disable();
                this.form.patchValue({ agenda_create: true });
            } else if (value === 'never') {
                this.showForm = false;
                this.checkbox.disable();
                this.form.patchValue({ agenda_create: false });
            } else {
                const defaultValue = value === 'default_yes';
                // check if alrady touched..
                this.showForm = true;
                this.checkbox.enable();
                this.form.patchValue({ agenda_create: defaultValue });
            }
        });

        // Set the default visibility using observers
        this.meetingSettingsService.get('agenda_new_items_default_visibility').subscribe(visibility => {
            this.form.get('agenda_type').setValue(visibility);
        });

        this.itemObserver = this.itemRepo.getViewModelListBehaviorSubject();
    }
}
