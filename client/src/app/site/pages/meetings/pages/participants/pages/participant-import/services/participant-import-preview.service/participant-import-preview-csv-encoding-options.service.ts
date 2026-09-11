import { Service } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Service()
export class CSVEncodingOptionsService {
    public toggleCSVOptions = false;
    /**
     *  This coordinates the sidenav's opening and closing to avoid overlapping when one is opened while the other is already open
     */
    private sideNav = new Subject<'filterMenu' | 'csvConfigMenu' | null>();
    public drawer$ = new Observable<'filterMenu' | 'csvConfigMenu' | null>(drawer => this.sideNav.subscribe(drawer));
    public open(drawer: 'filterMenu' | 'csvConfigMenu'): void {
        this.sideNav.next(drawer);
    }

    public SelectedConfig$ = new BehaviorSubject<{ encoding: string; columnSeparator: string; textSeparator: string }>({
        encoding: 'utf-8',
        columnSeparator: '',
        textSeparator: '"'
    });
}
