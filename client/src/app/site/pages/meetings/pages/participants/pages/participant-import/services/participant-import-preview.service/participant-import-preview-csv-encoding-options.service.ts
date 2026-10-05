import { TemplatePortal } from '@angular/cdk/portal';
import { Service } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Service()
export class CSVOptionsService {
    private readonly csvReload = new Subject<Event>();
    public readonly openFileInput$ = new Observable(file => this.csvReload.subscribe(file));
    public reload(event: Event): void {
        this.csvReload.next(event);
    }

    public toggleCSVOptions = false;
    private _csvOptions: TemplatePortal = null;

    public get csvOptions(): TemplatePortal<any> | null {
        return this._csvOptions;
    }

    public set csvOptions(portal: TemplatePortal | null) {
        this._csvOptions = portal;
    }

    /**
     *  This coordinates the sidenav's opening and closing to avoid overlapping when one is opened while the other is already open
     */
    private sideNav = new Subject<'filterMenu' | 'csvConfigMenu' | null>();
    public drawer$ = new Observable<'filterMenu' | 'csvConfigMenu' | null>(drawer => this.sideNav.subscribe(drawer));
    public open(drawer: 'filterMenu' | 'csvConfigMenu'): void {
        this.sideNav.next(drawer);
    }

    public selectedConfig$ = new BehaviorSubject<{ encoding: string; columnSeparator: string; textSeparator: string }>({
        encoding: 'utf-8',
        columnSeparator: '',
        textSeparator: '"'
    });
}
