import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { ScrollingTableManageService } from '../services';
import { ScrollingTableCellDefConfig } from './scrolling-table-cell-config';
import { ScrollingTableCellDefinition } from './scrolling-table-cell-definition';
import { ScrollingTableCellPosition } from './scrolling-table-cell-position';

@Directive({
    selector: `[osScrollingTableCell]`
})
export class ScrollingTableCellDirective implements OnInit, ScrollingTableCellDefinition {
    @Input()
    public set osScrollingTableCell(property: string) {
        this._property = property;
    }

    @Input()
    public set osScrollingTableCellConfig(config: ScrollingTableCellDefConfig) {
        this._config = config;
        this.render();
    }

    @Input()
    public set osScrollingTableCellIsHidden(isHidden: boolean) {
        this._isHidden = isHidden;
    }

    @Input()
    public set osScrollingTableCellLabel(label: string) {
        this._labelString = label;
    }

    @Input()
    public set osScrollingTableCellIsDefault(isDefault: boolean) {
        this._isDefault = isDefault;
    }

    public set labelTemplate(template: any) {
        setTimeout(() => (this._labelTemplate = template));
    }

    public get labelTemplate(): any {
        return this._labelTemplate;
    }

    public get width(): string {
        return this._width;
    }

    public get minWidth(): string {
        return this._minWidth;
    }

    public get maxWidth(): string {
        return this._maxWidth;
    }

    public get position(): ScrollingTableCellPosition {
        return this._config.position || ScrollingTableCellPosition.CENTER;
    }

    public get isHidden(): boolean {
        return this._isHidden;
    }

    public get property(): string {
        return this._property;
    }

    public get labelString(): string {
        return this._labelString;
    }

    private _labelTemplate: TemplatePortal;
    private _config: ScrollingTableCellDefConfig = {};
    private _width = ``;
    private _minWidth = ``;
    private _maxWidth = ``;
    private _isHidden = false;
    private _property = ``;
    private _labelString = ``;
    private _isDefault = false;

    public constructor(
        public readonly template: TemplateRef<any>,
        public readonly viewContainer: ViewContainerRef,
        private manageService: ScrollingTableManageService
    ) {}

    public ngOnInit(): void {
        if (this._isDefault) {
            this.manageService.appendCellDefinition(this);
        } else {
            this.manageService.updateCellDefinition(this);
        }
    }

    private render(): void {
        const { width, minWidth, maxWidth } = this._config;
        if (width) {
            this._width = this.calculateWidth(width);
        }
        this._minWidth = this.calculateWidth(minWidth) || this.width;
        this._maxWidth = this.calculateWidth(maxWidth) || this.width;
    }

    private calculateWidth(width: number | string | undefined): string {
        if (typeof width === `number` || /^[0-9]+$/g.test(width)) {
            return `${width}px`;
        } else {
            return width;
        }
    }
}
