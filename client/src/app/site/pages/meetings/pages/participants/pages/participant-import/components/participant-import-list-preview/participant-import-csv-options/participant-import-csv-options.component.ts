import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ViewPortService } from '@app/site/services/view-port.service';
import { SortFilterBarComponent } from '@app/ui/modules/list/components/sort-filter-bar/sort-filter-bar.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'os-participant-import-csv-options',
    templateUrl: './participant-import-csv-options.component.html',
    imports: [MatIcon, TranslatePipe, AsyncPipe],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class CSVOptions {
    protected csvConfigMenu = inject(SortFilterBarComponent).csvConfigMenu;
    protected filterMenu = inject(SortFilterBarComponent).filterMenu;
    protected csvReload = true;
    protected csvConfiguration = true;
    public vp = inject(ViewPortService);
}
