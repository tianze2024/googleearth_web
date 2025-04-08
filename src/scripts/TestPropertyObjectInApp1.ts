import {
    Boolean2Property, Boolean2sProperty, Boolean3Property, Boolean3sProperty, Boolean4Property, Boolean4sProperty, BooleanProperty, BooleansProperty,
    ColorProperty,
    ColorRgbProperty,
    NumberSliderProperty,
    EvalStringProperty, FunctionProperty, GroupProperty, JsonProperty, LongStringProperty, MinmaxProperty, Number2Property, Number2sProperty, Number3Property, Number3sProperty, Number4Property, Number4sProperty, Number4WithUndefinedProperty, NumberProperty, NumbersProperty,
    String2Property, String2sProperty, String3Property, String3sProperty, String4Property, String4sProperty, StringProperty, StringsProperty
} from "xbsj-xe2/dist-node/xe2-base-objects";
import { extendClassProps, reactArrayWithUndefined, JsonValue, PartialWithUndefinedReactivePropsToNativeProps, ReactivePropsToNativePropsAndChanged } from "xbsj-xe2/dist-node/xe2-base-utils";
import { SceneObjectKey } from "xbsj-xe2/dist-node/xe2-utils";
import { ESSceneObject } from "xbsj-xe2/dist-node/xe2-base-objects";
import { MarkdownProperty, MethodProperty } from "xbsj-xe2/dist-node/xe2-base-objects";

export class TestPropertyObjectInApp1 extends ESSceneObject {
    static readonly type = this.register('TestPropertyObjectInApp1', this, { chsName: '属性测试对象InApp1', tags: ['MiscObjects'], description: "用来测试，非开发不要使用！" });
    get typeName() { return 'TestPropertyObjectInApp1'; }
    override get defaultProps() { return TestPropertyObjectInApp1.createDefaultProps(); }
    get json() { return this._innerGetJson() as JsonType; }
    set json(value: JsonType) { this._innerSetJson(value); }

    static testFunc(testNum: number, testStr: string, testbool: boolean, testStrs: string[], testNums: number[], testbools: boolean[]) {
        console.log("函数参数:", testNum, testStr, testbool, testStrs, testNums, testbools)
    }
    static defaultPropValue = {
        markdown: `
## 此为markdown测试数据

<a href="https://www.baidu.com" target="_blank">新标签页测试</a>

${'```'}js

type ESTreeType = {
    name: string, 
    mesh: string,
    cullingDistance: number, 
    scale: number 
}

${'```'}
`,
        methods: ['参数1', '参数2', '参数3', '参数4', '参数5', '参数6']
    }

    constructor(id?: SceneObjectKey) {
        super(id);

        const update = () => {
            console.log(`testStr: ${this.testStr}`);
        };
        update();
        this.dispose(this.testStrChanged.disposableOn(update));
    }

    override getProperties(language?: string) {
        return [
            ...super.getProperties(language),
            new GroupProperty('number类', 'number类', [
                new NumberProperty('testNum', 'testNum', true, false, [this, 'testNum'], 100),
                new Number2Property('testNum2', 'testNum2', true, false, [this, 'testNum2'], [1, 2]),
                new Number3Property('testNum3', 'testNum3', true, false, [this, 'testNum3'], [1, 2, 3]),
                new Number4Property('testNum4', 'testNum4', true, false, [this, 'testNum4'], [1, 2, 3, 4]),
                new NumbersProperty('testNums', 'testNums', true, false, [this, 'testNums'], [1, 2, 3],),
                new Number2sProperty('testNum2s', 'testNum2s', true, false, [this, 'testNum2s'], [[1, 2], [3, 4]]),
                new Number3sProperty('testNum3s', 'testNum3s', true, false, [this, 'testNum3s'], [[1, 2, 3], [3, 4, 5]]),
                new Number4sProperty('testNum4s', 'testNum4s', true, false, [this, 'testNum4s'], [[1, 2, 4, 5], [3, 4, 4, 5]]),
                new ColorProperty('rgba', 'rgbaColor.', true, false, [this, 'rgbaColor'], [1, 1, 1, 1]),
                new ColorRgbProperty('rgb', 'rgb.', true, false, [this, 'rgbColor'], [1, 1, 1]),
                new MinmaxProperty('minmax', 'minmax.', true, false, [this, 'minmax'], [0, 100]),
                new NumberSliderProperty('opacity', '透明度.', true, false, [this, 'opacity'], .1, [-223, 310], 1),
                new Number4WithUndefinedProperty('padding', 'padding', true, false, [this, 'padding'], [18, undefined, 18, undefined]),
            ]),
            new GroupProperty('string类', 'string类', [
                new StringProperty('testStr', 'testStr', true, false, [this, 'testStr']),
                new String2Property('testStr2', 'testStr2', true, false, [this, 'testStr2'], ['1', '2']),
                new String3Property('testStr3', 'testStr3', true, false, [this, 'testStr3'], ['1', '2', '3']),
                new String4Property('testStr4', 'testStr4', true, false, [this, 'testStr4'], ['1', '2', '3', '4']),
                new StringsProperty('testStrs', 'testStrs', true, false, [this, 'testStrs'], ['a', 'b', 'c'],),
                new String2sProperty('testStr2s', 'testStr2s', true, false, [this, 'testStr2s'], [['1', '2'], ['3', '4']]),
                new String3sProperty('testStr3s', 'testStr3s', true, false, [this, 'testStr3s'], [['1', '2', '3'], ['3', '4', '5']]),
                new String4sProperty('testStr4s', 'testStr4s', true, false, [this, 'testStr4s'], [['1', '2', '4', '5'], ['3', '4', '4', '5']]),
            ]),
            new GroupProperty('boolean类', 'boolean类', [
                new BooleanProperty('testbool', 'testbool', true, false, [this, 'testbool'], false),
                new Boolean2Property('testbool2', 'testbool2', true, false, [this, 'testbool2'], [true, true]),
                new Boolean3Property('testbool3', 'testbool3', true, false, [this, 'testbool3'], [true, true, true]),
                new Boolean4Property('testbool4', 'testbool4', true, false, [this, 'testbool4'], [true, true, true, true]),
                new BooleansProperty('testbools', 'testbools', true, false, [this, 'testbools'], [true, false, false]),
                new Boolean2sProperty('testbool2s', 'testbool2s', true, false, [this, 'testbool2s'], [[true, true], [true, true]]),
                new Boolean3sProperty('testbool3s', 'testbool3s', true, false, [this, 'testbool3s'], [[true, true, true], [true, true, true]]),
                new Boolean4sProperty('testbool4s', 'testbool4s', true, false, [this, 'testbool4s'], [[true, true, true, true], [true, true, true, true]]),
            ]),
            new GroupProperty('json类', 'json类', [
                new JsonProperty('json格式', 'jsonValue', true, false, [this, 'jsonValue'], undefined, TestPropertyObjectInApp1.defaultPropValue.markdown),
                new EvalStringProperty('js函数', 'js创建函数', true, false, [this, 'jsCode'], undefined, TestPropertyObjectInApp1.defaultPropValue.markdown),
                new LongStringProperty('longText', 'longText', true, false, [this, 'longText'], undefined, TestPropertyObjectInApp1.defaultPropValue.markdown),
                new MarkdownProperty('Markdown', 'Markdown', false, false, [this, 'markdown']),
                new FunctionProperty("测试方法", "测试方法",
                    ['number', 'string', 'boolean', 'strings', 'numbers', 'booleans'],
                    (testNum: number, testStr: string, testbool: boolean, testStrs: string[], testNums: number[], testbools: boolean[]) =>
                        TestPropertyObjectInApp1.testFunc(testNum, testStr, testbool, testStrs, testNums, testbools),
                    [100, '测试字符串', true, ['a', 'b', 'c'], [1, 2, 3], [true, false, false]])
            ]),
            new MethodProperty("测试函数", "测试函数",
                TestPropertyObjectInApp1.defaultPropValue.methods,
                (testNum: number, testStr: string, testbool: boolean, testStrs: string[], testNums: number[], testbools: boolean[]) =>
                    TestPropertyObjectInApp1.testFunc(testNum, testStr, testbool, testStrs, testNums, testbools),
                [100, '测试字符串', true, ['a', 'b', 'c'], [1, 2, 3], [true, false, false]])
        ];
    }
}

export namespace TestPropertyObjectInApp1 {
    export const createDefaultProps = () => ({
        testNum: undefined as number | undefined,
        testNum2: reactArrayWithUndefined<[number, number] | undefined>(undefined),
        testNum3: reactArrayWithUndefined<[number, number, number] | undefined>(undefined),
        testNum4: reactArrayWithUndefined<[number, number, number, number] | undefined>(undefined),
        testNums: reactArrayWithUndefined<number[] | undefined>(undefined),
        testNum2s: reactArrayWithUndefined<[number, number][] | undefined>(undefined),
        testNum3s: reactArrayWithUndefined<[number, number, number][] | undefined>(undefined),
        testNum4s: reactArrayWithUndefined<[number, number, number, number][] | undefined>(undefined),
        rgbaColor: reactArrayWithUndefined<[number, number, number, number] | undefined>(undefined),
        rgbColor: reactArrayWithUndefined<[number, number, number] | undefined>(undefined),
        minmax: reactArrayWithUndefined<[number, number] | undefined>(undefined),
        opacity: undefined as number | undefined,
        padding: reactArrayWithUndefined<[number | undefined, number | undefined, number | undefined, number | undefined] | undefined>(undefined),

        testStr: undefined as string | undefined,
        testStr2: reactArrayWithUndefined<[string, string] | undefined>(undefined),
        testStr3: reactArrayWithUndefined<[string, string, string] | undefined>(undefined),
        testStr4: reactArrayWithUndefined<[string, string, string, string] | undefined>(undefined),
        testStrs: reactArrayWithUndefined<string[] | undefined>(undefined),
        testStr2s: reactArrayWithUndefined<[string, string][] | undefined>(undefined),
        testStr3s: reactArrayWithUndefined<[string, string, string][] | undefined>(undefined),
        testStr4s: reactArrayWithUndefined<[string, string, string, string][] | undefined>(undefined),

        testbool: undefined as boolean | undefined,
        testbool2: undefined as [boolean, boolean] | undefined,
        testbool3: undefined as [boolean, boolean, boolean] | undefined,
        testbool4: undefined as [boolean, boolean, boolean, boolean] | undefined,
        testbools: undefined as boolean[] | undefined,
        testbool2s: undefined as [boolean, boolean][] | undefined,
        testbool3s: undefined as [boolean, boolean, boolean][] | undefined,
        testbool4s: undefined as [boolean, boolean, boolean, boolean][] | undefined,

        jsonValue: undefined as JsonValue | undefined,
        jsCode: undefined as string | undefined,
        longText: undefined as string | undefined,
        markdown: TestPropertyObjectInApp1.defaultPropValue.markdown,

        ...ESSceneObject.createDefaultProps(),
    });
}
extendClassProps(TestPropertyObjectInApp1.prototype, TestPropertyObjectInApp1.createDefaultProps);
export interface TestPropertyObjectInApp1 extends ReactivePropsToNativePropsAndChanged<ReturnType<typeof TestPropertyObjectInApp1.createDefaultProps>> { }
type JsonType = PartialWithUndefinedReactivePropsToNativeProps<ReturnType<typeof TestPropertyObjectInApp1.createDefaultProps> & { type: string }>;
