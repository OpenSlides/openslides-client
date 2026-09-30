import { TemplatePortal } from '@angular/cdk/portal';
import { AsyncPipe } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    OnInit,
    TemplateRef,
    viewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDrawer } from '@angular/material/sidenav';
import { ViewPortService } from '@app/site/services/view-port.service';
import { TranslatePipe } from '@ngx-translate/core';

import { CSVOptionsService } from '../../../services/participant-import-preview.service/participant-import-preview-csv-encoding-options.service';

@Component({
    selector: 'os-participant-import-csv-options',
    templateUrl: './participant-import-csv-options.component.html',
    styleUrl: './participant-import-csv-options.component.scss',
    imports: [
        MatIcon,
        TranslatePipe,
        AsyncPipe,
        MatButton,
        MatRadioButton,
        MatRadioGroup,
        MatDivider,
        MatDrawer,
        FormsModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class CSVOptionsComponent implements OnInit, AfterViewInit {
    public vp = inject(ViewPortService);
    private csvOptionsService = inject(CSVOptionsService);
    public enabled: boolean = this.csvOptionsService.toggleCSVOptions;
    public _viewContainerRef = inject(ViewContainerRef);

    /**
     * The CSV-Configuration side drawer
     */
    public csvConfigMenu = viewChild.required<MatDrawer>(MatDrawer);

    public selectedEncoding = 'utf-8';
    public selectedColumnSeparator = '';
    public selectedTextSeparator = '"';

    public reloadFileInput = viewChild.required<ElementRef<HTMLInputElement>>(`reloadFileInput`);
    public csvOptionsTemplate = viewChild.required<TemplateRef<unknown>>(`CSVOptions`);

    // csvReload
    public selectNewFile(event: Event): void {
        this.csvOptionsService.reload(event);
    }

    public ngOnInit(): void {
        this.csvOptionsService.drawer$.subscribe(drawer => {
            if (drawer === 'filterMenu' && this.csvConfigMenu().opened) {
                this.csvConfigMenu().close();
            }
        });
    }

    public ngAfterViewInit(): void {
        this.csvOptionsService.csvOptions = new TemplatePortal(this.csvOptionsTemplate(), this._viewContainerRef);
    }

    public openCsvConfig(): void {
        if (this.csvConfigMenu().opened) {
            this.csvOptionsService.open('filterMenu');
            this.csvConfigMenu().close();
            return;
        } else {
            this.csvOptionsService.open('csvConfigMenu');
            this.csvConfigMenu().open();
        }
    }

    public onEncodingChange(value: string): void {
        this.csvOptionsService.SelectedConfig$.next({
            ...this.csvOptionsService.SelectedConfig$.value,
            encoding: value
        });
    }

    public onTextSeparatorChange(value): void {
        this.csvOptionsService.SelectedConfig$.next({
            ...this.csvOptionsService.SelectedConfig$.value,
            textSeparator: value
        });
    }

    public onColumnSeparatorChange(value): void {
        this.csvOptionsService.SelectedConfig$.next({
            ...this.csvOptionsService.SelectedConfig$.value,
            columnSeparator: value
        });
    }
}
