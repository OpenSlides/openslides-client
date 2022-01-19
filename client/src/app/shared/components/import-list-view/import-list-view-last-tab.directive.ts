import { Directive, Input } from '@angular/core';

@Directive({
    selector: `[osImportListViewLastTab]`
})
export class ImportListViewLastTabDirective {
    @Input()
    public osImportListViewLastTab = 0;
}
