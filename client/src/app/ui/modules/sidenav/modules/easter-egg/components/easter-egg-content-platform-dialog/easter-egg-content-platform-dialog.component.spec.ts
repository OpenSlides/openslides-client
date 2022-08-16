import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasterEggContentPlatformDialogComponent } from './easter-egg-content-platform-dialog.component';

xdescribe(`EasterEggContentPlatformDialogComponent`, () => {
    let component: EasterEggContentPlatformDialogComponent;
    let fixture: ComponentFixture<EasterEggContentPlatformDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EasterEggContentPlatformDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EasterEggContentPlatformDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
