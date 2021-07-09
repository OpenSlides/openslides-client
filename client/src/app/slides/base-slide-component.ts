import { Directive, Input } from '@angular/core';

import { SlideData } from 'app/core/ui-services/projector.service';
import { ViewProjector } from 'app/site/projector/models/view-projector';

/**
 * Every slide has to extends this base class. It forces the slides
 * to have an input for the slidedata.
 */
@Directive()
export abstract class BaseSlideComponent<T extends object> {
    /**
     * Each slide must take slide data.
     */
    @Input()
    public set data(value: SlideData<T>) {
        this.setData(value);
    }

    public get data(): SlideData<T> {
        return this._data;
    }

    private _data: SlideData<T>;

    /**
     * The projector where this slide is projected on.
     */
    @Input()
    public projector: ViewProjector;

    public constructor() {}

    protected setData(value: SlideData<T>): void {
        this._data = value;
    }
}
