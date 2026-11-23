import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { AgendaItemType, ItemTypeChoices } from '@app/domain/models/agenda/agenda-item';
import { ModelRequestService } from '@app/site/services/model-request.service';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

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
export class AddItemToAgendaDialog implements OnInit, OnDestroy {
    public parentObserver: Observable<ViewAgendaItem[]>;
    public toAgendaForm = new FormGroup({
        agenda_type: new FormControl<AgendaItemType>(AgendaItemType.COMMON),
        agenda_parent_id: new FormControl<number | null>(null)
    });

    protected visibilityChoices = ItemTypeChoices;

    private subscriptionName: string;

    public dialogRef = inject(MatDialogRef);
    public data = inject<{
        title?: string;
        meetingId: number;
        isMultiSelect?: boolean;
        excludedIds: number[];
    }>(MAT_DIALOG_DATA);

    private agendaItemRepo = inject(AgendaItemControllerService);
    private modelRequestService = inject(ModelRequestService);

    public ngOnInit(): void {
        this.subscriptionName = AGENDA_LIST_ITEM_MINIMAL_SUBSCRIPTION + `_${Date.now()}`;
        this.modelRequestService.subscribeTo({
            ...getAgendaListMinimalSubscriptionConfig(this.data.meetingId),
            subscriptionName: this.subscriptionName
        });

        this.parentObserver = this.agendaItemRepo
            .getViewModelListObservable()
            .pipe(map(items => items.filter(item => !this.data.excludedIds?.includes(item.id))));
    }

    public ngOnDestroy(): void {
        this.modelRequestService.closeSubscription(this.subscriptionName);
    }

    public async addToAgenda(): Promise<void> {
        const control = this.toAgendaForm.controls.agenda_parent_id;
        control.setValue(control.value < 1 ? null : control.value);
        this.dialogRef.close(this.toAgendaForm.value);
    }
}
