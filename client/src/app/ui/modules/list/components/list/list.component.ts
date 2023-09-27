import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';

import { BaseListComponent } from '../../base/base-list.component';

@Component({
    selector: `os-list`,
    templateUrl: `./list.component.html`,
    styleUrls: [`./list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent<V extends Identifiable> extends BaseListComponent<V> {
    @Input()
    public addBottomSpacer = false;
}
