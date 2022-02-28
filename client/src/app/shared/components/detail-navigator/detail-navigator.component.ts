import { Component, Input } from '@angular/core';
import { DetailNavigable, isDetailNavigable } from 'app/site/base/detail-navigable';

import { Identifiable } from '../../models/base/identifiable';

@Component({
    selector: `os-detail-navigator`,
    templateUrl: `./detail-navigator.component.html`,
    styleUrls: [`./detail-navigator.component.scss`]
})
export class DetailNavigatorComponent {
    @Input()
    public model: Identifiable | DetailNavigable;

    @Input()
    public cssClasses: string | string[] | object;

    public getRouterLink(): string {
        if (isDetailNavigable(this.model)) {
            return this.model.getDetailStateUrl();
        } else {
            return this.model.id?.toString();
        }
    }
}
