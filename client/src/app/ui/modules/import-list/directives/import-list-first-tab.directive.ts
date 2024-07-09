import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: `[osImportListFirstTab]`
})
export class ImportListFirstTabDirective {
    @Input()
    public label: string;

    public constructor(public templateRef: TemplateRef<unknown>) {}
}
