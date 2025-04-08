import { Destroyable, reactArray, reactPlainObjectWithUndefined } from "xbsj-xe2/dist-node/xe2-base-utils";
import { DomElementEvent, ObjResettingWithEvent } from "xbsj-xe2/dist-node/xe2-utils";

class DomElementMovingRunning extends Destroyable {
    get owner() { return this._owner; }

    constructor(private _owner: DomElementMoving) {
        super();

        const { element, runningReact, pointerMoveEvent } = this.owner;
        if (!runningReact.value) throw new Error("runningReact is null");
        const { pointerId, startScreenX, startScreenY } = runningReact.value;
        element.setPointerCapture(pointerId);
        this.dispose(() => element.releasePointerCapture(pointerId));

        this.dispose(DomElementEvent.on(pointerMoveEvent, pointerEvent => {
            const { screenX, screenY } = pointerEvent;
            const deltaX = screenX - startScreenX;
            const deltaY = screenY - startScreenY;
            this.owner.deltaXY = [deltaX, deltaY];
        }));
    }
}

export type DomElementMovingRunningDataType = {
    pointerId: number;
    startScreenX: number;
    startScreenY: number;
};
export class DomElementMoving extends Destroyable {
    get element() { return this._element; }

    private _runningReact = this.disposeVar(reactPlainObjectWithUndefined<DomElementMovingRunningDataType>(undefined));
    get runningReact() { return this._runningReact; }
    private _pointerDownEvent = this.disposeVar(DomElementEvent.create(this._element, 'pointerdown', true));
    private _pointerDownEventInit = this.dispose(DomElementEvent.on(this._pointerDownEvent, pointerEvent => {
        this._runningReact.value = {
            pointerId: pointerEvent.pointerId,
            startScreenX: pointerEvent.screenX,
            startScreenY: pointerEvent.screenY,
        };
    }));
    private _pointerUpEvent = this.disposeVar(DomElementEvent.create(this._element, 'pointerup', true));
    private _pointerUpEventInit = this.dispose(DomElementEvent.on(this._pointerUpEvent, pointerEvent => {
        this._runningReact.value = undefined;
    }));

    private _pointerMoveEvent = this.disposeVar(DomElementEvent.create(this.element, 'pointermove', true));
    get pointerMoveEvent() { return this._pointerMoveEvent; }

    private _deltaXY = this.disposeVar(reactArray<[number, number]>([0, 0]));
    get deltaXY() { return this._deltaXY.value; }
    set deltaXY(value: [number, number]) { this._deltaXY.value = value; }
    get deltaXYChanged() { return this._deltaXY.changed; }

    private _runningResetting = this.disposeVar(new ObjResettingWithEvent(this._runningReact.changed, () => {
        if (!this._runningReact.value) return undefined;
        return new DomElementMovingRunning(this);
    }));

    constructor(private _element: HTMLDivElement) {
        super();
    }
}
