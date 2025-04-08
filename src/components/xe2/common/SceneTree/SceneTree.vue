<template>
  <TreeComp :tree="(sceneTree as unknown as Tree<TreeItem>)" @click="sceneTree.sceneUiTree.clearAllSelectedItems()"
    @blur="sceneTree.sceneUiTree.clearAllSelectedItems()" @contextmenu.stop.prevent="emits('contexMenuEvent', undefined)">
    <template v-slot:default="slotProps">
      <SceneTreeItemComp :showCheckBox="showCheckBox"
        :sceneTreeItem="(slotProps.treeItem as unknown as SceneTreeItem)" :key="slotProps.key"
        @contexMenuEvent="sceneUiTreeObject => emits('contexMenuEvent', sceneUiTreeObject)"
        :isLastSelectedObject="(slotProps.treeItem as unknown as SceneTreeItem) === sceneTree.lastSelectedItem"
        :tree="sceneTree"
        >
      </SceneTreeItemComp>
    </template>
  </TreeComp>
  <ContextMenuCom :baseItems="menuContent"></ContextMenuCom>
</template>
<script setup lang="ts">
import { SceneTreeItem, TreeItem, Tree, SceneTree } from "xbsj-xe2/dist-node/xe2";
import ContextMenuCom from "../../common/ContextMenuCom.vue";
import TreeComp from "../../Tree.vue";
import SceneTreeItemComp from "./SceneTreeItem.vue";

type MenuContentType = {
  text: string;
  keys: string;
  func: () => void;
} | {
  type: "divider",
}

const props = withDefaults(defineProps<{
  sceneTree: SceneTree,
  nameTitle: string;
  showCheckBox: boolean;
  menuContent: Array<MenuContentType>,
}>(), {
  nameTitle: '场景树',
  showCheckBox: false,
  menuContent: () => []
});

const emits = defineEmits<{
  (e: 'contexMenuEvent', sceneTreeItem: SceneTreeItem | undefined): void;
}>()

</script>

