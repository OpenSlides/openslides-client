import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionEditorComponent } from './motion-editor.component';

xdescribe(`MotionEditor`, () => {
    let component: MotionEditorComponent;
    let fixture: ComponentFixture<MotionEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionEditorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
