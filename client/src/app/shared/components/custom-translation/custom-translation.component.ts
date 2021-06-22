import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

interface TranslationBox {
    original: string;
    translation: string;
}

/**
 * Custom translations as custom form component
 *
 * @example:
 * ```html
 * <os-custom-translation formControlName="value"></os-custom-translation>
 * ```
 */
@Component({
    selector: 'os-custom-translation',
    templateUrl: './custom-translation.component.html',
    styleUrls: ['./custom-translation.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomTranslationComponent),
            multi: true
        }
    ]
})
export class CustomTranslationComponent implements ControlValueAccessor, OnInit {
    /**
     * The parent form-group.
     */
    public translationForm: FormGroup;

    /**
     * Reference to the form-control within the `translationForm`.
     */
    public translationBoxes: FormArray;

    /**
     * Default constructor.
     *
     * @param formBuilder FormBuilder
     */
    public constructor(private formBuilder: FormBuilder) {}

    /**
     * Initializes the form-controls.
     */
    public ngOnInit(): void {
        this.translationForm = this.formBuilder.group({
            translationBoxes: this.formBuilder.array([])
        });

        this.translationBoxes = this.translationForm.get('translationBoxes') as FormArray;
        this.translationBoxes.valueChanges.subscribe((value: TranslationBox[]) => {
            if (this.translationBoxes.valid) {
                this.propagateChange(value.mapToObject(entry => ({ [entry.original]: entry.translation })));
            }
        });
    }

    /**
     * Helper function to determine which information to give to the parent form
     */
    private propagateChange = (_: any) => {};

    /**
     * The value from the FormControl
     *
     * @param obj the value from the parent form. Type "any" is required by the interface
     */
    public writeValue(obj: any): void {
        if (obj) {
            for (const key of Object.keys(obj)) {
                this.addNewTranslation(key, obj[key]);
            }
        }
    }

    /**
     * Hands changes back to the parent form
     *
     * @param fn the function to propagate the changes
     */
    public registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    /**
     * To satisfy the interface.
     *
     * @param fn
     */
    public registerOnTouched(fn: any): void {}

    /**
     * To satisfy the interface
     *
     * @param isDisabled
     */
    public setDisabledState?(isDisabled: boolean): void {}

    /**
     * Removes a custom translation
     *
     * @param index the translation to remove
     */
    public onRemoveTranslation(index: number): void {
        this.translationBoxes.removeAt(index);
    }

    /**
     * Function to add a new translation-field to the form-array.
     * If strings are passed, they are passed as the fields' value.
     *
     * @param original The original string to translate.
     * @param translation The translation for the given string.
     */
    public addNewTranslation(original: string = '', translation: string = ''): void {
        this.translationBoxes.push(
            this.formBuilder.group({
                original: [original, Validators.required],
                translation: [translation, Validators.required]
            })
        );
    }
}
