import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { AgendaItemType, ItemTypeChoices } from '@app/domain/models/agenda/agenda-item';
import { ModelRequestService } from '@app/site/services/model-request.service';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import {
    AGENDA_LIST_ITEM_MINIMAL_SUBSCRIPTION,
    getAgendaListMinimalSubscriptionConfig
} from '../../agenda.subscription';
import { AgendaItemControllerService } from '../../services';
import { ViewAgendaItem } from '../../view-models';

@Component({
    selector: `os-agenda-add-item-dialog`,
    templateUrl: `./agenda-add-item.component.html`,
    styleUrls: [`./agenda-add-item.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        SearchSelectorModule,
        TranslatePipe,
        MatFormFieldModule,
        MatOption,
        MatSelect
    ]
})
export class AddItemToAgendaDialog implements OnInit {
    public parentObserver: Observable<ViewAgendaItem[]>;
    protected visibilityChoices = ItemTypeChoices;
    protected visibilityForm: UntypedFormGroup | null = null;

    public dialogRef = inject(MatDialogRef);
    public data = inject<{
        title?: string;
        meetingId: number;
        isMultiSelect?: boolean;
    }>(MAT_DIALOG_DATA);

    protected toAgendaForm = new FormGroup({
        agenda_type: new FormControl<AgendaItemType | null>(null, Validators.required),
        agenda_parent_id: new FormControl<number | null>(null)
    });

    private agendaItemRepo = inject(AgendaItemControllerService);
    private modelRequestService = inject(ModelRequestService);

    public ngOnInit(): void {
        const subscriptionName = AGENDA_LIST_ITEM_MINIMAL_SUBSCRIPTION + `_${Date.now()}`;
        this.modelRequestService.subscribeTo({
            ...getAgendaListMinimalSubscriptionConfig(this.data.meetingId),
            subscriptionName
        });
        this.parentObserver = this.agendaItemRepo.getViewModelListObservable();
        this.modelRequestService.closeSubscription(subscriptionName);
    }

    public async addToAgenda(): Promise<void> {
        this.dialogRef.close(this.toAgendaForm.value);
    }

    protected isVisibilitySet(): boolean {
        return this.toAgendaForm.controls.agenda_type.value === null;
    }
}
