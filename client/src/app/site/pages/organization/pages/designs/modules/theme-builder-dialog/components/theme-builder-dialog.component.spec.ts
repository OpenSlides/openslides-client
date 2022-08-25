import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeBuilderDialogComponent } from './theme-builder-dialog.component';

xdescribe(`ThemeBuilderDialogComponent`, () => {
    let component: ThemeBuilderDialogComponent;
    let fixture: ComponentFixture<ThemeBuilderDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ThemeBuilderDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ThemeBuilderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
