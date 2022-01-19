import { Directive, Input } from '@angular/core';

@Directive({
    selector: `[osImportListViewFirstTab]`
})
export class ImportListViewFirstTabDirective {
    @Input()
    public osImportListViewFirstTab = 0;
}
