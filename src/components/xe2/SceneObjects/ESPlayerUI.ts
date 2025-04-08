import { createApp } from 'vue';

import { PropTree, PropUiTreeManager } from 'xbsj-xe2/dist-node/xe2';
import { BooleanProperty, CustomDiv, ESSceneObject, GroupProperty, StringProperty, Viewer, LongStringProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import { Destroyable, PartialWithUndefinedReactivePropsToNativeProps, ReactivePropsToNativePropsAndChanged, bind, extendClassProps, track } from "xbsj-xe2/dist-node/xe2-base-utils";
import { SceneObject, createNextAnimateFrameEvent } from "xbsj-xe2/dist-node/xe2-utils";
import ESPlayerVue3UI from "../ESPlayerVue3UI.vue";
import { ESPlayer } from "esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main";
import { react } from 'xbsj-xe2/dist-node/xe2-base-utils';

const defaultCssText = `\
position: absolute;
left: 0;
top: 0;
z-index: 100;
width:560px;
height:45px;
background-color:rgba(0, 33, 43,0.6);
padding: 10px;
border-radius: 8px;
\
`;

function createDivClass(sceneObject: ESPlayerUI) {
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
                    div.style.cssText = ESPlayerUI.defaults.cssText + sceneObject.cssText ?? '';

                    div.style.display = (customDiv.show ?? true) ? 'block' : 'none';
                };
                update();
                this.dispose(customDiv.showChanged.disposableOn(update));
                this.dispose(sceneObject.cssTextChanged.disposableOn(update));
            }
            div.style.border = '1px solid #fff'

            {
                const update = () => {
                    console.log(sceneObject.player);
                    this._sceneTreeApp = createApp(ESPlayerVue3UI, {
                        currenESPlayer: sceneObject.player,
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

export class ESPlayerUI extends ESSceneObject {
    static readonly type = this.register('ESPlayerUI', this, { chsName: 'ESPlayerUI', tags: ['MiscObjects'], description: "ESPlayerUI" });
    get typeName() { return 'ESPlayerUI'; }
    override get defaultProps() { return ESPlayerUI.createDefaultProps(); }
    get json() { return this._innerGetJson() as JsonType; }
    set json(value: JsonType) { this._innerSetJson(value); }

    private _player: ESPlayer | undefined
    set player(value: ESPlayer | undefined) { this._player = value; }
    get player() { return this._player; }

    private _exist = this.disposeVar(react(false))
    get exist() { return this._exist }
    get existChanged() { return this.exist.changed }

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

    constructor(id?: string) {
        super(id);

        const customDiv = this.disposeVar(new CustomDiv());
        this.dispose(this.components.disposableAdd(customDiv));

        this.dispose(track([customDiv, 'show'], [this, 'show'], a => a ?? ESPlayerUI.defaults.show));
        this.dispose(bind([customDiv, 'containerId'], [this, 'containerId']));
        customDiv.instanceClass = createDivClass(this);

        {
            const update = () => {
                const sceneObject = SceneObject.context.getSceneObjectById(this.sceneObjectId as string);
                if (!sceneObject) return;
                if (sceneObject.typeName === 'ESPlayer') {
                    this.player = sceneObject as unknown as ESPlayer;
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
                new BooleanProperty('显示', 'BooleanProperty', true, false, [this, 'show'], ESPlayerUI.defaults.show),
                new StringProperty('容器ID', '容器的ID，如果设置，CustomDiv将自动放入容器，否则放入各个视口中。', true, false, [this, 'containerId'], ESPlayerUI.defaults.containerId),
                new StringProperty('场景对象ID', '场景对象ID，设置以后将显示该场景对象的属性信息', true, false, [this, 'sceneObjectId'], ESPlayerUI.defaults.sceneObjectId),
                new LongStringProperty('cssText', 'cssText', true, false, [this, 'cssText'], ESPlayerUI.defaults.cssText),
            ]),
        ];
    }
}

export namespace ESPlayerUI {
    export const createDefaultProps = () => ({
        ...ESSceneObject.createDefaultProps(),
        show: undefined as boolean | undefined,
        nameTitle: undefined as string | undefined,
        cssText: undefined as string | undefined,
        containerId: undefined as string | undefined,
        sceneObjectId: undefined as string | undefined,
    });
}
extendClassProps(ESPlayerUI.prototype, ESPlayerUI.createDefaultProps);
export interface ESPlayerUI extends ReactivePropsToNativePropsAndChanged<ReturnType<typeof ESPlayerUI.createDefaultProps>> { }
type JsonType = PartialWithUndefinedReactivePropsToNativeProps<ReturnType<typeof ESPlayerUI.createDefaultProps>>;
