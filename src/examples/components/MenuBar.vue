
<script setup lang='ts'>
import { onBeforeUnmount, onMounted, ref, watch, shallowRef } from 'vue';
import PullMenu from "./common/PullMenu.vue";

type defaultType = {
    "type": string,
    "name": string,
    "id": string,
    "url": string
}

const emits = defineEmits(['changeExample', 'run']);

const exampleStr = ref('')
const defaultExample = ref<defaultType>()

const isShow = ref(false)
const dropdownRef = ref<HTMLElement>()

const selectExample = (it: defaultType) => {
    defaultExample.value = it
    getExampleStr()
    isShow.value = false
}

const getExampleStr = () => {
    if (!defaultExample.value) return
    const url = defaultExample.value.url
    fetch(url).then(response => response.text()).then((data) => {
        exampleStr.value = data
    })
}

const offPullMenu = (e: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
        if (isShow.value) {
            isShow.value = false
        }
    }
}

const exampleList = shallowRef<defaultType[]>([])
const getList = () => {
    fetch(`./example.json`).then(response => response.json()).then((data) => {
        if (data && data.exampleList) {
            exampleList.value = data.exampleList
            if (exampleList.value.length > 0) {
                defaultExample.value = { ...exampleList.value[0] }
                getExampleStr()
            }
        }
    }).catch(err => {
        console.error(err)
    })
}

watch(exampleStr, (val) => {
    emits('changeExample', val)
})
onMounted(() => {
    getList()
    addEventListener("click", offPullMenu, false)
})
onBeforeUnmount(() => {
    removeEventListener("click", offPullMenu, false)
})

const openHref = () => {
    if (!defaultExample.value) return
    window.open(defaultExample.value.url)
}

</script>

<template>
    <div
        style="width:100%;height: 50px;display: flex;align-items: center; background-color: #004052;position: relative;">
        <div class="menu_ico" title="示例列表" @click="isShow = !isShow" :class="isShow ?'height_light':''"
            ref="dropdownRef"></div>
        <PullMenu :isShow="isShow" :list="exampleList" @selectExample="selectExample"></PullMenu>
        <div class="code_run" title="运行代码" @click="emits('run')">运行代码»</div>
        <div class="example_name" title="打开示例" v-if="defaultExample" @click="openHref()">{{
            defaultExample.name
        }}</div>
    </div>
</template>

<style scoped>
.menu_ico {
    width: 35px;
    border-radius: 2px;
    height: 30px;
    padding: 5px;
    background: url(../assets/menu.png) no-repeat 50% 50%;
    background-size: 30px 25px;
    cursor: pointer;
    margin-left: 10px;
}

.menu_ico:hover {
    background-color: #1e1e1e;
}

.height_light {
    background-color: #1e1e1e;
}

.code_run {
    width: 150px;
    border-radius: 2px;
    height: 30px;
    line-height: 30px;
    padding: 5px;
    cursor: pointer;
    margin-left: 50px;
    background-color: #4caf50;
    letter-spacing: 1px;
    font-weight: 700;
    user-select: none;
}

.code_run:hover {
    background-color: #56c65a;
}

.example_name {
    margin-left: 100px;
    font-weight: 700;
    cursor: pointer;
}
</style>
