import { Component, Input } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { DetailNavigable, isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';

@Component({
    selector: `os-detail-view-navigator`,
    templateUrl: `./detail-view-navigator.component.html`,
    styleUrls: [`./detail-view-navigator.component.scss`],
    standalone: false
})
export class DetailViewNavigatorComponent {
    @Input()
    public model!: Identifiable | DetailNavigable;

    @Input()
    public cssClasses: string | string[] | object = [];

    public getRouterLink(): string {
        if (isDetailNavigable(this.model)) {
            return this.model.getDetailStateUrl();
        } else if (this.model) {
            return this.model.id?.toString();
        } else {
            return ``; // If a model gets destroyed, while this function is invoked, it must returned an empty string
        }
    }
}
