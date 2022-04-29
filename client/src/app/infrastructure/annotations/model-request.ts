import { Constructable, ViewModelConstructor } from 'src/app/domain/interfaces/constructable';

interface ModelRequestValueConfig {
    isTemplateField?: boolean;
    buildAsFollow?: boolean;
}

interface ModelRequestConfig<V = unknown> {
    name: string;
    follows?: string[];
    viewModelCtr?: ViewModelConstructor<V>;
    values: ({ propertyName: string } & ModelRequestValueConfig)[];
}

export class ModelRequestContainer {
    private static readonly _modelRequestMap: { [instanceName: string]: ModelRequestConfig<any> } = {};

    public static addConfig(name: string, config: { propertyName: string } & ModelRequestValueConfig): void {
        this._getConfig(name).values.push(config);
    }

    public static setFollowStruct(forName: string, followName: string): void {
        const currentFollows = this._getConfig(forName).follows;
        if (currentFollows) {
            currentFollows.push(followName);
        } else {
            this._getConfig(forName).follows = [followName];
        }
    }

    public static addConstructable<V>(name: string, viewModelCtr: ViewModelConstructor<V>): void {
        this._getConfig(name).viewModelCtr = viewModelCtr;
    }

    public static getConfig<V>(name: string): ModelRequestConfig<V> {
        if (!this._modelRequestMap[name]) {
            throw new Error(`No config provided for ${name}`);
        }
        return this._modelRequestMap[name];
    }

    private static _getConfig(name: string): ModelRequestConfig {
        if (!this._modelRequestMap[name]) {
            this._modelRequestMap[name] = { name, values: [] };
        }
        return this._modelRequestMap[name];
    }
}

export function ModelRequestViewConstructorFor<V>(names: string[]): any {
    return (target: ViewModelConstructor<V>) => {
        for (const name of names) {
            ModelRequestContainer.addConstructable(name, target);
        }
    };
}

export function ModelRequestValueFor(names: string[], config: ModelRequestValueConfig = {}): any {
    return (_: Constructable, propertyName: string) => {
        for (const name of names) {
            if (config.buildAsFollow) {
                ModelRequestContainer.setFollowStruct(name, propertyName);
            } else {
                ModelRequestContainer.addConfig(name, { propertyName, ...config });
            }
        }
    };
}
