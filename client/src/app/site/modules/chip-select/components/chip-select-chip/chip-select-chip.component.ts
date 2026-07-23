import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
    selector: `os-chip-select-chip`,
    templateUrl: `./chip-select-chip.component.html`,
    styleUrls: [`./chip-select-chip.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChipSelectChipComponent {
    @ViewChild(TemplateRef) public template: TemplateRef<any>;
}
