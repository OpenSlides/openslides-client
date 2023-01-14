import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { DurationService } from 'src/app/site/services/duration.service';

import { ViewTag } from '../../../../../motions';
import { TagControllerService } from '../../../../../motions/modules/tags/services';
import { DurationValidator } from '../../../../validators/duration.validator';
import { ViewAgendaItem } from '../../../../view-models';

/**
 * Dialog component to change agenda item details
 */
@Component({
    selector: `os-agenda-item-info-dialog`,
    templateUrl: `./agenda-item-info-dialog.component.html`,
    styleUrls: [`./agenda-item-info-dialog.component.scss`]
})
export class AgendaItemInfoDialogComponent implements OnInit {
    /**
     * Holds the agenda item form
     */
    public agendaInfoForm: UntypedFormGroup;

    /**
     * Hold item visibility
     */
    public itemVisibility = ItemTypeChoices;

    public tags: ViewTag[] = [];

    public constructor(
        public formBuilder: UntypedFormBuilder,
        public durationService: DurationService,
        public dialogRef: MatDialogRef<AgendaItemInfoDialogComponent>,
        public tagRepo: TagControllerService,
        @Inject(MAT_DIALOG_DATA) public item: ViewAgendaItem
    ) {
        this.agendaInfoForm = this.formBuilder.group({
            tag_ids: [],
            type: [``],
            durationText: [``, DurationValidator],
            item_number: [``],
            comment: [``]
        });
    }

    public ngOnInit(): void {
        // load current values
        if (this.item) {
            this.agendaInfoForm.get(`tag_ids`)!.setValue(this.item.tag_ids);
            this.agendaInfoForm.get(`type`)!.setValue(this.item.type);
            this.agendaInfoForm
                .get(`durationText`)!
                .setValue(this.durationService.durationToString(this.item.duration, `h`));
            this.agendaInfoForm.get(`item_number`)!.setValue(this.item.item_number);
            this.agendaInfoForm.get(`comment`)!.setValue(this.item.comment);
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
        if (event.key === `Enter` && event.shiftKey) {
            this.saveItemInfo();
        }
    }
}
