<template>
    <div class="convert-content">
        <div class="close">
            <span @click="close">x</span>
        </div>
        <div class="change">
            <!-- <span @click="searchContent = '${czm-path}'">czm-path</span> -->
            <span @click="czmPathClick('${czm-path}')">czm-path</span>
            <span @click="czmPathClick('${czmlab-path}')">czmlab-path</span>
            <span @click="czmPathClick('${xe2-assets-script-dir}')">scene-manager-script-dir</span>
        </div>
        <div class="input-div">
            <div>
                <input type="text" placeholder="请输入您要查询的环境变量..." v-model="searchContent" @change="search" ref="searchInput">
                <span class="button-span" @click="searchContent = ''">清空</span>
            </div>
            <div>
                <input type="text" v-model="transformContent" readonly>
                <span class="button-span" @click="copy">复制</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { copyClipboard } from '@/components/xe2/utility/copyClipboard';
import { ref, watch } from 'vue'
import { SceneObject } from 'xbsj-xe2/dist-node/xe2-base-objects';
const searchContent = ref('${xe2-assets-script-dir}/xe2-assets/scene-manager/images/location.png')
const transformContent = ref('')
const emits = defineEmits(["close"]);
const searchInput = ref<HTMLElement>()

const search = () => {
    transformContent.value = SceneObject.context.getStrFromEnv(searchContent.value)
}
watch(searchContent, val => {
    transformContent.value = SceneObject.context.getStrFromEnv(val)
}, { immediate: true })
const copy = () => {
    copyClipboard(transformContent.value)
}
const close = () => {
    emits('close')
}
const czmPathClick = (type: string) => {
    //@ts-ignore
    searchContent.value = searchContent.value.slice(0, searchInput.value.selectionStart) + type + searchContent.value.slice(searchInput.value.selectionEnd)
}
</script>
<style scoped>
.convert-content {
    width: 600px;
    height: 200px;
    color: #fff;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.4);
    background-color: #292b2f;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ffffff96;
    z-index: 5000;
}

.close {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: right;
    align-items: center;
    padding: 10px 20px 0 20px;
    box-sizing: border-box;
    font-size: 20px;
    cursor: pointer;
}

.change {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: left;
    align-items: center;
    padding: 10px 20px 0 20px;
    box-sizing: border-box;
    font-size: 20px;
}

.change>span {
    width: auto;
    height: 24px;
    text-align: center;
    line-height: 24px;
    background: #003847;
    color: #fff;
    border: 1px solid #384b50;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    padding: 0 10px;
    margin-right: 10px;
}

.input-div {
    width: 100%;
    height: 170px;
    display: flex;
    flex-direction: column;
    align-items: normal;
    justify-content: space-evenly;
    padding: 0 20px;
    box-sizing: border-box;
}


.input-div>div {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.input-div>div>input {
    flex: 1;
    height: 24px;
    background: #003847;
    color: #fff;
    border: 1px solid #384b50;
    outline: 1px solid #384b50;
    font-size: 12px;
    border-radius: 5px;
}

.button-span {
    /* display: inline-block; */
    width: 40px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    background: #0d2b34;
    color: #fff;
    border: 1px solid #384b50;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
}

.button-span:hover {
    background: #292b2f;
}
</style>