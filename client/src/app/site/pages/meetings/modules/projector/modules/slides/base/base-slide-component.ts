import { Directive, Input } from '@angular/core';
import { SlideData } from '../../../../../pages/projectors/definitions';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';

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

    protected get slideData(): T {
        return this._data.data;
    }

    private _data!: SlideData<T>;

    /**
     * The projector where this slide is projected on.
     */
    @Input()
    public projector!: ViewProjector;

    protected setData(value: SlideData<T>): void {
        this._data = value;
    }
}
