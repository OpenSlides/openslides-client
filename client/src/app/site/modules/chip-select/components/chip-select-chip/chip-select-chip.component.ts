import { Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
    selector: `os-chip-select-chip`,
    templateUrl: `./chip-select-chip.component.html`,
    styleUrls: [`./chip-select-chip.component.scss`]
})
export class ChipSelectChipComponent {
    @ViewChild(TemplateRef) template: TemplateRef<any>;
}
