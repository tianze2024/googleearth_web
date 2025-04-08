import { createApp } from 'vue';

import { Destroyable, bind, reactPlainObjectWithUndefined, track } from "xbsj-xe2/dist-node/xe2-base-utils";
import { ProjectManager, SceneTree } from 'xbsj-xe2/dist-node/xe2';
import { ESSceneObject, GroupProperty, CustomDiv, Viewer, BooleanProperty, StringProperty,LongStringProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import { PartialWithUndefinedReactivePropsToNativeProps, ReactivePropsToNativePropsAndChanged, extendClassProps } from "xbsj-xe2/dist-node/xe2-base-utils";
import SceneTreeWrapper from "../common/SceneTree/SceneTreeWrapper.vue";

export type SceneTreeVue3UIConfigType = {
    sceneTree: SceneTree;
    projectManager: ProjectManager,
    nameTitle?: string;
};

const defaultCssText = `\
position: absolute;
left: 0;
top: 0;
z-index: 100;
width:560px;
height:auto;
background-color:rgba(0, 33, 43,0.6);
padding: 10px;
border-radius: 8px;
\
`;

function createDivClass(sceneObject: SceneTreeVue3UI) {
    return class MyDiv extends Destroyable {
        // subContainer是外部视口的div容器，可以在这里创建自己需要的DOM元素
        // customDiv指向当前的CustomDiv场景对象
        // viewer指定当前的视口
        constructor(subContainer: HTMLDivElement, customDiv: CustomDiv, viewer?: Viewer | undefined) {
            super();

            const div = document.createElement('div');

            subContainer.appendChild(div);
            this.dispose(() => subContainer.removeChild(div));

            // div.style.width = '200px';
            // div.style.height = '400px';
            div.style.position = 'absolute';
            div.style.left = '10px';
            div.style.top = '10px';
            // div.style.background = 'rgba(120, 120, 0, 0.7)';
            // div.style.color = 'white';
            // div.style.fontSize = '30px';
            // div.style.lineHeight = '50px';
            // div.style.border = '1px solid white';
            div.style.zIndex = '100'; // 特别重要，不能丢！很可能导致保存后打开看不到！
            div.style.pointerEvents = 'all';

            {
                // 控制显示隐藏
                const update = () => {
                    div.style.cssText = SceneTreeVue3UI.defaults.cssText + sceneObject.cssText ?? '';
                    div.style.display = (customDiv.show ?? true) ? 'block' : 'none';
                };
                update();
                this.dispose(customDiv.showChanged.disposableOn(update));
                this.dispose(sceneObject.cssTextChanged.disposableOn(update));
            }

            {
                const config = sceneObject.config as SceneTreeVue3UIConfigType
                const sceneTreeApp = createApp(SceneTreeWrapper, {
                    sceneTree: config.sceneTree,
                    nameTitle: config.nameTitle ?? '未命名场景树',
                    projectManager: config.projectManager,
                });
                sceneTreeApp.mount(div);
                this.dispose(() => sceneTreeApp.unmount());
            }
        }
    }
}

export class SceneTreeVue3UI extends ESSceneObject {
    static readonly type = this.register('SceneTreeVue3UI', this, { chsName: 'SceneTreeVue3UI', tags: ['MiscObjects'], description: "SceneTreeVue3UI" });
    get typeName() { return 'SceneTreeVue3UI'; }
    override get defaultProps() { return SceneTreeVue3UI.createDefaultProps(); }
    get json() { return this._innerGetJson() as JsonType; }
    set json(value: JsonType) { this._innerSetJson(value); }

    private _config = this.disposeVar(reactPlainObjectWithUndefined<SceneTreeVue3UIConfigType>(undefined));
    get config() { return this._config.value; }
    get configChanged() { return this._config.changed; }
    set config(value: SceneTreeVue3UIConfigType | undefined) { this._config.value = value; }

    private _customDiv = this.disposeVar(new CustomDiv());
    get customDiv() { return this._customDiv; }

    get container() { return this._customDiv.container; }
    get containerChanged() { return this._customDiv.containerChanged; }
    set container(value) { this._customDiv.container = value; }

    constructor(id?: string) {
        super(id);

        const customDiv = this._customDiv;
        this.dispose(this.components.disposableAdd(customDiv));

        {
            const update = () => customDiv.instanceClass = this.config && createDivClass(this);
            update();
            this.dispose(this.configChanged.disposableOn(update));
        }

        this.dispose(track([customDiv, 'show'], [this, 'show'], a => a ?? SceneTreeVue3UI.defaults.show));
        this.dispose(bind([customDiv, 'containerId'], [this, 'containerId']));
    }

    static override defaults = {
        ...ESSceneObject.defaults,
        show: true,
        containerId: CustomDiv.defaults.containerId,
        cssText: defaultCssText,
    }

    override getProperties(language?: string) {
        return [
            ...super.getProperties(language),
            new GroupProperty('通用', '通用', [
                new BooleanProperty('显示', 'BooleanProperty', true, false, [this, 'show'], SceneTreeVue3UI.defaults.show),
                new StringProperty('容器ID', '容器的ID，如果设置，CustomDiv将自动放入容器，否则放入各个视口中。', true, false, [this, 'containerId'], SceneTreeVue3UI.defaults.containerId),
                new LongStringProperty('cssText', 'cssText', true, false, [this, 'cssText'], SceneTreeVue3UI.defaults.cssText),
            ]),
        ];
    }
}

export namespace SceneTreeVue3UI {
    export const createDefaultProps = () => ({
        ...ESSceneObject.createDefaultProps(),
        show: undefined as boolean | undefined,
        containerId: undefined as string | undefined,
        cssText: undefined as string | undefined,
    });
}
extendClassProps(SceneTreeVue3UI.prototype, SceneTreeVue3UI.createDefaultProps);
export interface SceneTreeVue3UI extends ReactivePropsToNativePropsAndChanged<ReturnType<typeof SceneTreeVue3UI.createDefaultProps>> { }
type JsonType = PartialWithUndefinedReactivePropsToNativeProps<ReturnType<typeof SceneTreeVue3UI.createDefaultProps> & { type: string }>;
