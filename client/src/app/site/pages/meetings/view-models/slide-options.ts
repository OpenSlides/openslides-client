interface BaseSlideOption {
    key: string;
    displayName: string;
}

export interface SlideDecisionOption extends BaseSlideOption {
    default: boolean;
}

export interface SlideChoiceOption extends BaseSlideOption {
    default: string | boolean;
    choices: { value: string | boolean; displayName: string }[];
}

export type SlideOption = SlideDecisionOption | SlideChoiceOption;
export type SlideOptions = SlideOption[];

export function isSlideDecisionOption(object: any): object is SlideDecisionOption {
    const option = object as SlideDecisionOption;
    return (
        option.key !== undefined &&
        option.displayName !== undefined &&
        option.default !== undefined &&
        (object as SlideChoiceOption).choices === undefined
    );
}

export function isSlideChoiceOption(object: any): object is SlideChoiceOption {
    const option = object as SlideChoiceOption;
    return (
        option.key !== undefined &&
        option.displayName !== undefined &&
        option.default !== undefined &&
        option.choices !== undefined
    );
}
