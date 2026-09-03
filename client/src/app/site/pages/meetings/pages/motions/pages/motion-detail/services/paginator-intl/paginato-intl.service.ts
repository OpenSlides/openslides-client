import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable({
    providedIn: `root`
})
export class CustomPaginatorIntl extends MatPaginatorIntl {
    public override getRangeLabel = (page: number, pageSize: number, length: number): string => {
        return `${page + 1} of ${length}`;
    };
}
