import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionEditor } from './editor-limited.component';

xdescribe(`EditorComponent`, () => {
    let component: MotionEditor;
    let fixture: ComponentFixture<MotionEditor>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionEditor]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionEditor);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
