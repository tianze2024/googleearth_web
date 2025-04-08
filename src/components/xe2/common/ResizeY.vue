
<script setup lang='ts'>
import { ref } from 'vue';
const props = withDefaults(defineProps<{
    showPlayerViewRef: boolean
}>(), {
    showPlayerViewRef: false,
});
const topDom = ref<HTMLElement>()
const resizeDom = ref<HTMLElement>()
const bottomDom = ref<HTMLElement>()

const dragEagle = (e: MouseEvent) => {
    if (!topDom.value || !resizeDom.value || !bottomDom.value) {
        return
    }
    const topDomHeight = topDom.value.offsetHeight
    const bottomDomHeight = bottomDom.value.offsetHeight
    const startY = e.clientY
    onmousemove = function (e) {
        if (!topDom.value || !resizeDom.value || !bottomDom.value) {
            return
        }
        e.preventDefault()
        const distY = Math.abs(e.clientY - startY)
        if (e.clientY > startY) {
            topDom.value.style.height = topDomHeight + distY + 'px'
            bottomDom.value.style.height = bottomDomHeight - distY + 'px'
        } else {
            topDom.value.style.height = topDomHeight - distY + 'px'
            bottomDom.value.style.height = bottomDomHeight + distY + 'px'
        }
    }
    onmouseup = function () {
        onmousemove = null
    }
}

</script>

<template>
    <div class="box">
        <div class="top" ref="topDom" :class="(!showPlayerViewRef) ? 'resize-all' : ''">
            <slot name="earth"></slot>
        </div>
        <div class="resize" ref="resizeDom" @mousedown="dragEagle" v-show="showPlayerViewRef"></div>
        <div class="bottom" ref="bottomDom" v-show="showPlayerViewRef">
            <slot name="player"></slot>
        </div>
    </div>

</template>

<style scoped>
.box {
    width: 100%;
    height: 100%;
}

.top {
    width: 100%;
    height: calc(80% - 4px);
}

.resize {
    width: 100%;
    height: 4px;
    border: none;
    background-color: #292b2f;
    cursor: row-resize;
}

.resize:hover {
    background-color: #004052;
}

.bottom {
    width: 100%;
    height: 20%;
}

.resize-all {
    width: 100% !important;
    height: 100% !important;
}
</style>
