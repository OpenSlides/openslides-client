import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerButtonComponent } from './speaker-button.component';

xdescribe(`SpeakerButtonComponent`, () => {
    let component: SpeakerButtonComponent;
    let fixture: ComponentFixture<SpeakerButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SpeakerButtonComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SpeakerButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
