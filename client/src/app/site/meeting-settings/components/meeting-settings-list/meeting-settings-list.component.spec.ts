import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTranslationComponent } from '../custom-translation/custom-translation.component';
import { E2EImportsModule } from '../../../../../e2e-imports.module';
import { MeetingSettingsFieldComponent } from '../meeting-settings-field/meeting-settings-field.component';
import { MeetingSettingsListComponent } from './meeting-settings-list.component';

describe('SettingsListComponent', () => {
    let component: MeetingSettingsListComponent;
    let fixture: ComponentFixture<MeetingSettingsListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [MeetingSettingsListComponent, MeetingSettingsFieldComponent, CustomTranslationComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
