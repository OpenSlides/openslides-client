import { Service } from '@angular/core';
import { Subject } from 'rxjs';

@Service()
export class sideNavCoordinationService {
    private sideNav = new Subject<'filterMenu' | 'csvConfigMenu' | null>();

    public drawer$ = this.sideNav.asObservable();

    public open(drawer: 'filterMenu' | 'csvConfigMenu'): void {
        this.sideNav.next(drawer);
    }
}
