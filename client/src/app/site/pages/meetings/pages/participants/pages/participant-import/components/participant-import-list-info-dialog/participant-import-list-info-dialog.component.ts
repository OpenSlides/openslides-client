import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ImportListHeaderDefinition } from '@app/ui/modules/import-list';
import { ListModule } from '@app/ui/modules/list';
import { TranslatePipe } from '@ngx-translate/core';

import {
    participantColumns,
    participantColumnsDescriptions,
    participantHeadersAndVerboseNames
} from '../../definitions';

@Component({
    selector: `os-participant-import-list-info-dialog`,
    templateUrl: `./participant-import-list-info-dialog.component.html`,
    styleUrls: [`./participant-import-list-info-dialog.component.scss`],
    imports: [HeadBarModule, ListModule, TranslatePipe, MatDialogModule]
})
export class ParticipantImportListInfoDialogComponent {
    public readonly defaultColumns: ImportListHeaderDefinition[] = participantColumns.map(header => ({
        property: header,
        label: (participantHeadersAndVerboseNames as string)[header],
        description: (participantColumnsDescriptions as string)[header],
        isTableColumn: true
    }));

    public isString(value: unknown): value is string {
        return typeof value === `string`;
    }
}
