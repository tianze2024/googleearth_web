<template>
    <div v-show="isShow">经度: {{ longitude }}° 纬度: {{ latitude }}° 高度: {{ height }}米 偏航角: {{ yaw }}° 俯仰角: {{ PitchAngle
    }}° 翻滚角:{{ rollAngle }}° {{
    showMousePosition ? `鼠标位置:${mousePositioLongitude}° ${mousePositioLatitude}° ${mousePositioHeight}m` :
    '暂时无法获取鼠标位置...' }}
    </div>
</template>
<script setup lang="ts">
import { CzmViewer } from "xbsj-xe2/dist-node/xe2-cesium-objects";
import { ProjectManager } from 'xbsj-xe2/dist-node/xe2';
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { createAnimateFrameWithStartValues } from 'xbsj-xe2/dist-node/xe2-utils';
const props = withDefaults(defineProps<{
    projectManager: ProjectManager;
}>(), {
});
// const { appProjectManager } = props
const longitude = ref()
const latitude = ref()
const height = ref()
const yaw = ref()
const PitchAngle = ref()
const rollAngle = ref()
const showMousePosition = ref()
const mousePositioLongitude = ref()
const mousePositioLatitude = ref()
const mousePositioHeight = ref()
const isShow = ref(true)

onMounted(() => {
    const animateFrame = createAnimateFrameWithStartValues(() => {
        const viewers = props.projectManager.viewersManager.viewers
        const viewer = [...viewers][0] as CzmViewer
        if (!viewer.extensions?.cursorPositionInfo.enabled) {
            //@ts-ignore
            viewer.extensions.cursorPositionInfo.enabled = true
        }
        if (!viewer) {
            isShow.value = false
        } else {
            isShow.value = true
            const cameraInfo = viewer.getCameraInfo()
            if (cameraInfo) {
                const earthPosition = cameraInfo.position
                longitude.value = earthPosition[0].toFixed(5)
                latitude.value = earthPosition[1].toFixed(5)
                height.value = earthPosition[2].toFixed(2)
                const earthRotation = cameraInfo.rotation
                yaw.value = earthRotation[0].toFixed(2)
                PitchAngle.value = earthRotation[1].toFixed(2)
                rollAngle.value = earthRotation[2].toFixed(2)
            }


            const mousePosition = viewer.extensions?.cursorPositionInfo.cursorPosition
            if (mousePosition) {
                showMousePosition.value = true
                mousePositioLongitude.value = mousePosition[0].toFixed(5)
                mousePositioLatitude.value = mousePosition[1].toFixed(5)
                mousePositioHeight.value = mousePosition[2].toFixed(2)
            } else {
                showMousePosition.value = false
            }
        }

    });
    animateFrame.start();
    onBeforeUnmount(() => animateFrame.destroy());
});

</script>
<style scoped>
div {
    width: 100%;
    height: 30px;
    background: rgba(71, 71, 71, 0.8);
    position: fixed;
    bottom: 0px;
    font-size: 14px;
    line-height: 30px;
    z-index: 9999;
    color: #fff;
}

div>span {
    width: auto;
    float: right;
    margin-right: 20px;
}
</style>