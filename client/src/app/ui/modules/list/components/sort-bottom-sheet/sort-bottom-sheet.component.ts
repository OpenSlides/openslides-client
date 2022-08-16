import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { OsSortProperty } from 'src/app/site/base/base-sort.service';
import { SortListService } from 'src/app/ui/modules/list/definitions/sort-service';

/**
 * A bottom sheet used for setting a list's sorting, used by {@link SortFilterBarComponent}
 * usage:
 * ```
 * @ViewChild('sortBottomSheet')
 * public sortBottomSheet: SortBottomSheetComponent<V>;
 * ...
 * this.bottomSheet.open(SortBottomSheetComponent, { data: SortService });
 * ```
 */
@Component({
    selector: `os-sort-bottom-sheet`,
    templateUrl: `./sort-bottom-sheet.component.html`,
    styleUrls: [`./sort-bottom-sheet.component.scss`]
})
export class SortBottomSheetComponent<V> implements OnInit {
    /**
     * Constructor. Gets a reference to itself (for closing after interaction)
     * @param data
     * @param sheetRef
     */
    public constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: SortListService<V>,
        private sheetRef: MatBottomSheetRef
    ) {}

    /**
     * init function. Closes immediately if no sorting is available.
     */
    public ngOnInit(): void {
        if (!this.data || !this.data.sortOptions || !this.data.sortOptions.length) {
            throw new Error(`No sorting available for a sorting list`);
        }
    }

    /**
     * Logic for a toggle of options. Either reverses sorting, or
     * sorts after a new property.
     */
    public clickedOption(item: string | number | symbol | OsSortProperty<V>): void {
        this.sheetRef.dismiss(item);
    }
}
