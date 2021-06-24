import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[osImportListLastTab]'
})
export class ImportListLastTabDirective {
    @Input()
    public osImportListLastTab = 0;
}
