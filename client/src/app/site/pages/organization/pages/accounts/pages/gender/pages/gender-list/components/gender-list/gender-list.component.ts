import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: `os-gender-list`,
    templateUrl: `./gender-list.component.html`,
    styleUrl: `./gender-list.component.scss`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenderListComponent {}
