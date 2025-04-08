<template>
    <String4sProp v-model="number4sRef" :propertyName="propertyName" :defaultValue="defaultValue" :readonly="readonly"
        :withUndefined="withUndefined">
    </String4sProp>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { String4sProperty } from "xbsj-xe2/dist-node/xe2-base-objects";
import { createVueDisposer, toReadonlyVueRef, toVR } from "../../../tools";
import String4sProp from "../commons/String4sProp.vue";
import { PropertyCompCallbackFuncParamsType } from "./base";

const props = withDefaults(defineProps<{
    property: String4sProperty;
}>(), {
});
const emits = defineEmits<{
    (e: 'callback', params: PropertyCompCallbackFuncParamsType): void;
}>();

type String4s = [string, string, string, string][]
const { property } = props
const readonly = property.readonly
const propertyName = property.name
const withUndefined = property.withUndefined;
const disposer = createVueDisposer(onBeforeUnmount)
const number4sRef = readonly ? toReadonlyVueRef<String4s | undefined>(disposer, property.reactVar, s => s && ([...s] as String4s)) : toVR<String4s | undefined>(disposer, property.reactVar, s => s && ([...s] as String4s))
const defaultValue: String4s = property.defaultValue ?? []

</script>
<style scoped>
</style>
