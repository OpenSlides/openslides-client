import { AfterContentInit, Component, ContentChildren, input, QueryList, ChangeDetectionStrategy } from '@angular/core';

import { ChipSelectChipComponent } from '../chip-select-chip/chip-select-chip.component';

@Component({
    selector: `os-chip-select`,
    templateUrl: `./chip-select.component.html`,
    styleUrls: [`./chip-select.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChipSelectComponent implements AfterContentInit {
    public readonly chipClass = input<string | null>(null);

    public readonly canOpen = input<boolean>(false);

    @ContentChildren(ChipSelectChipComponent) public inputChips: QueryList<ChipSelectChipComponent>;

    public chips: ChipSelectChipComponent[] = [];

    public ngAfterContentInit(): void {
        this.chips = this.inputChips.toArray();
        this.inputChips.changes.subscribe((chips: ChipSelectChipComponent[]) => {
            this.chips = chips;
        });
    }
}
