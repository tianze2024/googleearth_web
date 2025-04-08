import { ProjectManager } from 'xbsj-xe2/dist-node/xe2';
import { Destroyable, extendClassProps, ReactivePropsToNativePropsAndChanged } from 'xbsj-xe2/dist-node/xe2-base-utils';
import { SceneObjectTypeGetting } from './SceneObjectTypeGetting';
import { AppLayout } from './AppLayout';

// Som是SceneObjectsManager的缩写！
export class AppProjectManager extends Destroyable {
    private _xe2ProjectManager = this.disposeVar(new ProjectManager());
    get xe2ProjectManager() { return this._xe2ProjectManager; }

    private _sceneObjectTypeGetting = this.disposeVar(new SceneObjectTypeGetting(this));
    get sceneObjectTypeGetting() { return this._sceneObjectTypeGetting; }

    private _appLayout = this.disposeVar(new AppLayout(this));
    get appLayout() { return this._appLayout; }

    constructor() {
        super();
        const getLastJson = () => {
            const lastJson = JSON.stringify(this.xe2ProjectManager.json)
            localStorage.setItem("lastJson", lastJson);
        }
        // 在页面加载完成后添加监听事件
        window.addEventListener('beforeunload', getLastJson);
        this.dispose(() => { window.removeEventListener('beforeunload', getLastJson) })

        // @ts-ignore
        this._xe2ProjectManager.sceneTree.debug = true;
    }
}

export namespace AppProjectManager {
    export const createDefaultProps = () => ({
        transparentBackground: false,
        showSceneTreeView: true,//场景树
        // showSceneTree2View: false, //场景树2
        showHeaderView: true,//header栏
        showOutputView: false,//输出面板
        showMainToolBar: true,//工具栏
        isMinToolView: true,//是否是小工具栏
        showFavoritesToolbar: false,
        showSceneCreatingToolbar: false,
        showSearchToolbar:true,
        showMappingToolbar:true,
        showStreeHisToolbar:true,
        showMapLayerToolbar:true,
        // showModelCreatingToolbar: true,
        leftSideBarWidth: 400,
        leftSideBarElement: undefined as HTMLDivElement | undefined,
    });
}
extendClassProps(AppProjectManager.prototype, AppProjectManager.createDefaultProps);
export interface AppProjectManager extends ReactivePropsToNativePropsAndChanged<ReturnType<typeof AppProjectManager.createDefaultProps>> { }