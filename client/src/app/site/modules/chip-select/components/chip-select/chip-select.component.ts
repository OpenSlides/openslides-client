import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
    selector: `os-chip-select`,
    templateUrl: `./chip-select.component.html`,
    styleUrls: [`./chip-select.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipSelectComponent implements OnInit {
    constructor() {}

    @Input()
    public canOpen: boolean;

    ngOnInit(): void {}
}
