import { CdkPortal } from '@angular/cdk/portal';
import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { ScrollingTableManageService } from '../services';

@Directive({
    selector: `[osScrollingTableNoData]`
})
export class ScrollingTableNoDataDirective extends CdkPortal implements OnInit {
    public constructor(
        template: TemplateRef<HTMLElement>,
        viewContainer: ViewContainerRef,
        private manageService: ScrollingTableManageService
    ) {
        super(template, viewContainer);
    }

    public ngOnInit(): void {
        this.manageService.noDataTemplateSubject.next(this);
    }
}
