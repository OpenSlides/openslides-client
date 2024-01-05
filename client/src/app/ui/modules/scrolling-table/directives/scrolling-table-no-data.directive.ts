import { CdkPortal } from '@angular/cdk/portal';
import { Directive, inject, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { ScrollingTableManageService } from '../services';

@Directive({
    selector: `[osScrollingTableNoData]`
})
export class ScrollingTableNoDataDirective extends CdkPortal implements OnInit {
    private manageService = inject(ScrollingTableManageService);

    public constructor(template: TemplateRef<HTMLElement>, viewContainer: ViewContainerRef) {
        super(template, viewContainer);
    }

    public ngOnInit(): void {
        this.manageService.noDataTemplateSubject.next(this);
    }
}
