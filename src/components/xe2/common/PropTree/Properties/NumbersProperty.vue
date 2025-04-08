<template>
    <NumbersProp :propertyName="propertyName" :withUndefined="withUndefined" :defaultValue="defaultValue"
        v-model="numbersRef" :readonly="readonly">
    </NumbersProp>
</template>
<script setup lang="ts">
import { createVueDisposer, toReadonlyVueRef, toVR } from "../../../tools";
import { NumbersProperty } from "xbsj-xe2/dist-node/xe2-base-objects"
import { onBeforeUnmount } from "vue"
import NumbersProp from "../commons/NumbersProp.vue"
import { PropertyCompCallbackFuncParamsType } from "./base";

const props = withDefaults(defineProps<{
    property: NumbersProperty
}>(), {
})
const emits = defineEmits<{
    (e: 'callback', params: PropertyCompCallbackFuncParamsType): void;
}>();

const { property } = props
const readonly = property.readonly
const propertyName = property.name
const withUndefined = property.withUndefined
const disposer = createVueDisposer(onBeforeUnmount)
const numbersRef = readonly ? toReadonlyVueRef<number[] | undefined>(disposer, property.reactVar, s => s && ([...s] as number[])) : toVR<number[] | undefined>(disposer, property.reactVar, s => s && ([...s] as number[]))
const defaultValue: number[] = property.defaultValue ?? []

</script>

<style scoped>
</style>
