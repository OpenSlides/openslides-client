import { Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Service()
export class sideNavCoordinationService {
    private sideNav = new Subject<'filterMenu' | 'csvConfigMenu' | null>();

    public drawer$ = new Observable<'filterMenu' | 'csvConfigMenu' | null>(drawer => this.sideNav.subscribe(drawer));

    public open(drawer: 'filterMenu' | 'csvConfigMenu'): void {
        this.sideNav.next(drawer);
    }
}
