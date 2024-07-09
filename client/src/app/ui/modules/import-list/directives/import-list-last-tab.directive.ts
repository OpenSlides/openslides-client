import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: `[osImportListLastTab]`
})
export class ImportListLastTabDirective {
    @Input()
    public label: string;

    public constructor(public templateRef: TemplateRef<unknown>) {}
}
