import { Component, ContentChild, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { HtmlColor } from 'app/core/definitions/key-types';
import { HasColor } from 'app/shared/models/base/has-color';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: `os-chip-list`,
    templateUrl: `./chip-list.component.html`,
    styleUrls: [`./chip-list.component.scss`]
})
export class ChipListComponent implements OnInit, OnDestroy {
    /**
     * Reference to the template content.
     */
    @ContentChild(TemplateRef, { static: true })
    public templateRef: TemplateRef<any>;

    /**
     * A reference to a model containing an htmlcolor or a string as htmlcolor or a css-class.
     * This can also be a list of them or an observable with one or a list of them.
     * Everything is mapped to the interface `HasColor`.
     */
    @Input()
    public model:
        | HtmlColor
        | HasColor
        | (HtmlColor | HasColor)[]
        | Observable<HtmlColor | HasColor | (HasColor | HtmlColor)[]>;

    public get models(): HasColor[] {
        return this._models;
    }

    private subscription: Subscription | null = null;
    private _models: HasColor[] = [];

    public constructor() {}

    public ngOnInit(): void {
        if (this.model instanceof Observable) {
            this.initSubscription();
        } else {
            this.initModels(this.model);
        }
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    private initSubscription(): void {
        this.subscription = (this.model as Observable<HasColor | HtmlColor | (HtmlColor | HasColor)[]>).subscribe(
            models => this.initModels(models)
        );
    }

    private initModels(models: HtmlColor | HasColor | (HtmlColor | HasColor)[]): void {
        let nextModels: (HtmlColor | HasColor)[] = [];
        if (Array.isArray(models)) {
            nextModels = models;
        } else {
            nextModels = [models];
        }
        if (typeof nextModels[0] === `string`) {
            this._models = (nextModels as HtmlColor[]).map(model => ({ color: model }));
        } else {
            this._models = nextModels as HasColor[];
        }
    }
}
