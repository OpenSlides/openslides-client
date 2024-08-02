import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerationNoteComponent } from './moderation-note.component';

xdescribe(`ModerationNoteComponent`, () => {
    let component: ModerationNoteComponent;
    let fixture: ComponentFixture<ModerationNoteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModerationNoteComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModerationNoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
