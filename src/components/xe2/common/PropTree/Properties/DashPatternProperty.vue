
<template>
    <div class="readonly_flag" :class="readonly ? 'readonly_true' : ''">
        <DashPatternProp :withUndefined="withUndefined" :defaultValue="defaultValue" :readonly="readonly"
            v-model="dashPatternRef"></DashPatternProp>
    </div>
</template>

<script setup lang='ts'>
import { createVueDisposer, toReadonlyVueRef, toVR } from "../../../tools";
import { onBeforeUnmount } from "vue";
import { DashPatternProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import DashPatternProp from "../commons/DashPatternProp.vue"
import { PropertyCompCallbackFuncParamsType } from "./base";

const props = withDefaults(defineProps<{
    property: DashPatternProperty;
}>(), {
});
const emits = defineEmits<{
    (e: 'callback', params: PropertyCompCallbackFuncParamsType): void;
}>();

const { property } = props
const withUndefined = property.withUndefined
const readonly = property.readonly
const disposer = createVueDisposer(onBeforeUnmount)
const dashPatternRef = readonly ? toReadonlyVueRef<number | undefined>(disposer, property.reactVar, s => s) : toVR<number | undefined>(disposer, property.reactVar, s => s)
const defaultValue: number | undefined = property.defaultValue

</script>


<style scoped>
.readonly_flag {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
}

.readonly_true {
    cursor: not-allowed;
    cursor: no-drop;
}
</style>
