import { createApp } from 'vue';

import { PropTree, PropUiTreeManager } from 'xbsj-xe2/dist-node/xe2';
import { BooleanProperty, CustomDiv, ESSceneObject, GroupProperty, StringProperty, Viewer,LongStringProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import { Destroyable, PartialWithUndefinedReactivePropsToNativeProps, ReactivePropsToNativePropsAndChanged, bind, extendClassProps, track } from "xbsj-xe2/dist-node/xe2-base-utils";
import { SceneObject, createNextAnimateFrameEvent } from "xbsj-xe2/dist-node/xe2-utils";
import ESCameraViewCollectionVue3UI from "../ESCameraViewCollectionVue3UI.vue";
import { ESCameraViewCollection } from "esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main";
import { react } from 'xbsj-xe2/dist-node/xe2-base-utils';

const defaultCssText = `\
position: absolute;
left: 0;
top: 0;
z-index: 100;
width:560px;
height:200px;
background-color:rgba(0, 33, 43,0.6);
padding: 10px;
border-radius: 8px;
\
`;

function createDivClass(sceneObject:ESCameraViewCollectionUI) {
    return class MyDiv extends Destroyable {
        // subContainer是外部视口的div容器，可以在这里创建自己需要的DOM元素
        // customDiv指向当前的CustomDiv场景对象
        // viewer指定当前的视口

        private _sceneTreeApp: any
        get sceneTreeApp() { return this._sceneTreeApp }

        constructor(subContainer: HTMLDivElement, customDiv: CustomDiv, viewer?: Viewer | undefined) {
            super();

            const div = document.createElement('div');

            subContainer.appendChild(div);
            this.dispose(() => subContainer.removeChild(div));

            {
                // 控制显示隐藏
                const update = () => {
                    div.style.cssText = ESCameraViewCollectionUI.defaults.cssText + sceneObject.cssText ?? '';
                    div.style.display = (customDiv.show ?? true) ? 'block' : 'none';
                };
                update();
                this.dispose(customDiv.showChanged.disposableOn(update));
                this.dispose(sceneObject.cssTextChanged.disposableOn(update));
            }
            div.style.border = '1px solid #fff'

            {
                const update = () => {
                    this._sceneTreeApp = createApp(ESCameraViewCollectionVue3UI, {
                        currenESCameraViewCollection: sceneObject.eSCameraViewCollection,
                    });
                    this._sceneTreeApp.mount(div);
                    this.dispose(() => this._sceneTreeApp.unmount());
                    div.style.border = 'unset'
                }
                this.dispose(sceneObject.existChanged.disposableOn(update))
            }
        }
    }
}

export class ESCameraViewCollectionUI extends ESSceneObject {
    static readonly type = this.register('ESCameraViewCollectionUI', this, { chsName: 'ESCameraViewCollectionUI', tags: ['MiscObjects'], description: "ESCameraViewCollectionUI" });
    get typeName() { return 'ESCameraViewCollectionUI'; }
    override get defaultProps() { return ESCameraViewCollectionUI.createDefaultProps(); }
    get json() { return this._innerGetJson() as JsonType; }
    set json(value: JsonType) { this._innerSetJson(value); }

    private _eSCameraViewCollection:ESCameraViewCollection | undefined 
    set eSCameraViewCollection(value: ESCameraViewCollection | undefined) { this._eSCameraViewCollection = value; }
    get eSCameraViewCollection() { return this._eSCameraViewCollection; }

    static override defaults = {
        ...ESSceneObject.defaults,
        show: true,
        containerId: CustomDiv.defaults.containerId,
        sceneObjectId: '',
        cssText: defaultCssText,
    };

    private _customDiv = this.disposeVar(new CustomDiv());
    get customDiv() { return this._customDiv; }

    get container() { return this._customDiv.container; }
    get containerChanged() { return this._customDiv.containerChanged; }
    set container(value) { this._customDiv.container = value; }

    private _exist = this.disposeVar(react(false))
    get exist() { return this._exist }
    get existChanged() { return this.exist.changed }

    constructor(id?: string) {
        super(id);

        const customDiv = this.disposeVar(new CustomDiv());
        this.dispose(this.components.disposableAdd(customDiv));

        this.dispose(track([customDiv, 'show'], [this, 'show'], a => a ?? ESCameraViewCollectionUI.defaults.show));
        this.dispose(bind([customDiv, 'containerId'], [this, 'containerId']));
        customDiv.instanceClass = createDivClass(this);

        {
            const update = () => {
                const sceneObject = SceneObject.context.getSceneObjectById(this.sceneObjectId as string);
                if(!sceneObject)return;
                if(sceneObject.typeName === 'ESCameraViewCollection'){
                    this.eSCameraViewCollection = sceneObject as unknown as ESCameraViewCollection
                    this._exist.value = true
                }
            };
            update();
            this.dispose(this.sceneObjectIdChanged.disposableOn(update));
        }
    }

    override getProperties(language?: string) {
        return [
            ...super.getProperties(language),
            new GroupProperty('通用', '通用', [
                new BooleanProperty('显示', 'BooleanProperty', true, false, [this, 'show'], ESCameraViewCollectionUI.defaults.show),
                new StringProperty('容器ID', '容器的ID，如果设置，CustomDiv将自动放入容器，否则放入各个视口中。', true, false, [this, 'containerId'], ESCameraViewCollectionUI.defaults.containerId),
                new StringProperty('场景对象ID', '场景对象ID，设置以后将显示该场景对象的属性信息', true, false, [this, 'sceneObjectId'], ESCameraViewCollectionUI.defaults.sceneObjectId),
                new LongStringProperty('cssText', 'cssText', true, false, [this, 'cssText'], ESCameraViewCollectionUI.defaults.cssText),
            ]),
        ];
    }
}

export namespace ESCameraViewCollectionUI {
    export const createDefaultProps = () => ({
        ...ESSceneObject.createDefaultProps(),
        show: undefined as boolean | undefined,
        nameTitle: undefined as string | undefined,
        containerId: undefined as string | undefined,
        sceneObjectId: undefined as string | undefined,
        cssText: undefined as string | undefined,
    });
}
extendClassProps(ESCameraViewCollectionUI.prototype, ESCameraViewCollectionUI.createDefaultProps);
export interface ESCameraViewCollectionUI extends ReactivePropsToNativePropsAndChanged<ReturnType<typeof ESCameraViewCollectionUI.createDefaultProps>> { }
type JsonType = PartialWithUndefinedReactivePropsToNativeProps<ReturnType<typeof ESCameraViewCollectionUI.createDefaultProps>>;
