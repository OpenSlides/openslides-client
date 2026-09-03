import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: `[osImportListLastTab]`,
    standalone: false
})
export class ImportListLastTabDirective {
    @Input()
    public label: string;

    public templateRef = inject(TemplateRef<unknown>);
}
