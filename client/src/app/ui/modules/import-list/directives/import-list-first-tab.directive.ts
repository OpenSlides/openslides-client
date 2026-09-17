import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: `[osImportListFirstTab]`,
    standalone: false
})
export class ImportListFirstTabDirective {
    @Input()
    public label: string;

    public templateRef = inject(TemplateRef<unknown>);
}
