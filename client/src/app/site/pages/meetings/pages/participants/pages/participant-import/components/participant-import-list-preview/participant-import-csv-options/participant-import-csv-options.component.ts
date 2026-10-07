import { Component, viewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDrawer } from '@angular/material/sidenav';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
    selector: 'os-participant-import-csv-options',
    templateUrl: './participant-import-csv-options.component.html',
    styleUrl: './participant-import-csv-options.component.scss',
    imports: [MatIcon, TranslatePipe, MatRadioButton, MatRadioGroup, MatDivider, MatDrawer, FormsModule],
    encapsulation: ViewEncapsulation.None
})
export class CSVOptionsComponent {
    /**
     * The CSV-Configuration side drawer
     */
    public readonly csvConfigMenu = viewChild.required<MatDrawer>(MatDrawer);

    public selectedConfig$ = new BehaviorSubject<{ encoding: string; columnSeparator: string; textSeparator: string }>({
        encoding: 'utf-8',
        columnSeparator: '',
        textSeparator: '"'
    });

    public selectedEncoding = 'utf-8';
    public selectedColumnSeparator = '';
    public selectedTextSeparator = '"';

    public onEncodingChange(value: string): void {
        this.selectedConfig$.next({
            ...this.selectedConfig$.value,
            encoding: value
        });
    }

    public onTextSeparatorChange(value): void {
        this.selectedConfig$.next({
            ...this.selectedConfig$.value,
            textSeparator: value
        });
    }

    public onColumnSeparatorChange(value): void {
        this.selectedConfig$.next({
            ...this.selectedConfig$.value,
            columnSeparator: value
        });
    }
}
