import { Component, Input } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { DetailNavigable, isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';

@Component({
    selector: `os-detail-view-navigator`,
    templateUrl: `./detail-view-navigator.component.html`,
    styleUrls: [`./detail-view-navigator.component.scss`]
})
export class DetailViewNavigatorComponent {
    @Input()
    public model!: Identifiable | DetailNavigable;

    @Input()
    public cssClasses: string | string[] | object = [];

    public getRouterLink(): string {
        if (isDetailNavigable(this.model)) {
            return this.model.getDetailStateUrl();
        } else {
            return this.model.id?.toString();
        }
    }
}
