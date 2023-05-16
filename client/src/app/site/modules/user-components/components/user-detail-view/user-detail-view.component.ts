import {
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { GENDERS } from '../../../../../domain/models/users/user';
import { ViewUser } from '../../../../../site/pages/meetings/view-models/view-user';
import { OneOfValidator } from '../../validators';

@Component({
    selector: `os-user-detail-view`,
    templateUrl: `./user-detail-view.component.html`,
    styleUrls: [`./user-detail-view.component.scss`]
})
export class UserDetailViewComponent extends BaseUiComponent implements OnInit, AfterViewInit {
    /**
     * Reference to the edit template content.
     */
    @ContentChild(`editView`, { read: TemplateRef, static: true })
    public editView: TemplateRef<any> | null = null;

    /**
     * Reference to the show template content.
     */
    @ContentChildren(`showView`, { read: TemplateRef })
    public showView: QueryList<TemplateRef<any> | null> = null;

    @Input()
    public set user(user: ViewUser | null) {
        const oldUser = this._user;
        this._user = user;
        if (!oldUser) {
            this.prepareForm();
        }
    }

    public get user(): ViewUser | null {
        return this._user;
    }

    @Input()
    public isNewUser = false;

    @Input()
    public set isEditing(is: boolean) {
        this._isEditing = is;
        if (is) {
            this.enterEditMode();
        }
    }

    public get isEditing(): boolean {
        return this._isEditing;
    }

    @Input()
    public useMatcard = true;

    @Input()
    public set additionalFormControls(controls: any) {
        this._additionalFormControls = controls;
        this.prepareForm();
    }

    @Input()
    public set additionalValidators(validators: ValidatorFn | ValidatorFn[]) {
        if (!Array.isArray(validators)) {
            validators = [validators];
        }
        this._additionalValidators = validators;
        this.prepareForm();
    }

    @Input()
    public patchFormValueFn: (controlName: string, user?: ViewUser) => any | null = () => {};

    @Input()
    public isAllowedFn: (permission: string) => boolean = () => true;

    @Input()
    public generatePasswordFn: (() => string) | null | undefined;

    @Input()
    public shouldEnableFormControlFn: (controlName: string) => boolean = () => true;

    @Output()
    public changeEvent = new EventEmitter();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    @Output()
    public errorEvent = new EventEmitter<{ [name: string]: boolean } | null>();

    @Output()
    public submitEvent = new EventEmitter<void>();

    public personalInfoForm!: UntypedFormGroup;

    public genders = GENDERS;

    public get isSelf(): boolean {
        return this.operator.operatorId === this._user?.id;
    }

    private set _initialState(state: any | null) {
        this._initialStateString = JSON.stringify(state);
    }

    private get _initialState(): string | null {
        return this._initialStateString;
    }

    private _isEditing = false;
    private _hasChanges = false;
    private _initialStateString: string | null = null;

    private _user: ViewUser | null = null;
    private _additionalValidators: ValidatorFn[] = [];
    private _additionalFormControls: any = {};
    private _formValueChangeSubscription: Subscription | null = null;

    private _checkIfDeletedProperties = [`pronoun`, `default_password`];

    public constructor(private fb: UntypedFormBuilder, private operator: OperatorService) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.operator.operatorUpdated.subscribe(() =>
                this.updateFormControlsAccessibility(this.shouldEnableFormControlFn)
            )
        );
    }

    public ngAfterViewInit(): void {
        this.updateFormControlsAccessibility(this.shouldEnableFormControlFn);
    }

    public isAllowed(permission: string): boolean {
        return this.isAllowedFn(permission);
    }

    public setRandomPassword(): void {
        if (this.generatePasswordFn) {
            this.personalInfoForm.patchValue({
                default_password: this.generatePasswordFn()
            });
        }
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.submitEvent.emit();
        }
    }

    public markAsPristine(): void {
        this._initialState = this.personalInfoForm.value;
        this._hasChanges = false;
    }

    private enterEditMode(): void {
        this.prepareForm();
        this.updateFormControlsAccessibility(this.shouldEnableFormControlFn);
        if (this.user) {
            this.patchFormValues();
        }
    }

    private prepareForm(): void {
        this.createForm();
        this.patchFormValues();
        this.preparePropagation();
    }

    private preparePropagation(): void {
        if (this._formValueChangeSubscription) {
            this._formValueChangeSubscription.unsubscribe();
            this._formValueChangeSubscription = null;
        }
        this._formValueChangeSubscription = this.personalInfoForm.valueChanges.subscribe(nextValue => {
            this._hasChanges = JSON.stringify(nextValue) !== this._initialState;
            this.propagateValues();
        });
        this.propagateValues();
    }

    /**
     * Updates the formcontrols of the `personalInfoForm` with the values from a given user.
     */
    private patchFormValues(): void {
        if (!this.user) {
            return;
        }
        const personalInfoPatch: any = {};
        Object.keys(this.personalInfoForm.controls).forEach(ctrl => {
            personalInfoPatch[ctrl] = this.getFormValuePatch(ctrl as keyof ViewUser);
        });
        const isActiveExists = typeof this.user?.is_active === `boolean`;
        const isPersonExists = typeof this.user?.is_physical_person === `boolean`;
        this.personalInfoForm.patchValue(
            {
                ...personalInfoPatch,
                ...(isActiveExists ? {} : { is_active: true }),
                ...(isPersonExists ? {} : { is_physical_person: true })
            },
            { emitEvent: false }
        );
        this._initialState = personalInfoPatch;
    }

    private getFormValuePatch(controlName: keyof ViewUser): any {
        let patchValue = this.patchFormValueFn(controlName, this.user!);
        if (!patchValue) {
            const userValue = this.user![controlName] as Function | string;
            patchValue = typeof userValue === `function` ? userValue.call(this.user) : userValue;
        }
        return patchValue;
    }

    /**
     * Makes the form editable
     */
    private updateFormControlsAccessibility(fn: (controlName: string) => boolean): void {
        const formControlNames = Object.keys(this.personalInfoForm.controls);

        // Enable all controls.
        formControlNames.forEach(formControlName => {
            this.personalInfoForm.get(formControlName)!.enable();
        });

        // Disable not permitted controls
        formControlNames.forEach(formControlName => {
            if (!fn(formControlName)) {
                this.personalInfoForm.get(formControlName)!.disable();
            }
        });
    }

    /**
     * initialize the form with default values
     */
    private createForm(): void {
        this.personalInfoForm = this.fb.group(
            {
                username: [``, this.isNewUser ? [] : [Validators.required]],
                tech_id: [``],
                member_id: [``],
                pronoun: [``],
                title: [``],
                first_name: [``],
                last_name: [``],
                gender: [``],
                email: [``],
                last_email_send: [``],
                default_password: [``],
                is_active: [true],
                is_physical_person: [true],
                ...this._additionalFormControls
            },
            {
                validators: [
                    OneOfValidator.validation([`username`, `first_name`, `last_name`], `name`),
                    ...this._additionalValidators
                ]
            }
        );
    }

    private propagateValues(): void {
        setTimeout(() => {
            // setTimeout prevents 'ExpressionChangedAfterItHasBeenChecked'-error
            this.changeEvent.emit(this.getChangedValues(this.personalInfoForm.value));
            this.validEvent.emit(this.personalInfoForm.valid && (this.isNewUser || this._hasChanges));
            this.errorEvent.emit(this.personalInfoForm.errors);
        });
    }

    private getChangedValues(data: { [key: string]: any }): { [key: string]: any } {
        const newData = {};
        if (this.user) {
            Object.keys(data).forEach(key => {
                newData[key] =
                    this._checkIfDeletedProperties.includes(key) && !data[key] && !!this.user[key] ? null : data[key];
            });
            return newData;
        }
        return data;
    }
}
