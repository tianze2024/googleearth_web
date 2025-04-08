<template>
  <div ref="treeContainerRef" class="treeContainerRef">
    <div :style="allStyleRef">
      <div :style="topStyleRef">
      </div>
      <div :key="updateKeyRef">
        <slot v-if="!!tree" v-for="treeItem in tree.uiTree.redrawInfo.middleTreeItems" :key="treeItem.id"
          :treeItem="treeItem">
        </slot>
      </div>
      <div :style="bottomStyleRef">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TreeItem } from "xbsj-xe2/dist-node/xe2-utils";
import { createVueDisposer } from "./tools";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Tree, createAnimateFrameWithStartValues, RedrawInfo } from "xbsj-xe2/dist-node/xe2-utils";
import { setExtProp, getExtProp,  } from "xbsj-xe2/dist-node/xe2-base-utils";

const props = withDefaults(defineProps<{
  tree: Tree<TreeItem>,
}>(), {
});

const { tree } = props;

const vueDisposer = createVueDisposer(onBeforeUnmount)

const topStyleRef = ref({});
const allStyleRef = ref({});
const bottomStyleRef = ref({});
const updateKeyRef = ref(0);

function checkTreeItems(redrawInfo: RedrawInfo<TreeItem>) {
  if (redrawInfo.middleTreeItems.some(e => e.isDestroyed())) {
    console.error(`redrawInfo.middleTreeItems.some(e => e.isDestroyed())`);
    debugger;
  }
}

const update = () => {
  checkTreeItems(tree.uiTree.redrawInfo);
  topStyleRef.value = { height: (tree.uiTree.redrawInfo.topUnvisibleItemNum ?? 0) * (tree.itemDivHeight ?? 0) + 'px' }
  bottomStyleRef.value = { height: (tree.uiTree.redrawInfo.bottomUnvisibleItemNum ?? 0) * (tree.itemDivHeight ?? 0) + 'px' }
  const { topUnvisibleItemNum: t, bottomUnvisibleItemNum: b, middleTreeItems: { length: m } } = tree.uiTree.redrawInfo;
  allStyleRef.value = { height: (t + m + b) * tree.itemDivHeight + 'px' }
  updateKeyRef.value++;
}
update()
vueDisposer.dispose(tree.uiTree.redrawEvent.dwon(update))

const treeContainerRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const treeContainer = treeContainerRef.value
  if (!treeContainer) {
    console.error('treeContainerRef is null')
    return
  }
  
  {
    const originDiv = getExtProp<HTMLDivElement | null>(tree.uiTree, '_treeContainer')
    if (originDiv) {
      console.error('tree.uiTree已在其他地方使用，不能再重复使用，除非其他地方先销毁掉！ originDiv', originDiv);
    } else {
      setExtProp<HTMLDivElement | null>(tree.uiTree, '_treeContainer', treeContainer);
    }
  }
  let warned = false;
  const animateFrame = createAnimateFrameWithStartValues(() => {
    const registereDiv = getExtProp<HTMLDivElement | null>(tree.uiTree, '_treeContainer')
    if (registereDiv !== treeContainer) {
      if (!warned) {
        warned = true;
        console.error(`如果registereDiv !== treeContainer，那么Tree.vue组件将不再工作！`);
      }
      return;
    }
    if (treeContainer && tree.uiTree) {
      tree.uiTree.containerScrollTop = treeContainer.scrollTop;
      tree.uiTree.containerClientHeight = treeContainer.clientHeight;
    }
  });
  animateFrame.start();
  onBeforeUnmount(() => {
    animateFrame.destroy()
    setExtProp<HTMLDivElement | null>(tree.uiTree, '_treeContainer', null);
  });
});

</script>

<style scoped>
.treeContainerRef {
  background: #292b2f;
  height: 100%;
  width: 100%;
  height: 100%;
  overflow: auto;
  overflow-anchor: none;
}

.treeContainerRef::-webkit-scrollbar {
    width: 5px;
}

.treeContainerRef::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.treeContainerRef::-webkit-scrollbar-thumb:hover {
    background: #555;
}

</style>
