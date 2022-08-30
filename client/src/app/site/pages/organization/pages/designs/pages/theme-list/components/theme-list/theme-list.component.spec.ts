import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeListComponent } from './theme-list.component';

xdescribe(`ThemeListComponent`, () => {
    let component: ThemeListComponent;
    let fixture: ComponentFixture<ThemeListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ThemeListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ThemeListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
