import { createNextAnimateFrameEvent, Destroyable, react } from 'xbsj-xe2/dist-node/xe2-base-utils';
import { ObjResettingWithEvent, ObservableSet } from 'xbsj-xe2/dist-node/xe2-utils';
import { DomElementBaseCssTextOptionsType, DomElementSideMoving, DomElementSideType } from './DomElementSideMoving';
import { AppProjectManager } from './AppProjectManager';

function getSideFactor(sideType: DomElementSideType) {
    let xFactor = 1;
    let yFactor = 1;
    if (sideType.startsWith('right')) {
        xFactor = 1;
    } else if (sideType.startsWith('left')) {
        xFactor = -1;
    } else {
        xFactor = 0;
    }
    if (sideType.endsWith('bottom')) {
        yFactor = 1;
    } else if (sideType.endsWith('top')) {
        yFactor = -1;
    } else {
        yFactor = 0;
    }
    return [xFactor, yFactor] as [number, number];
}

class DomElementSideMovingWrapper extends Destroyable {
    get owner() { return this._owner; }

    private _desm = this.disposeVar(new DomElementSideMoving(this._element, this._sideType));
    get desm() { return this._desm; }

    constructor(private _owner: AppLayoutResizingResetting, private _element: HTMLDivElement, private _sideType: DomElementSideType) {
        super();

        const { desm } = this;

        desm.hoverCssColor = this.owner.owner.owner.hoverCssColor;
        desm.baseCssTextOptions = this.owner.owner.owner.baseCssTextOptions;

        const { element } = this.owner.owner;
        if (!element) throw new Error('element is null');

        let startSize: [number, number] = [0, 0];
        this.dispose(desm.runningChanged.disposableOn(() => {
            if (!desm.running) return;
            const result = this.owner.owner.element?.getBoundingClientRect();
            if (!result) return;
            startSize = result ? [result.width, result.height] : [0, 0];
        }));

        this.dispose(desm.deltaXYChanged.disposableOn(() => {
            if (!desm.running) return;

            const [xFactor, yFactor] = getSideFactor(this._sideType);
            const width = startSize[0] + xFactor * desm.deltaXY[0];
            const height = startSize[1] + yFactor * desm.deltaXY[1];
            (xFactor !== 0) && (element.style.width = `${width}px`);
            (yFactor !== 0) && (element.style.height = `${height}px`);
        }));
    }
}

class AppLayoutResizingResetting extends Destroyable {
    get owner() { return this._owner; }
    get element() { return this.owner.element as HTMLDivElement; }

    private _wrappers = [...this.owner.sideTypes.values()].map(sideType => this.disposeVar(new DomElementSideMovingWrapper(this, this.element, sideType)));

    constructor(private _owner: AppLayoutResizing) {
        super();
    }
}

class AppLayoutResizing extends Destroyable {
    get owner() { return this._owner; }

    private _element = this.disposeVar(react<HTMLDivElement | undefined>(undefined));
    get element() { return this._element.value; }
    set element(value: HTMLDivElement | undefined) { this._element.value = value; }
    get elementChanged() { return this._element.changed; }

    private _sideTypes = this.disposeVar(new ObservableSet<DomElementSideType>());
    get sideTypes() { return this._sideTypes; }

    private _resizingEvent = this.disposeVar(createNextAnimateFrameEvent(this.elementChanged, this.sideTypes.changed));
    private _resizingResetting = this.disposeVar(new ObjResettingWithEvent(this._resizingEvent, () => {
        if (!this.element) return undefined;
        return new AppLayoutResizingResetting(this);
    }));

    constructor(private _owner: AppLayout, sideTypes: DomElementSideType[]) {
        super();
        this._sideTypes.add(...sideTypes);
    }
}

export class AppLayout extends Destroyable {
    private _leftSideBarResizing = this.disposeVar(new AppLayoutResizing(this, ['right']));
    get leftSideBarResizing() { return this._leftSideBarResizing; }

    private _bottomSideBarResizing = this.disposeVar(new AppLayoutResizing(this, ['top']));
    get bottomSideBarResizing() { return this._bottomSideBarResizing; }

    hoverCssColor = '#FFF';
    baseCssTextOptions: DomElementBaseCssTextOptionsType = {
        sideZIndex: 1000,
        cornerZIndex: 1001,
        sideWidth: 6,
        cornerSize: 12,
    };

    constructor(private _owner: AppProjectManager) {
        super();
    }
}
