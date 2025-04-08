// import { createPositionsEditingRef } from 'xbsj-xe2/dist-node/xe2-base-objects';
// import { SceneObject, SceneObjectsManager } from 'xbsj-xe2/dist-node/xe2-base-objects';
// import { ReactParamsType } from 'xbsj-xe2/dist-node/xe2-base-utils';
// import { getVueRefDisposeFunc, setVueRefDisposeFunc, toVueRef } from './toVueRef';

// export function createPositionsVisualEditingRefForVue3(sceneObjectsManager: SceneObjectsManager, positionsReactParams: ReactParamsType) {
//     const positionsEditingRef = createPositionsEditingRef(positionsReactParams, (sceneObject: SceneObject) => sceneObjectsManager.addSceneObject(sceneObject),  (sceneObject: SceneObject) => sceneObjectsManager.deleteSceneObject(sceneObject));
//     const vueRef = toVueRef(positionsEditingRef);
//     const disposeFunc = getVueRefDisposeFunc(vueRef);
//     setVueRefDisposeFunc(vueRef, () => {
//         disposeFunc && disposeFunc();
//         positionsEditingRef.destroy();
//     });
//     return vueRef;
// }

// import { SceneObjectsManager } from "xbsj-xe2/dist-node/xe2-base-objects";
// import { ref, watch } from "vue";
// import { ReactParamsType } from "xbsj-xe2/dist-node/xe2-base-utils";
// import { PositionEditing } from "./inner/PositionEditing";
// import { setVueRefDisposeFunc } from "./toVueRef";

// export function createPositionVisualEditingForVue3<T extends { [k: string]: any }>(sceneObjectsManager: SceneObjectsManager, reactVar: ReactParamsType<[number, number, number] | undefined, T>) {
//     // vtxf 可视化编辑
//     const visualEditing = ref(false) // vtxf 可视化编辑，三维窗口中出现坐标架
//     const editing = new PositionEditing(sceneObjectsManager, reactVar);
//     const unlinkFunc = () => !editing.isDestroyed() && editing.destroy();
//     editing.dispose(watch(visualEditing, val => editing.enabled = val))
//     editing.dispose(editing.enabledChanged.disposableOn(enabled => visualEditing.value = enabled))
//     setVueRefDisposeFunc(visualEditing, unlinkFunc);
//     return visualEditing;
// }


// import { GeoCoordinatesEditorAndPicker } from "xbsj-xe2/dist-node/xe2-base-objects";
// import { SceneObjectsManager } from "xbsj-xe2/dist-node/xe2-base-objects";
// import { bind, Destroyable, react, ReactiveVariable, ReactParamsType } from "xbsj-xe2/dist-node/xe2-base-utils";

// class PositionEditingInner<T extends { [k: string]: any } = any> extends Destroyable {
//     private _editor = this.disposeVar(new GeoCoordinatesEditorAndPicker());

//     get enabled() { return this._editor.enabled; }
//     set enabled(value: boolean) { this._editor.enabled = value; }
//     get enabledChanged() { return this._editor.enabledChanged; }

//     constructor(sceneObjectsManager: SceneObjectsManager, reactVar: ReactParamsType<[number, number, number] | undefined, T>) {
//         super();

//         sceneObjectsManager.addSceneObject(this._editor);
//         this.dispose(() => sceneObjectsManager.deleteSceneObject(this._editor));

//         this.dispose(this._editor.positionChanged.disposableOn(() => this._editor && !this._editor.position && (this._editor.picking = true)));

//         do {
//             if (reactVar instanceof ReactiveVariable) {
//                 if (reactVar.value && (!Array.isArray(reactVar.value) || reactVar.value.length !== 3)) {
//                     break;
//                 }
//             } else {
//                 const [obj, propName] = reactVar;
//                 if (obj[propName] && (!Array.isArray(obj[propName]) || obj[propName].length !== 3)) {
//                     break;
//                 }
//             }

//             this.dispose(bind([this._editor, 'position'], reactVar));
//             this._editor.enabled = true;

//             const updatePicking = () => {
//                 if (this._editor.position === undefined) {
//                     this._editor.picking = true;
//                 }
//             };
//             updatePicking();
//             this.dispose(this._editor.positionChanged.disposableOn(updatePicking));

//             return;
//         } while (false);

//         console.error(`PositionEditing error: 绑定了错误的属性，PositionEditing必须绑定到[number, number, number]类型的属性上！`);
//         throw new Error(`PositionEditing error: 绑定了错误的属性，PositionEditing必须绑定到[number, number, number]类型的属性上！`);
//     }
// }

// export class PositionEditing<T extends { [k: string]: any }> extends Destroyable {
//     private _enabled = this.disposeVar(react(false));
//     get enabled() { return this._enabled.value; }
//     set enabled(value: boolean) { this._enabled.value = value; }
//     get enabledChanged() { return this._enabled.changed; }

//     private _editing: PositionEditingInner<T> | undefined;
//     constructor(sceneObjectsManager: SceneObjectsManager, reactVar: ReactParamsType<[number, number, number] | undefined, T>) {
//         super();

//         // reactiveObj: T, propName: ReactPropKeys<T>

//         this.dispose(this._enabled.changed.disposableOn(enabled => {
//             if (this._editing) {
//                 this._editing.destroy();
//                 this._editing = undefined;
//             }
//             if (enabled) {
//                 this._editing = new PositionEditingInner(sceneObjectsManager, reactVar);
//             }
//         }));

//         this.dispose(() => this._enabled.value = false);
//     }
// }


// // TODO(vtxf): 有待继续优化！
// export { withoutUndefined, withoutUndefinedArray } from "xbsj-xe2/dist-node/xe2-base-utils";

// import { Destroyable, getReactFuncs, react, ReactiveVariable, ReactParamsType } from "xbsj-xe2/dist-node/xe2-base-utils";

// export class WithoutUndefinedReact<T> extends Destroyable {
//     private _isUndefinedReact: ReactiveVariable<boolean>;
//     private _valueReact: ReactiveVariable<Exclude<T, undefined>>;

//     get isUndefinedReact() { return this._isUndefinedReact; }
//     get isUndefined() { return this._isUndefinedReact.value; }
//     set isUndefined(value: boolean) { this._isUndefinedReact.value = value; }
//     get isUndefinedChanged() { return this._isUndefinedReact.changed; }

//     get valueReact() { return this._valueReact; }
//     get value() { return this._valueReact.value; }
//     set value(value: Exclude<T, undefined>) { this._valueReact.value = value; }
//     get valueChanged() { return this._valueReact.changed; }

//     constructor(
//         reactValueWithUndefined: ReactParamsType<T | undefined, any>, 
//         defaultValue: Exclude<T, undefined>,
//         equalsFunc?: (a: Exclude<T, undefined>, b: Exclude<T, undefined>) => boolean,
//         assignFunc?: (newValue: Exclude<T, undefined>, target?: Exclude<T, undefined>) => Exclude<T, undefined>,
//     ) {
//         super();

//         const [getValue, setValue, valueChanged] = getReactFuncs<T | undefined>(reactValueWithUndefined);
//         const currentValue = getValue();
//         this._isUndefinedReact = react(!currentValue);
//         const initialValue = (currentValue ?? defaultValue) as Exclude<T, undefined>;
//         this._valueReact = react<Exclude<T, undefined>>(initialValue, equalsFunc, assignFunc);

//         const update = () => {
//             if (this._isUndefinedReact.value === true) {
//                 setValue(undefined);
//             } else if (this._isUndefinedReact.value === false && this._valueReact.value !== defaultValue) {
//                 setValue(this._valueReact.value);
//             }
//         };
//         this.dispose(this._valueReact.changed.disposableOn(update));
//         this.dispose(this._isUndefinedReact.changed.disposableOn(update));

//         this.dispose(valueChanged.disposableOn(val => {
//             if (val !== undefined) {
//                 this._valueReact.value = val as Exclude<T, undefined>;
//                 this._isUndefinedReact.value = false;
//             } else {
//                 this._isUndefinedReact.value = true;
//                 this._valueReact.value = defaultValue;
//             }
//         }));
//     }
// }

// export class WithoutUndefinedArrayReact<T> extends WithoutUndefinedReact<T[]> {
//     constructor(
//         reactValueWithUndefined: ReactParamsType<T[] | undefined, any>, 
//         defaultValue: T[],
//         elementEqualsFunc?: (a: T, b: T) => boolean,
//         elementAssignFunc?: (s: T, t?: T) => T,
//     ) {
//         super(
//             reactValueWithUndefined,
//             defaultValue,
//             (a, b) => {
//                 // return a.length === b.length && a.every((e, i) => e === b[i]);
//                 return a.length === b.length && a.every((e, i) => elementEqualsFunc && elementEqualsFunc(e, b[i]) || (e === b[i]));
//             },
//             (s, t) => {
//                 const t2 = t || new Array(s.length);
//                 for (let i = 0; i < s.length; ++i) {
//                     // t2[i] = s[i];
//                     t2[i] = elementAssignFunc ? elementAssignFunc(s[i]) : s[i];
//                 }
//                 t2.length = s.length;
//                 return t2 as T[];
//             }
//         );
//     }
// }