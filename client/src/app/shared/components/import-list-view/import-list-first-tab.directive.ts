import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[osImportListFirstTab]'
})
export class ImportListFirstTabDirective {
    @Input()
    public osImportListFirstTab = 0;
}
