<template>
    <div class="view_box" ref="viewersContainer" >
    </div>
</template>

<script setup lang="ts">
import { ProjectManager } from "xbsj-xe2/dist-node/xe2";
import { onBeforeUnmount, onMounted, shallowRef } from "vue";
import { CzmViewer } from "xbsj-xe2/dist-node/xe2-cesium-objects";

const props = withDefaults(defineProps<{
    projectManager: ProjectManager
}>(), {});
const viewersContainer = shallowRef<HTMLDivElement>();

const { projectManager } = props;
// const dragover = (event: any) => {
//     event.preventDefault();
// }
// const drop = (event: any) => {
//     event.preventDefault();
//     // move dragged element to the selected drop target
//     console.log(11111);
//     const setviewers = projectManager.viewersManager.viewers
//     const viewers = [...setviewers]
//     const viewer = viewers[0] as CzmViewer
//     if (!viewer) return
//     console.log(viewer);
//     if (!viewer.extensions?.cursorPositionInfo.enabled) {
//         //@ts-ignore
//         viewer.extensions.cursorPositionInfo.enabled = true
//     }
//     const mousePosition = viewer.extensions?.cursorPositionInfo.cursorPosition
//     console.log(mousePosition);
//     viewer.interaction.pointerUpEvent.disposableOn(() => {
//         console.log(111);
//         // const mousePosition = viewer.extensions?.cursorPositionInfo.cursorPosition
//         // console.log(mousePosition);
//     })
// }
onMounted(() => {
    const container = viewersContainer.value;
    if (!container) {
        alert(`cannot get viewersContainer!`);
    }
    projectManager.defaultContainer = container;
    onBeforeUnmount(() => {
        projectManager.defaultContainer = undefined;
    });

});

</script>
<style scoped>
.view_box {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}
</style>
