import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class SidenavService {
    public get loweredSidebarObservable(): Observable<boolean> {
        return this.loweredSidebarSubject.asObservable();
    }

    private loweredSidebarSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor() {}

    public lowerSidebar(): void {
        this.loweredSidebarSubject.next(true);
    }

    public raiseSidebar(): void {
        this.loweredSidebarSubject.next(false);
    }
}
