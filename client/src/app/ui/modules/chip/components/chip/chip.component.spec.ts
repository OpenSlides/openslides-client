import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { By } from '@angular/platform-browser';

import { ChipComponent } from './chip.component';

@Component({
    template: `
        <os-chip color="color-class">Or not to be</os-chip>
    `
})
class TestComponent {}

describe(`ChipComponent`, () => {
    let testBed: TestBed;
    let component: ChipComponent;
    let fixture: ComponentFixture<ChipComponent>;

    beforeEach(() => {
        testBed = TestBed.configureTestingModule({
            declarations: [ChipComponent, TestComponent],
            imports: [MatChipsModule]
        });
        fixture = testBed.createComponent(ChipComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should set color vars`, () => {
        component.color = `#88898A`;
        fixture.detectChanges();

        expect(component.cssClass).toBe(``);
        expect(fixture.nativeElement.style.getPropertyValue(`--os-chip-red`)).toBe(`136`);
        expect(fixture.nativeElement.style.getPropertyValue(`--os-chip-green`)).toBe(`137`);
        expect(fixture.nativeElement.style.getPropertyValue(`--os-chip-blue`)).toBe(`138`);
    });

    it(`should set color class`, () => {
        component.color = `i-am-a-class`;
        fixture.detectChanges();

        expect(component.cssClass).toBe(`i-am-a-class`);
        expect(
            fixture.debugElement.query(By.css(`.os-chip`)).nativeElement.classList.contains(`i-am-a-class`)
        ).toBeTrue();
    });

    it(`should contain content`, () => {
        const testFixture = testBed.createComponent(TestComponent);
        testFixture.detectChanges();

        const el: Element = testFixture.debugElement.query(By.css(`.os-chip`)).nativeElement;
        expect(el.textContent).toBe(`Or not to be`);
    });
});
