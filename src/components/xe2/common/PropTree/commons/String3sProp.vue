
<script setup lang='ts'>
import { ref } from 'vue';
import Window from "../../Window.vue";
type String3s = [string, string, string][]
const props = withDefaults(defineProps<{
    modelValue?: String3s,
    defaultValue?: String3s,
    withUndefined?: boolean
    readonly?: boolean,
    propertyName?: string
}>(), { withUndefined: true, propertyName: '属性值', readonly: false });

const emits = defineEmits(['update:modelValue']);

const viewsShow = ref(false)
const string3sVueRef = ref<String3s>([])
const timers = ref<NodeJS.Timeout>()

const inputHandler = (e: any, index: number, num: number) => {
    clearTimeout(timers.value)
    timers.value = setTimeout(() => {
        const string3Value = [...(JSON.parse(JSON.stringify(string3sVueRef.value)))] as String3s
        string3Value[index][num] = String(e.target.value)
        string3sVueRef.value = string3Value
    }, 200);
}

const addString = () => {
    string3sVueRef.value.push(['', '', ''])
}

const toString3s = () => {
    if (props.modelValue === undefined) {
        const arr = JSON.parse(JSON.stringify(props.defaultValue ?? [])) as String3s
        string3sVueRef.value = [...arr]
    } else {
        const arr = JSON.parse(JSON.stringify(props.modelValue)) as String3s
        string3sVueRef.value = [...arr]
    }
    viewsShow.value = true
}

const ok = () => {
    const arr = JSON.parse(JSON.stringify(string3sVueRef.value)) as String3s
    emits('update:modelValue', [...arr])
    viewsShow.value = false
}
const cancel = () => {
    string3sVueRef.value = []
    viewsShow.value = false
}

</script>

<template>
    <div class="prop_box">
        <div class="prop_edit">
            <span class="is_undefined">{{ (modelValue === undefined) ? '未设置' : '' }}</span>
            <span class="set_btn" @click.stop="toString3s" :title="`${readonly ? '查看' : '设置'}${propertyName}`">⚙</span>
        </div>
        <span v-if="withUndefined && (modelValue !== undefined) && !readonly" class="set_btn"
            @click.stop="emits('update:modelValue', undefined)" title="设为undefined">╳</span>
    </div>
    <Window :show="viewsShow" :title="propertyName" :onlyButton="false" :readonly="readonly" :width="600" :height="400"
        :isFocus="true" @cancel="cancel" @ok="ok">
        <div class="prop_list" :class="{ 'readonly_style': readonly }">
            <div class="value_box">
                <span class="set_btn" @click.stop="addString()" title="添加" :class="{ 'readonly_true': readonly }">+</span>
            </div>
            <div class="value_box" v-for="(item, index) in string3sVueRef" :key="index">
                <input type="number" v-model.lazy="item[0]" @input="inputHandler($event, index, 0)" :disabled="readonly" />
                <input type="number" v-model.lazy="item[1]" @input="inputHandler($event, index, 1)" :disabled="readonly" />
                <input type="number" v-model.lazy="item[2]" @input="inputHandler($event, index, 2)" :disabled="readonly" />
                <span class="set_btn" @click.stop="string3sVueRef.splice(index, 1)" title="删除"
                    :class="{ 'readonly_true': readonly }">╳</span>
            </div>
        </div>
    </Window>
</template>

<style scoped>
.prop_box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
}


.prop_edit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
}

.prop_list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.value_box {
    width: 90%;
    display: flex;
    justify-content: flex-end;
    margin: 5px 0px;
    align-items: center;
}

.value_box>input {
    width: 30%;
    height: 20px;
    background: #065164;
    color: #fff;
    border: 1px solid #292b2f;
    font-size: 12px;
    margin-right: 1px;
    padding: 0 10px;
}
input::selection {
    background: rgb(0, 200, 255);
    color: rgb(23, 22, 23);
}
.set_btn {
    width: 20px;
    height: 20px;
    font-size: 14px;
    line-height: 22px;
    margin-left: 10px;
    border-radius: 3px;
    text-align: center;
    cursor: pointer;
}

.is_undefined {
    width: 36px;
    font-size: 12px;
    text-align: center;
}

.set_btn:hover {
    background-color: #383838;
}

.readonly_true {
    pointer-events: none;
    user-select: none;
}

.readonly_style {
    cursor: not-allowed;
    cursor: no-drop;
    user-select: none;
}
</style>
