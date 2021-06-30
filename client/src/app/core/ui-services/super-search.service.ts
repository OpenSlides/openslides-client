import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { SuperSearchComponent } from 'app/site/common/components/super-search/super-search.component';

@Injectable({
    providedIn: 'root'
})
export class SuperSearchService {
    /**
     * Holds the reference to the search-dialog.
     * Necessary to prevent opening multiple dialogs at once.
     */
    private searchReference: MatDialogRef<SuperSearchComponent> = null;

    public constructor(private dialogService: MatDialog) {}

    /**
     * Sets the state of the `SuperSearchComponent`.
     *
     * @param data Additional data passed to the component. Optional.
     */
    public open(data?: any): void {
        if (!this.searchReference) {
            this.searchReference = this.dialogService.open(SuperSearchComponent, {
                ...largeDialogSettings,
                data: data ? data : null,
                disableClose: false,
                panelClass: 'super-search-container'
            });
            this.searchReference.afterClosed().subscribe(() => {
                this.searchReference = null;
            });
        }
    }
}
