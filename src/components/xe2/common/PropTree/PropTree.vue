<template>
  <TreeComp :tree="propTree as unknown as Tree<TreeItem>" @click.self="propTree.uiTree.clearAllSelectedItems()"
    @blur="propTree.uiTree.clearAllSelectedItems()">
    <template v-slot:default="slotProps">
      <PropTreeItemCom :showCheckBox="showCheckBox"
        :treeItem="(slotProps.treeItem as unknown as GroupPropTreeItem | LeafPropTreeItem)" :key="slotProps.key"
        @callback="callback"
        :tree="propTree"
        >
      </PropTreeItemCom>
    </template>
  </TreeComp>
</template>

<script setup lang="ts">

import TreeComp from "../../Tree.vue";
import { TreeItem, Tree, LeafPropTreeItem, GroupPropTreeItem, PropTree } from "xbsj-xe2/dist-node/xe2-base-objects";
import { PropertyCompCallbackFuncParamsType } from "./Properties/base";
import PropTreeItemCom from "./PropTreeItem.vue";

// document.oncontextmenu = () => {
//   //阻止默认右键事件
//   return false;
// };

const props = withDefaults(defineProps<{
  propTree: PropTree;
  showCheckBox: boolean;
}>(), {
  showCheckBox: false,
});
const emits = defineEmits<{
  (e: 'callback', params: PropertyCompCallbackFuncParamsType & { treeItem: GroupPropTreeItem | LeafPropTreeItem, propTree: PropTree }): void;
}>();

const { propTree } = props;

const callback = (params: PropertyCompCallbackFuncParamsType & { treeItem: GroupPropTreeItem | LeafPropTreeItem }): void => {
  emits('callback', { propTree, ...params });
};

</script>

<style scoped>
.treeContainerRef {
  background: #292b2f;
  width: 100%;
  overflow: auto;
  overflow-anchor: none;
}
</style>
