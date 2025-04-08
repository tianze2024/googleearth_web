import { Destroyable, Event, react } from 'xbsj-xe2/dist-node/xe2-base-utils';
import { ObjResettingWithEvent } from 'xbsj-xe2/dist-node/xe2-utils';
import { AppProjectManager } from './AppProjectManager';

class SceneObjectTypeGettingResetting extends Destroyable {
    constructor(private _owner: SceneObjectTypeGetting) {
        super();
        this._owner.showDialog = true;
        this.dispose(() => this._owner.showDialog = false);

        let overfunc = (type: string) => {
            if (this._owner.listeningFunc) {
                this._owner.listeningFunc(type);
                this._owner.listeningFunc = undefined;
            }
        };
        this.dispose(this._owner.setSceneObjectTypeFromUIEvent.disposableOnce(overfunc));
        this.dispose(() => overfunc(''));
    }
}
export class SceneObjectTypeGetting extends Destroyable {
    private _showDialog = this.disposeVar(react<boolean>(false));
    get showDialog() { return this._showDialog.value; }
    set showDialog(value: boolean) { this._showDialog.value = value; }
    get showDialogChanged() { return this._showDialog.changed; }

    private _setSceneObjectTypeFromUIEvent = this.disposeVar(new Event<[type: string]>());
    get setSceneObjectTypeFromUIEvent() { return this._setSceneObjectTypeFromUIEvent; }
    setTypeName(type: string) { this._setSceneObjectTypeFromUIEvent.emit(type); }

    private _listeningFunc = this.disposeVar(react<((type: string) => void) | undefined>(undefined));
    get listeningFunc() { return this._listeningFunc.value; }
    set listeningFunc(value: ((type: string) => void) | undefined) { this._listeningFunc.value = value; }
    get listeningFuncChanged() { return this._listeningFunc.changed; }
    start() {
        return new Promise<string>((resolve, reject) => {
            this.listeningFunc = undefined;
            this.listeningFunc = resolve;
        });
    }

    private _resetting = this.disposeVar(new ObjResettingWithEvent(this.listeningFuncChanged, () => {
        if (!this.listeningFunc) return undefined;
        return new SceneObjectTypeGettingResetting(this);
    }, false));

    constructor(private _appProjectManager: AppProjectManager) {
        super();
    }
}
