<template>
    <Number2sProp v-model="number2sRef" :propertyName="propertyName" :defaultValue="defaultValue" :readonly="readonly"
        :withUndefined="withUndefined">
    </Number2sProp>
</template>

<script setup lang="ts">
import { createVueDisposer, toReadonlyVueRef, toVR } from "../../../tools";
import { onBeforeUnmount } from "vue";
import { Number2sProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import { PropertyCompCallbackFuncParamsType } from "./base";
import Number2sProp from "../commons/Number2sProp.vue"

const props = withDefaults(defineProps<{
    property: Number2sProperty;
}>(), {
});
const emits = defineEmits<{
    (e: 'callback', params: PropertyCompCallbackFuncParamsType): void;
}>();
type Number2s = [number, number][]
const { property } = props
const readonly = property.readonly
const propertyName = property.name
const withUndefined = property.withUndefined;
const defaultValue = property.defaultValue ?? [];
const disposer = createVueDisposer(onBeforeUnmount)
const number2sRef = readonly ? toReadonlyVueRef<Number2s | undefined>(disposer, property.reactVar, s => s && ([...s] as Number2s)) : toVR<Number2s | undefined>(disposer, property.reactVar, s => s && ([...s] as Number2s))

</script>
<style scoped>
</style>
