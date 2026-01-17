import { BaseViewModel, ViewModelConstructor } from '../../../site/base/base-view-model';

type _ViewModelConstructor = ViewModelConstructor<BaseViewModel>;

export interface Relation<Own = any> {
    ownViewModels: _ViewModelConstructor[]; // the default-case is exactly one entry for non-generic relations
    foreignViewModel?: _ViewModelConstructor; // given on generic=false
    foreignViewModelPossibilities?: _ViewModelConstructor[]; // given on generic=true
    ownField: keyof Own;
    ownIdField?: keyof Own;
    many: boolean;
    generic: boolean;
    order?: string; // may be given on many=true. if not given on many=true, the models are sorted by id.
    isFullList?: boolean; // if this relation requests a full-list of view-models in a specific repo.
    isExclusiveList?: boolean; // if the relation request only contains view-models that are not referenced by other top level view-models
}

export function makeO2O<A extends BaseViewModel, B extends BaseViewModel>(args: {
    AViewModel: ViewModelConstructor<A>;
    BViewModel: ViewModelConstructor<B>;
    AField: keyof A & string;
    BField: keyof B & string;
    AIdField?: keyof A & string;
    BIdField?: keyof B & string;
}): Relation[] {
    return [
        // A -> B
        {
            ownViewModels: [args.AViewModel],
            foreignViewModel: args.BViewModel,
            ownField: args.AField,
            ownIdField: args.AIdField,
            many: false,
            generic: false
        },
        // B -> A
        {
            ownViewModels: [args.BViewModel],
            foreignViewModel: args.AViewModel,
            ownField: args.BField,
            ownIdField: args.BIdField,
            many: false,
            generic: false
        }
    ];
}

export function makeM2O<O extends BaseViewModel, M extends BaseViewModel>(args: {
    OViewModel: ViewModelConstructor<O>;
    MViewModel: ViewModelConstructor<M>;
    OField: keyof O & string;
    MField: keyof M & string;
    OIdField?: keyof O & string;
    MIdField?: keyof M & string;
    order?: keyof M & string;
    isFullList?: boolean;
    isExclusiveList?: boolean;
}): Relation[] {
    return [
        // M -> O
        {
            ownViewModels: [args.MViewModel],
            foreignViewModel: args.OViewModel,
            ownField: args.MField,
            ownIdField: args.MIdField,
            many: false,
            generic: false
        },
        // O -> M
        {
            ownViewModels: [args.OViewModel],
            foreignViewModel: args.MViewModel,
            ownField: args.OField,
            ownIdField: args.OIdField,
            many: true,
            generic: false,
            order: args.order,
            isFullList: args.isFullList,
            isExclusiveList: args.isExclusiveList
        }
    ];
}

export function makeM2M<A extends BaseViewModel, B extends BaseViewModel>(args: {
    AViewModel: ViewModelConstructor<A>;
    BViewModel: ViewModelConstructor<B>;
    AField: keyof A & string;
    BField: keyof B & string;
    AIdField?: keyof A & string;
    BIdField?: keyof B & string;
    AOrder?: keyof A & string;
    BOrder?: keyof B & string;
    AisFullList?: boolean;
    BisFullList?: boolean;
}): Relation[] {
    return [
        // A -> B
        {
            ownViewModels: [args.AViewModel],
            foreignViewModel: args.BViewModel,
            ownField: args.AField,
            ownIdField: args.AIdField,
            many: true,
            generic: false,
            order: args.BOrder,
            isFullList: args.BisFullList
        },
        // B -> A
        {
            ownViewModels: [args.BViewModel],
            foreignViewModel: args.AViewModel,
            ownField: args.BField,
            ownIdField: args.BIdField,
            many: true,
            generic: false,
            order: args.AOrder,
            isFullList: args.AisFullList
        }
    ];
}

export function makeGenericO2O<V extends BaseViewModel, I>(args: {
    viewModel: ViewModelConstructor<V>;
    possibleViewModels: ViewModelConstructor<BaseViewModel & I>[];
    viewModelField: keyof V & string;
    possibleViewModelsField: keyof I & string;
    viewModelIdField?: keyof V & string;
    possibleViewModelsIdField?: keyof I & string;
}): Relation[] {
    return [
        // viewModel -> possible view models
        {
            ownViewModels: [args.viewModel],
            foreignViewModelPossibilities: args.possibleViewModels,
            ownField: args.viewModelField,
            ownIdField: args.viewModelIdField,
            many: false,
            generic: true
        },
        // possible view models -> viewModel
        {
            ownViewModels: args.possibleViewModels,
            foreignViewModel: args.viewModel,
            ownField: args.possibleViewModelsField,
            ownIdField: args.possibleViewModelsIdField,
            many: false,
            generic: false
        }
    ];
}

export function makeGenericO2M<V extends BaseViewModel>(args: {
    OViewModel: ViewModelConstructor<V>;
    MPossibleViewModels: ViewModelConstructor<BaseViewModel>[];
    OViewModelField: keyof V & string;
    MPossibleViewModelsField: string;
    OViewModelIdField?: keyof V & string;
    MPossibleViewModelsIdField?: string;
    OViewModelOrder?: string;
}): Relation[] {
    return [
        // viewModel -> possible view models
        {
            ownViewModels: [args.OViewModel],
            foreignViewModelPossibilities: args.MPossibleViewModels,
            ownField: args.OViewModelField,
            ownIdField: args.OViewModelIdField,
            many: false,
            generic: true
        },
        // possible view models -> viewModel
        {
            ownViewModels: args.MPossibleViewModels,
            foreignViewModel: args.OViewModel,
            ownField: args.MPossibleViewModelsField,
            ownIdField: args.MPossibleViewModelsIdField,
            many: true,
            generic: false,
            order: args.OViewModelOrder
        }
    ];
}

export function makeGenericM2M<V extends BaseViewModel, I>(args: {
    viewModel: ViewModelConstructor<V>;
    possibleViewModels: ViewModelConstructor<BaseViewModel & I>[];
    possibleViewModelsField: keyof I & string;
    viewModelField: keyof V & string;
    viewModelIdField?: keyof V & string;
    possibleViewModelsIdField?: keyof I & string;
    viewModelOrder?: keyof V & string;
    possibleViewModelsOrder?: keyof I & string;
}): Relation[] {
    return [
        // viewModel -> possible view models
        {
            ownViewModels: [args.viewModel],
            foreignViewModelPossibilities: args.possibleViewModels,
            ownField: args.viewModelField,
            ownIdField: args.viewModelIdField,
            many: true,
            generic: true,
            order: args.possibleViewModelsOrder
        },
        // possible view models -> viewModel
        {
            ownViewModels: args.possibleViewModels,
            foreignViewModel: args.viewModel,
            ownField: args.possibleViewModelsField,
            ownIdField: args.possibleViewModelsIdField,
            many: true,
            generic: false,
            order: args.viewModelOrder
        }
    ];
}

export function makeManyDynamicallyNamedO2O<A extends BaseViewModel, B extends BaseViewModel>(args: {
    AViewModel: ViewModelConstructor<A>;
    BViewModel: ViewModelConstructor<B>;
    config: {
        AField: keyof A & string;
        AIdField?: keyof A & string;
        BField: keyof B & string;
        BIdField?: keyof B & string;
    }[];
}): Relation[] {
    const { config, ...info } = args;
    return config.flatMap(conf => makeO2O({ ...info, ...conf }));
}

export function makeManyDynamicallyNamedM2O<O extends BaseViewModel, M extends BaseViewModel>(args: {
    OViewModel: ViewModelConstructor<O>;
    MViewModel: ViewModelConstructor<M>;
    config: {
        OField: keyof O & string;
        OIdField?: keyof O & string;
        MField: keyof M & string;
        MIdField?: keyof M & string;
    }[];
    order?: keyof M & string;
    isFullList?: boolean;
    isExclusiveList?: boolean;
}): Relation[] {
    const { config, ...info } = args;
    return config.flatMap(conf => makeM2O({ ...info, ...conf }));
}
