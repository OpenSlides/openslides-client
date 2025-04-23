import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { ViewMediafile } from '../../view-models';

interface MediafileDeleteDialogData {
    file: ViewMediafile;
}

@Component({
    selector: `os-mediafile-delete-dialog`,
    templateUrl: `./mediafile-delete-dialog.component.html`,
    styleUrls: [`./mediafile-delete-dialog.component.scss`],
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe]
})
export class MediafileDeleteDialogComponent {
    public get usedInMeetings(): string {
        return this.data.file.meeting_mediafiles.map(mm => mm.meeting?.name).join(`, `);
    }

    public constructor(
        public dialogRef: MatDialogRef<MediafileDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MediafileDeleteDialogData
    ) {}
}
