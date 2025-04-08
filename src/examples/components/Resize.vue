
<script setup lang='ts'>
import { computed, ref } from 'vue';
withDefaults(defineProps<{ showSceneTreeViewRef?: boolean }>(), { showSceneTreeViewRef: true });
const leftWidth = ref(600)
const showBar = ref(false)
const dragEagle = (e: MouseEvent) => {
    if (!showBar.value) return
    const leftDomWidth = leftWidth.value
    const startX = e.clientX
    onmousemove = function (e) {
        e.preventDefault()
        const distX = Math.abs(e.clientX - startX)
        if (e.clientX > startX) {
            leftWidth.value = leftDomWidth + distX
        } else {
            leftWidth.value = leftDomWidth - distX
        }
    }
    onmouseup = function () {
        onmousemove = null
    }
}
const opacityVal = computed(() => {
    if (showBar.value) {
        return 1
    } else {
        return 0
    }
})
</script>
<template>
    <div class="box">
        <div class="left" :style="{ width: leftWidth + 'px' }" v-show="showSceneTreeViewRef">
            <slot name="code"></slot>
        </div>
        <div class="resize" @mousedown="dragEagle" v-show="showSceneTreeViewRef" @mouseover.prevent="showBar = true"
            @mouseout.prevent="showBar = false" :style="{ left: (leftWidth - 2) + 'px', opacity: opacityVal }">
        </div>
        <div class="right" :style="{ width: `calc(100% - ${leftWidth}px)` }"
            :class="(!showSceneTreeViewRef) ? 'resize-all' : ''">
            <slot name="earth"></slot>
        </div>
    </div>
</template>
<style scoped>
.box {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
}

.left {
    height: 100%;
    background-color: #001921;
}

.resize {
    width: 4px;
    position: absolute;
    z-index: 1;
    height: 100%;
    border: none;
    background-color: #004052;
    cursor: col-resize;
    transition: opacity 0.2s ease;
}

.right {
    height: 100%;
}

.resize-all {
    width: 100% !important;
    height: 100% !important;
}
</style>
