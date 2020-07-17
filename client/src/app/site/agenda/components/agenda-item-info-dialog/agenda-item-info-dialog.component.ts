import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { DurationService } from 'app/core/ui-services/duration.service';
import { ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { durationValidator } from 'app/shared/validators/custom-validators';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { ViewAgendaItem } from '../../models/view-agenda-item';

/**
 * Dialog component to change agenda item details
 */
@Component({
    selector: 'os-agenda-item-info-dialog',
    templateUrl: './agenda-item-info-dialog.component.html',
    styleUrls: ['./agenda-item-info-dialog.component.scss']
})
export class AgendaItemInfoDialogComponent implements OnInit {
    /**
     * Holds the agenda item form
     */
    public agendaInfoForm: FormGroup;

    /**
     * Hold item visibility
     */
    public itemVisibility = ItemVisibilityChoices;

    public tags: ViewTag[] = [];

    /**
     * Constructor
     *
     * @param formBuilder construct the form
     * @param durationService Converts numbers to readable duration strings
     * @param dialogRef the dialog reference
     * @param item the item that was selected
     */
    public constructor(
        public formBuilder: FormBuilder,
        public durationService: DurationService,
        public dialogRef: MatDialogRef<AgendaItemInfoDialogComponent>,
        public tagRepo: TagRepositoryService,
        @Inject(MAT_DIALOG_DATA) public item: ViewAgendaItem
    ) {
        this.agendaInfoForm = this.formBuilder.group({
            tag_ids: [],
            type: [''],
            durationText: ['', durationValidator],
            item_number: [''],
            comment: ['']
        });
    }

    public ngOnInit(): void {
        // load current values
        if (this.item) {
            this.agendaInfoForm.get('tag_ids').setValue(this.item.tag_ids);
            this.agendaInfoForm.get('type').setValue(this.item.type);
            this.agendaInfoForm
                .get('durationText')
                .setValue(this.durationService.durationToString(this.item.duration, 'h'));
            this.agendaInfoForm.get('item_number').setValue(this.item.item_number);
            this.agendaInfoForm.get('comment').setValue(this.item.comment);
        }

        this.tagRepo.getViewModelListObservable().subscribe(tags => {
            this.tags = tags;
        });
    }

    /**
     * Checks if tags are available.
     *
     * @returns A boolean if they are available.
     */
    public isTagAvailable(): boolean {
        return !!this.tags && this.tags.length > 0;
    }

    /**
     * Function to save the item
     */
    public saveItemInfo(): void {
        this.dialogRef.close(this.agendaInfoForm.value);
    }

    /**
     * Click on cancel button
     */
    public onCancelButton(): void {
        this.dialogRef.close();
    }

    /**
     * clicking Shift and Enter will save the form
     *
     * @param event the key that was clicked
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.saveItemInfo();
        }
    }
}
