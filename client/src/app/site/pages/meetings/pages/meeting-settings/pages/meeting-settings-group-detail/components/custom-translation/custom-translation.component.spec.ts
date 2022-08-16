import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTranslationComponent } from './custom-translation.component';

xdescribe(`CustomTranslationComponent`, () => {
    let component: CustomTranslationComponent;
    let fixture: ComponentFixture<CustomTranslationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CustomTranslationComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomTranslationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
