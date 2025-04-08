import { createApp, getCurrentInstance } from 'vue';

import { PropTree, PropUiTreeManager } from 'xbsj-xe2/dist-node/xe2';
import { BooleanProperty, CustomDiv, ESSceneObject, GroupProperty, StringProperty, Viewer,LongStringProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import { Destroyable, PartialWithUndefinedReactivePropsToNativeProps, ReactivePropsToNativePropsAndChanged, bind, extendClassProps, track } from "xbsj-xe2/dist-node/xe2-base-utils";
import { SceneObject, createNextAnimateFrameEvent } from "xbsj-xe2/dist-node/xe2-utils";
import PropTreeWrapper from "../common/PropTree/PropTreeWrapper.vue";

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

function createDivClass(propTree: PropTree, sceneObject: PropTreeVue3UI) {
    
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
                    div.style.cssText = PropTreeVue3UI.defaults.cssText + sceneObject.cssText ?? '';
                    div.style.display = (customDiv.show ?? true) ? 'block' : 'none';
                };
                update();
                this.dispose(customDiv.showChanged.disposableOn(update));
                this.dispose(sceneObject.cssTextChanged.disposableOn(update));
            }

            {
                const sceneTreeApp = createApp(PropTreeWrapper, {
                    propTree,
                    nameTitle: sceneObject.nameTitle ?? PropTreeVue3UI.defaults.nameTitle,
                });
                console.log(sceneTreeApp);
                sceneTreeApp.mount(div);
                
                // 设置sceneTreeApp的属性的方法 vtxf 20230906
                // @ts-ignore
                // sceneTreeApp._instance.props.nameTitle = 123;

                this.dispose(() => sceneTreeApp.unmount());
            }
        }
    }
}

export class PropTreeVue3UI extends ESSceneObject {
    static readonly type = this.register('PropTreeVue3UI', this, { chsName: 'PropTreeVue3UI', tags: ['MiscObjects'], description: "PropTreeVue3UI" });
    get typeName() { return 'PropTreeVue3UI'; }
    override get defaultProps() { return PropTreeVue3UI.createDefaultProps(); }
    get json() { return this._innerGetJson() as JsonType; }
    set json(value: JsonType) { this._innerSetJson(value); }

    private _propUiTreeManager = this.disposeVar(new PropUiTreeManager(24));
    get propUiTreeManager() { return this._propUiTreeManager; }

    set sceneObject(value: SceneObject | undefined) { this._propUiTreeManager.sceneObject = value; }
    get sceneObject() { return this._propUiTreeManager.sceneObject; }

    static override defaults = {
        ...ESSceneObject.defaults,
        show: true,
        nameTitle: '场景对象属性',
        containerId: CustomDiv.defaults.containerId,
        sceneObjectId: '',
        cssText: defaultCssText,
    };

    private _customDiv = this.disposeVar(new CustomDiv());
    get customDiv() { return this._customDiv; }

    get container() { return this._customDiv.container; }
    get containerChanged() { return this._customDiv.containerChanged; }
    set container(value) { this._customDiv.container = value; }

    constructor(id?: string) {
        super(id);

        const customDiv = this.disposeVar(new CustomDiv());
        this.dispose(this.components.disposableAdd(customDiv));

        {
            const update = () => {
                const { propTree } = this._propUiTreeManager;
                if (!propTree) {
                    return;
                }
                customDiv.instanceClass = createDivClass(propTree, this);
            };
            update();
            const event = this.disposeVar(createNextAnimateFrameEvent(this._propUiTreeManager.propTreeChanged, this.nameTitleChanged));
            this.dispose(event.disposableOn(update));
        }

        this.dispose(track([customDiv, 'show'], [this, 'show'], a => a ?? PropTreeVue3UI.defaults.show));
        this.dispose(bind([customDiv, 'containerId'], [this, 'containerId']));

        {
            const update = () => {
                if (this.sceneObjectId === undefined) {
                    this._propUiTreeManager.sceneObject = undefined;
                    return;
                }
                const sceneObject = SceneObject.context.getSceneObjectById(this.sceneObjectId);
                this.sceneObject = sceneObject;
            };
            update();
            this.dispose(this.sceneObjectIdChanged.disposableOn(update));
        }
    }

    override getProperties(language?: string) {
        return [
            ...super.getProperties(language),
            new GroupProperty('通用', '通用', [
                new BooleanProperty('显示', 'BooleanProperty', true, false, [this, 'show'], PropTreeVue3UI.defaults.show),
                new StringProperty('容器ID', '容器的ID，如果设置，CustomDiv将自动放入容器，否则放入各个视口中。', true, false, [this, 'containerId'], PropTreeVue3UI.defaults.containerId),
                new StringProperty('场景对象ID', '场景对象ID，设置以后将显示该场景对象的属性信息', true, false, [this, 'sceneObjectId'], PropTreeVue3UI.defaults.sceneObjectId),
                new LongStringProperty('cssText', 'cssText', true, false, [this, 'cssText'], PropTreeVue3UI.defaults.cssText),
            ]),
        ];
    }
}

export namespace PropTreeVue3UI {
    export const createDefaultProps = () => ({
        ...ESSceneObject.createDefaultProps(),
        show: undefined as boolean | undefined,
        nameTitle: undefined as string | undefined,
        containerId: undefined as string | undefined,
        sceneObjectId: undefined as string | undefined,
        cssText: undefined as string | undefined,
    });
}
extendClassProps(PropTreeVue3UI.prototype, PropTreeVue3UI.createDefaultProps);
export interface PropTreeVue3UI extends ReactivePropsToNativePropsAndChanged<ReturnType<typeof PropTreeVue3UI.createDefaultProps>> { }
type JsonType = PartialWithUndefinedReactivePropsToNativeProps<ReturnType<typeof PropTreeVue3UI.createDefaultProps>>;
