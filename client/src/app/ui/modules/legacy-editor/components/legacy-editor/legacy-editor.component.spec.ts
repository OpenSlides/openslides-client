import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyEditorComponent } from './legacy-editor.component';

xdescribe(`LegacyEditorComponent`, () => {
    let component: LegacyEditorComponent;
    let fixture: ComponentFixture<LegacyEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LegacyEditorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LegacyEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
