
<template>
    <div class="readonly_flag" :class="readonly ? 'readonly_true' : ''">
        <Boolean4sProp :withUndefined="withUndefined" :defaultValue="defaultValue" :readonly="readonly"
            v-model="boolean4sRef">
        </Boolean4sProp>
    </div>
</template>

<script setup lang="ts">
import { createVueDisposer, toReadonlyVueRef, toVR } from "../../../tools";
import { onBeforeUnmount } from "vue";
import { Boolean4sProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import Boolean4sProp from "../commons/Boolean4sProp.vue";
import { PropertyCompCallbackFuncParamsType } from "./base";

const props = withDefaults(defineProps<{
    property: Boolean4sProperty;
}>(), {
});
const emits = defineEmits<{
    (e: 'callback', params: PropertyCompCallbackFuncParamsType): void;
}>();

const { property } = props
const withUndefined = property.withUndefined
const readonly = property.readonly
const disposer = createVueDisposer(onBeforeUnmount)
const boolean4sRef = readonly ? toReadonlyVueRef<[boolean,boolean,boolean,boolean][] | undefined>(disposer, property.reactVar, s => s && ([...s] as [boolean,boolean,boolean,boolean][])) : toVR<[boolean,boolean,boolean,boolean][] | undefined>(disposer, property.reactVar, s => s && ([...s] as [boolean,boolean,boolean,boolean][]))
const defaultValue: [boolean,boolean,boolean,boolean][] | undefined = property.defaultValue

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

