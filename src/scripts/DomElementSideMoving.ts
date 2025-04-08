import { Destroyable } from 'xbsj-xe2/dist-node/xe2-base-utils';
import { DomElementMoving } from './DomElementMoving';

export type DomElementSideType = 'left' | 'right' | 'top' | 'bottom' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

export type DomElementBaseCssTextOptionsType = {
    sideZIndex: number,
    cornerZIndex: number,
    sideWidth: number,
    cornerSize: number
}

function getCssTextBySideType(sideType: DomElementSideType, options: DomElementBaseCssTextOptionsType) {
    let corner = false;
    if (['leftBottom', 'rightBottom', 'leftTop', 'rightTop'].includes(sideType)) {
        corner = true;
    }

    let cursorCssText = '';
    switch (sideType) {
        case 'left':
        case 'right':
            cursorCssText = 'cursor: ew-resize;';
            break;
        case 'top':
        case 'bottom':
            cursorCssText = 'cursor: ns-resize;';
            break;
        case 'leftTop':
            cursorCssText = 'cursor: nwse-resize;';
            break;
        case 'leftBottom':
            cursorCssText = 'cursor: nesw-resize;';
            break;
        case 'rightTop':
            cursorCssText = 'cursor: nwse-resize;';
            break;
        case 'rightBottom':
            cursorCssText = 'cursor: nesw-resize;';
            break;
    };

    let sizeCssText: string[] = [];
    switch (sideType) {
        case 'left':
            sizeCssText = [
                `width: ${options.sideWidth}px;`,
                `height: 100%;`,
                `left: -${options.sideWidth / 2}px;`,
                `top: 0px`,
            ];
            break;
        case 'right':
            sizeCssText = [
                `width: ${options.sideWidth}px;`,
                `height: 100%;`,
                `right: -${options.sideWidth}px;`,
                `top: 0px;`,
            ];
            break;
        case 'bottom':
            sizeCssText = [
                `width: 100%;`,
                `height: ${options.sideWidth}px;`,
                `left: 0px;`,
                `bottom: -${options.sideWidth / 2}px;`,
            ];
            break;
        case 'top':
            sizeCssText = [
                `width: 100%;`,
                `height: ${options.sideWidth}px;`,
                `left: 0px;`,
                `top: -${options.sideWidth / 2}px;`,
            ];
            break;
        case 'leftBottom':
        case 'rightBottom':
        case 'rightTop':
        case 'leftTop':
            sizeCssText = [
                `width: ${options.cornerSize}px;`,
                `height: ${options.cornerSize}px;`,
                `right: -${options.cornerSize / 2}px;`,
                `bottom: -${options.cornerSize / 2}px;`,
            ];
            break;
    }

    const zIndexCssText = corner ? `z-index: ${options.cornerZIndex};` : `z-index: ${options.sideZIndex};`;

    const cssText = [cursorCssText, ...sizeCssText, zIndexCssText].join('\n');
    return cssText;
}

export class DomElementSideMoving extends Destroyable {
    get sideType() { return this._sideType; }
    private _div = document.createElement('div');
    private _domElementMoving = this.disposeVar(new DomElementMoving(this._div));
    get running() { return this._domElementMoving.runningReact.value; }
    get runningChanged() { return this._domElementMoving.runningReact.changed; }
    get deltaXY() { return this._domElementMoving.deltaXY; }
    get deltaXYChanged() { return this._domElementMoving.deltaXYChanged; }

    hoverCssColor = 'yellow';
    baseCssTextOptions: DomElementBaseCssTextOptionsType = {
        sideZIndex: 1000,
        cornerZIndex: 1001,
        sideWidth: 10,
        cornerSize: 12,
    };

    constructor(private _element: HTMLDivElement, private _sideType: DomElementSideType) {
        super();

        const div = this._div;
        {
            div.onpointerenter = () => {
                div.style.background = this.hoverCssColor;
            }
            div.onpointerleave = () => {
                div.style.background = 'transparent';
            }

            this._element.appendChild(div);
            this.dispose(() => this._element.removeChild(div));
        }

        const sideType = this._sideType;
        div.style.cssText = getCssTextBySideType(sideType, this.baseCssTextOptions);
        div.style.position = 'absolute';
        div.style.background = 'transparent';
        div.style.transition = '0.3s';
        div.style.opacity = '0.2';
    }
}