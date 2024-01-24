import { ChangeDetectorRef, Directive, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

/**
 * A wrapper component for components in the motion detail view which uses an `<action-card />`.
 * These are for example: MotionPersonalNoteComponent and MotionCommentComponent.
 */
@Directive()
export abstract class BaseMotionDetailActionCardComponent extends BaseComponent {
    @Input()
    public set motion(motion: ViewMotion) {
        if (this._motion?.id !== motion.id) {
            this.onMotionChange(motion);
        } else {
            this._motion = motion;
        }
    }

    public get motion(): ViewMotion {
        return this._motion;
    }

    public get isEditing(): boolean {
        return this._isEditing;
    }

    public formGroup: FormGroup;

    private _isEditing = false;
    private _motion!: ViewMotion;

    protected override translate = inject(TranslateService);
    protected cd = inject(ChangeDetectorRef);
    protected fb = inject(FormBuilder);
    public constructor() {
        super();
        this.formGroup = this.fb.group({ text: `` });
    }

    public async leaveEditMode(): Promise<void> {
        this._isEditing = false;
        await this.storage.remove(this.getStorageIndex());
        this.cd.markForCheck();
    }

    public enterEditMode(text: string): void {
        this.formGroup.patchValue({ text });
        this._isEditing = true;
        this.cd.markForCheck();
    }

    protected getTextFromForm(): string {
        return this.formGroup.get(`text`).value;
    }

    protected onUpdate(): void {}

    private async onMotionChange(nextMotion: ViewMotion): Promise<void> {
        await this.onBeforeMotionChange();
        this._motion = nextMotion;
        this.onUpdate();
        await this.onAfterMotionChange();
    }

    private async onBeforeMotionChange(): Promise<void> {
        if (this.motion && this.isEditing && !!this.getTextFromForm()) {
            await this.storage.set(this.getStorageIndex(), this.getTextFromForm());
            this._isEditing = false;
            this.cd.markForCheck();
        }
    }

    private async onAfterMotionChange(): Promise<void> {
        const text = await this.storage.get<string>(this.getStorageIndex());
        console.log(`onAfterMotionChange:`, this.getStorageIndex(), text);
        if (this.motion && text) {
            this.enterEditMode(text);
        }
    }

    protected abstract getStorageIndex(): string;
}
