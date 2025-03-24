import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';

import { BaseListComponent } from '../../base/base-list.component';

@Component({
    selector: `os-list`,
    templateUrl: `./list.component.html`,
    styleUrls: [`./list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ListComponent<V extends Identifiable> extends BaseListComponent<V> {
    @Input()
    public addBottomSpacer = false;

    /**
     * Will show fake filter buttons with the string keys as content in bar.
     * Closing them will cause the callback function to be called.
     */
    @Input()
    public fakeFilters: Observable<{ [key: string]: () => void }> = null;

    @Input()
    public totalCount: number | Observable<number>;
}
