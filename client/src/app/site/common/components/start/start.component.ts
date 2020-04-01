import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { OperatorService } from 'app/core/core-services/operator.service';
import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionStateRepositoryService } from 'app/core/repositories/motions/motion-state-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Interface describes the keys for the fields at start-component.
 */
interface IStartContent {
    general_event_welcome_title: string;
    general_event_welcome_text: string;
}

/**
 * The start component. Greeting page for OpenSlides
 */
@Component({
    selector: 'os-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent extends BaseComponent implements OnInit {
    /**
     * Whether the user is editing the content.
     */
    public isEditing = false;

    /**
     * Formular for the content.
     */
    public startForm: FormGroup;

    /**
     * Holding the values for the content.
     */
    public startContent: IStartContent = {
        general_event_welcome_title: '',
        general_event_welcome_text: ''
    };

    /**
     * Constructor of the StartComponent
     *
     * @param titleService the title serve
     * @param translate to translation module
     * @param organisationSettingsService read out config values
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private organisationSettingsService: OrganisationSettingsService,
        private formBuilder: FormBuilder,
        private operator: OperatorService,

        // For testing
        private meetingRepo: MeetingRepositoryService,
        private motionRepo: MotionRepositoryService,
        private stateRepo: MotionStateRepositoryService,
        private userRepo: UserRepositoryService
    ) {
        super(componentServiceCollector);
        this.startForm = this.formBuilder.group({
            general_event_welcome_title: ['', Validators.required],
            general_event_welcome_text: ''
        });
    }

    /**
     * Init the component.
     *
     * Sets the welcomeTitle and welcomeText.
     */
    public ngOnInit(): void {
        super.setTitle('Home');

        // set the welcome title
        this.organisationSettingsService
            .get<string>('general_event_welcome_title')
            .subscribe(welcomeTitle => (this.startContent.general_event_welcome_title = welcomeTitle));

        // set the welcome text
        this.organisationSettingsService.get<string>('general_event_welcome_text').subscribe(welcomeText => {
            this.startContent.general_event_welcome_text = this.translate.instant(welcomeText);
        });
    }

    /**
     * Changes to editing mode.
     */
    public editStartPage(): void {
        Object.keys(this.startForm.controls).forEach(control => {
            this.startForm.patchValue({ [control]: this.startContent[control] });
        });
        this.isEditing = true;
    }

    /**
     * Saves changes and updates the content.
     */
    public saveChanges(): void {
        /*this.configRepo
            .bulkUpdate(
                Object.keys(this.startForm.controls).map(control => ({
                    key: control,
                    value: this.startForm.value[control]
                }))
            )
            .then(() => (this.isEditing = !this.isEditing), this.raiseError);*/
        throw new Error('TODO');
    }

    /**
     * Returns, if the current user has the necessary permissions.
     */
    public canManage(): boolean {
        return this.operator.hasPerms('core.can_manage_config');
    }

    public test(): void {
        console.clear();

        console.log('test M20 (I)');
        // the any is just to silence the typing system: There relations should work, but
        // they are not typed yet (typescript doesn't know about them yet)
        const motion1: any = this.motionRepo.getViewModel(1);
        console.log(motion1, motion1.category, motion1.category.motions);
        // Note the order of the motions: they should be ordered by category_weight.
        motion1.category.motions.forEach(m => console.log(m.title, m.id, m.category_weight));

        console.log('\ntest M2O (II)');
        console.log(motion1.category.name, motion1.category.parent.name, motion1.category.parent.children[0].name);

        console.log('\ntest M2M');
        const state1 = this.stateRepo.getViewModel(1);
        console.log(state1.name);
        console.log(state1.next_states.map(s => s.name));
        console.log(state1.next_states.map(s => s.previous_states[0].name));

        console.log('\ntest generic M2M');
        const motion2: any = this.motionRepo.getViewModel(2);
        console.log(
            motion2.tags.map(t => t.name),
            motion2.tags.map(t => t.tagged)
        );

        console.log('\ntest generic O2O');
        console.log(motion1.agenda_item, motion1.agenda_item.id);
        console.log(motion1.title, motion1.agenda_item.content_object.title);

        console.log('\ntest structured M2M (I)');
        const user3: any = this.userRepo.getViewModel(3);
        console.log(user3.groups(), user3.groups(2));

        console.log('\ntest structured M2M (II)');
        const user1: any = this.userRepo.getViewModel(1);
        console.log(
            user1.groups().map(g => g.name),
            user1.groups(1).map(g => g.name)
        );
        console.log(user1.groups()[0].users.map(u => u.username));

        console.log('\ntest structured O2O');
        const meeting1: any = this.meetingRepo.getViewModel(1);
        console.log(meeting1.logo_$);
        const key = meeting1.logo_$[0];
        console.log(meeting1.logo(key).title, meeting1.logo(key).used_as_logo_in_meeting(key).name);
    }
}
