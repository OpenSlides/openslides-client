import { TemplatePortal } from '@angular/cdk/portal';
import {
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    Input,
    Output,
    QueryList,
    TemplateRef
} from '@angular/core';
import { MatTab } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ComponentServiceCollector } from '../../../core/ui-services/component-service-collector';
import { ViewportService } from '../../../core/ui-services/viewport.service';
import { BaseComponent } from '../../../site/base/components/base.component';
import { VerticalTabGroupLabelHeaderDirective } from './vertical-tab-group-label-header.directive';

export enum VerticalTabGroupContentState {
    OPENED = `opened`,
    CLOSED = `closed`
}

@Component({
    selector: `os-vertical-tab-group`,
    templateUrl: `./vertical-tab-group.component.html`,
    styleUrls: [`./vertical-tab-group.component.scss`]
})
export class VerticalTabGroupComponent extends BaseComponent {
    @ContentChildren(MatTab, { descendants: true, emitDistinctChangesOnly: true })
    public set tabs(tabs: QueryList<MatTab>) {
        if (this._currentTabLength !== tabs.length) {
            this._tabs = tabs;
            this._tabLabelsSubject.next(tabs.map(tab => tab.templateLabel));
            this.changeTabSelection(0);
            this.doUpdateCurrentContent(0);
            this._currentTabLength = tabs.length;
        }
    }

    public get tabs(): QueryList<MatTab> {
        return this._tabs;
    }

    @ContentChild(VerticalTabGroupLabelHeaderDirective, { read: TemplateRef })
    public labelHeaderTemplate: TemplateRef<unknown>;

    @Input()
    public set labelHeight(height: number | string) {
        if (typeof height === `string`) {
            this._labelHeight = height;
        } else {
            this._labelHeight = `${height}px`;
        }
    }

    public get labelHeight(): string {
        return this._labelHeight;
    }

    @Input()
    public showAlwaysContentHeader = false;

    @Output()
    public contentStateChanged = new EventEmitter<VerticalTabGroupContentState>();

    public get tabLabelsObservable(): Observable<TemplatePortal[]> {
        return this._tabLabelsSubject.asObservable();
    }

    public get selectedPortalObservable(): Observable<TemplatePortal> {
        return this._selectedPortalSubject;
    }

    public get selectedTabLabelIndex(): number | null {
        return this._selectedTabLabelIndexSubject.value;
    }

    public get isMobile(): boolean {
        return this._isMobile;
    }

    public isContentOpen = false;

    private _selectedTabLabelIndexSubject = new BehaviorSubject<number>(null);
    private _selectedPortalSubject = new BehaviorSubject<TemplatePortal>(null);
    private _tabLabelsSubject = new BehaviorSubject<TemplatePortal[]>([]);
    private _labelHeight = `30px`;
    private _tabs: QueryList<MatTab>;
    private _currentTabLength = 0;
    private _isMobile = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        vp: ViewportService
    ) {
        super(componentServiceCollector, translate);
        vp.isMobileSubject.subscribe(isMobile => (this._isMobile = isMobile));
    }

    public changeTabSelection(index: number) {
        if (this.selectedTabLabelIndex !== index) {
            this.doUpdateCurrentContent(index);
        }
    }

    public getTabLabelTemplate(index: number): TemplatePortal {
        return this.tabs.get(index).templateLabel;
    }

    public getVirtualScrollViewportHeight(): string {
        let viewportHeight = `100%`;
        if (this.labelHeaderTemplate) {
            viewportHeight = `calc(100% - ${this.labelHeight})`;
        }
        return viewportHeight;
    }

    public openContent(): void {
        this.isContentOpen = true;
        this.contentStateChanged.emit(VerticalTabGroupContentState.OPENED);
    }

    public closeContent(): void {
        this.isContentOpen = false;
        this.contentStateChanged.emit(VerticalTabGroupContentState.CLOSED);
    }

    private doUpdateCurrentContent(index: number): void {
        this._selectedTabLabelIndexSubject.next(index);
        this._selectedPortalSubject.next(this.tabs.get(index).content);
    }
}
