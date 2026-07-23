import { CdkPortal } from '@angular/cdk/portal';
import { Directive, inject, OnInit } from '@angular/core';

import { ScrollingTableManageService } from '../services';

@Directive({
    selector: `[osScrollingTableNoData]`,
    standalone: false
})
export class ScrollingTableNoDataDirective extends CdkPortal implements OnInit {
    private manageService = inject(ScrollingTableManageService);

    public ngOnInit(): void {
        this.manageService.noDataTemplateSubject.next(this);
    }
}
