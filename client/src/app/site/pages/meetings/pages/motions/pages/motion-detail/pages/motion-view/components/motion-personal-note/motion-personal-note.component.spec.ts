import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPersonalNoteComponent } from './motion-personal-note.component';

xdescribe(`MotionPersonalNoteComponent`, () => {
    let component: MotionPersonalNoteComponent;
    let fixture: ComponentFixture<MotionPersonalNoteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPersonalNoteComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPersonalNoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
