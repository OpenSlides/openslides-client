import { AfterContentInit, Component, ContentChildren, Input, QueryList } from '@angular/core';

import { ChipSelectChipComponent } from '../chip-select-chip/chip-select-chip.component';

@Component({
    selector: `os-chip-select`,
    templateUrl: `./chip-select.component.html`,
    styleUrls: [`./chip-select.component.scss`]
})
export class ChipSelectComponent implements AfterContentInit {
    constructor() {}

    @Input()
    public canOpen: boolean;

    @ContentChildren(ChipSelectChipComponent) inputChips: QueryList<ChipSelectChipComponent>;

    public chips: ChipSelectChipComponent[] = [];

    ngAfterContentInit(): void {
        this.chips = this.inputChips.toArray();
        this.inputChips.changes.subscribe((chips: ChipSelectChipComponent[]) => {
            this.chips = chips;
        });
    }
}
