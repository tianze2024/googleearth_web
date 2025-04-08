<template>
    <div class="scene-tree-wrapper">
        <Expand :dragEnableX="false" :showResize="isShowTree">
            <SceneTreeHeader :sceneHeadList="getSceneHeadList()" :isShowTree="isShowTree" @changeShowTree="changeShowTree"
                :nameTitle="nameTitle">
            </SceneTreeHeader>
            <div v-if="isShowTree" class="scene-tree-comp">
                <SceneTreeComp :nameTitle="nameTitle" @contexMenuEvent="contexMenuEvent" :menuContent="menuContent"
                    :showCheckBox="showCheckBox" :sceneTree="sceneTree">
                </SceneTreeComp>
            </div>
        </Expand>

    </div>
    <JsonStringProp :jsonStr="importJsonStr" :isShow="importJsonStr !== ''" @getJsonStr="getJsonStr"
        @changeShow="importJsonStr = ''">
    </JsonStringProp>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, shallowRef } from "vue";
import { ProjectManager, SceneTree, SceneTreeItem } from "xbsj-xe2/dist-node/xe2";
import { getSaveFileHandle, Player, saveFile, GeoPolyline, GeoPolylines, View, ViewCollection } from "xbsj-xe2/dist-node/xe2-base-objects";
import { ESCameraViewCollection, ESPlayer } from "esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main";
import { JsonValue } from "xbsj-xe2/dist-node/xe2-base-utils";
import { Tree, TreeItemInsertFlag } from 'xbsj-xe2/dist-node/xe2-utils';
import { CzmSignalTransmission, CzmSignalTransmissionCollection } from 'xbsj-xe2/dist-node/xe2-cesium-objects';
import Expand from "../../common/Expand.vue";
import { createVueDisposer, toVR } from '../../tools';
import Confirm from "../../utility/Confirm";
import { copyClipboard } from "../../utility/copyClipboard";
import Message from "../../utility/Message";
import JsonStringProp from '../PropTree/commons/JsonStringProps.vue';
import SceneTreeComp from "./SceneTree.vue";
import SceneTreeHeader from "./SceneTreeHeader.vue";

type menuContentType = {
    text: string;
    keys: string;
    func: () => void;
} | {
    type: "divider",
}

const props = withDefaults(defineProps<{
    sceneTree: SceneTree;
    projectManager: ProjectManager,
    getSceneObjectTypeFunc: () => Promise<string>;
    nameTitle?: string;
}>(), {
    nameTitle: '场景树',

});

const { sceneTree, projectManager, getSceneObjectTypeFunc } = props

const { sceneUiTree } = sceneTree;

const d = createVueDisposer(onBeforeUnmount)

const disposer = createVueDisposer(onBeforeUnmount);
const currentPlayerRef = toVR<Player | undefined>(disposer, [projectManager, "currentPlayer"]) as Ref<Player | undefined>
const showPlayerViewRef = toVR<boolean>(disposer, [projectManager, "showPlayerView"])

const currenESCameraViewCollectionRef = toVR<ESCameraViewCollection | undefined>(disposer, [projectManager, "currenESCameraViewCollection"]) as Ref<ESCameraViewCollection | undefined>
const showESViewCollectionVue3UIRef = toVR<boolean>(disposer, [projectManager, "showESViewCollectionVue3UI"])

const currentESPlayerRef = toVR<ESPlayer | undefined>(disposer, [projectManager, "currentESPlayer"]) as Ref<ESPlayer | undefined>
const showESPlayerVue3UIRef = toVR<boolean>(disposer, [projectManager, "showESPlayerVue3UI"])

const currentTreeItem = shallowRef<SceneTreeItem | undefined>(undefined)
const seatp = ref<TreeItemInsertFlag | undefined>()

const showCheckBox = ref(false)
const isShowTree = ref(true)

const importJsonStr = ref('')
const jsonLocation = ref()

const isempty = ref()

const changeShowTree = (flag: boolean) => {
    isShowTree.value = flag
}
const sceneObjectsCreatorSelection = (treeItem: SceneTreeItem | undefined) => {//记录右键对象，弹窗选择创建
    currentTreeItem.value = treeItem
    createSceneObject();
}
const openCreator = (event: KeyboardEvent) => {
    if (!(event.ctrlKey && event.key === '`')) return
    createSceneObject();
}

const getJsonStr = (str: string) => {
    if (str === '' || str === '{}') return
    projectManager.createSceneObjectTreeItemFromJson(JSON.parse(str), currentTreeItem.value, jsonLocation.value);
}

onMounted(() => {
    window.addEventListener('keydown', openCreator)

    window.addEventListener('keydown', deleteItem)
    onBeforeUnmount(() => {
        window.removeEventListener('keydown', openCreator)
        window.removeEventListener('keydown', deleteItem)
    })
})

const CreateObjectByType = (type: string) => {
    //TODO秦瑛
    let lastTreeItem: SceneTreeItem | undefined
    const { lastSelectedItem } = sceneTree
    if (isempty.value) {
        if (lastSelectedItem) {
            if (lastSelectedItem.type === 'Folder') {
                lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, lastSelectedItem, 'Inner')
            } else {
                lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, lastSelectedItem, 'After')
            }
        } else {
            lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, undefined, undefined)
        }
    } else {
        lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, currentTreeItem.value, seatp.value)
    }
    if (!lastTreeItem) return
    if (!lastTreeItem.sceneObject) return
    lastTreeItem.name = `${type}_${lastTreeItem.sceneObject.id.substring(0, 4)}`;
    const { sceneObject } = lastTreeItem
    if (!sceneObject) return
    sceneTree.uiTree.clearAllSelectedItems()
    lastTreeItem.uiTreeObject.selected = true
    const { initSceneObjectOnCreatingFunc: f } = projectManager;
    f && f(sceneObject);
}

const createSceneObject = async () => {
    const type = await getSceneObjectTypeFunc()
    if (!type) {
        return;
    }
    CreateObjectByType(type);
}

const addNewTreeItem = (treeItem: SceneTreeItem | undefined, flag: boolean, location?: TreeItemInsertFlag | undefined) => {
    if (flag) {//组节点判断
        let groupscenetreeitem: SceneTreeItem | undefined
        const { lastSelectedItem } = sceneTree
        if (isempty.value) {
            if (lastSelectedItem) {
                if (lastSelectedItem.type === 'Folder') {
                    groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, lastSelectedItem, 'Inner')
                } else {
                    groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, lastSelectedItem, 'After')
                }
            } else {
                groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, undefined, undefined)
            }
            // const groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, treeItem, location)
        } else {
            groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, treeItem, location)
        }
        // const groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, treeItem, location)
        if (!groupscenetreeitem) return
        groupscenetreeitem.name = `未命名组节点_${groupscenetreeitem.id.substring(0, 4)}`;
        groupscenetreeitem.nameEditing = true
    } else {//子节点判断
        sceneObjectsCreatorSelection(treeItem)
    }
}
const saveAs = async (json: JsonValue, name?: string) => {
    try {
        Message.info('正在另存为..');
        const handle = await getSaveFileHandle('json', `${name}.sceneObject`);
        if (!handle) return;
        const jsonStr = JSON.stringify(json, undefined, '    ');
        await saveFile(handle, jsonStr);
        Message.success('另存成功!');
    } catch (error) {
        Message.error('另存失败! error: ${error}');
    }
}
let checkedItems: any
let fatherItem: any
const whiteSpaceContexMenuEvent = () => {//空白右键
    isempty.value = true
    const baseItems: Array<menuContentType> = [
        {
            text: "新建子节点",
            keys: "",
            func: () => {
                seatp.value = 'InnerOrBefore'
                addNewTreeItem(undefined, false)
                // a.value++
            },
        },
        {
            text: "新建组节点",
            keys: "",
            func: () => {
                addNewTreeItem(undefined, true)
            },
        },

    ];
    if (sceneTree.lastSelectedItem) {
        const list = {
            text: "删除",
            keys: "",
            func: () => {
                const list = [...sceneTree.selectedItems] //删除选中
                if (list.length === 0) return
                Confirm.open({
                    title: '提示',
                    content: '确认删除选中的节点？',
                    result: async (res: any) => {
                        const { confirm } = res
                        if (confirm) {
                            list.forEach(obj => {
                                if (obj.isDestroyed()) return
                                obj.detachFromParent()
                            })
                        }
                    }
                })
            },
        }
        baseItems.push(list)
    }
    menuContent.value = baseItems
}
const treeItemContexMenuEvent = (treeItem: SceneTreeItem) => {//节点右键
    isempty.value = false
    const baseItems: Array<menuContentType> = [
        {
            text: "定位",
            keys: "",
            func: () => {
                flyTo(treeItem);
            },
        },
        {
            type: "divider",
        },
        {
            text: "新建同级子节点",
            keys: "",
            func: () => {
                seatp.value = 'After'
                addNewTreeItem(treeItem, false);
            },
        },
        {
            text: "新建内部子节点",
            keys: "",
            func: () => {
                seatp.value = 'InnerOrBefore'
                addNewTreeItem(treeItem, false);
            },
        },
        {
            text: "新建同级组节点",
            keys: "",
            func: () => {
                addNewTreeItem(treeItem, true, 'After');
            },
        },
        {
            text: "新建内部组节点",
            keys: "",
            func: () => {
                addNewTreeItem(treeItem, true, 'Inner');
            },
        },
        {
            type: "divider",
        },
        {
            text: "新建同级子节点(通过json)",
            keys: "",
            func: () => {
                jsonLocation.value = 'After'
                importJsonStr.value = '{}'
            }
        },
        {
            text: "新建内部子节点(通过json)",
            keys: "",
            func: () => {
                jsonLocation.value = 'Inner'
                importJsonStr.value = '{}'
            }
        },
        {
            type: "divider",
        },
        {
            text: "控制台打印JSON",
            keys: "",
            func: () => {
                const jsonStr = treeItem.sceneObject?.jsonStr;
                if (jsonStr) {
                    console.log(jsonStr);
                }
            },
        },
        {
            text: "复制JSON到剪贴板",
            keys: "",
            func: () => {
                const jsonStr = treeItem.sceneObject?.jsonStr;
                if (jsonStr) {
                    copyClipboard(jsonStr);
                }
            },
        },
        {
            text: "粘贴JSON到场景树",
            keys: "",
            func: () => {
                navigator.clipboard.readText().then(text => {
                    let sceneObjectJson
                    try {
                        sceneObjectJson = JSON.parse(text)
                    } catch (error) {
                        alert(`剪切板中内容可能不是JSON字符串，无法解析！`)
                    }

                    if (!sceneObjectJson) {
                        return
                    }

                    if (!sceneObjectJson.type) {
                        alert(`剪切板中内容可能不是场景对象的JSON配置，无法创建场景对象！`)
                        return
                    }

                    const newSceneTreeItem = sceneTree.createSceneObjectTreeItemFromJson(sceneObjectJson);
                    if (!newSceneTreeItem) {
                        console.warn(`根据json创建场景对象节点失败！`);
                        return;
                    }
                    treeItem.parent?.children?.push(newSceneTreeItem);
                })
            },
        },
        {
            text: "保存JSON到本地",
            keys: "",
            func: () => {
                const json = treeItem.sceneObject?.json;
                const name = treeItem.sceneObject?.name
                saveAs(json, name);
            },
        },
        {
            type: "divider",
        },
        {
            text: "克隆",
            keys: "copy",
            func: () => {
                if (!treeItem.parent) {
                    console.warn(`父节点不存在，无法克隆！`);
                    return;
                }

                if (!treeItem.parent.children) {
                    console.error(`父节点的children属性必须存在，否则当前节点从哪里来？treeItem.parent.children`);
                    return;
                }

                const cloneTreeItem = treeItem.clone();
                if (!cloneTreeItem) {
                    console.warn(`节点克隆失败！`);
                    return;
                }
                treeItem.parent.children.push(cloneTreeItem);
            },
        },
        {
            text: "重命名",
            keys: "",
            func: () => {
                treeItem.nameEditing = true
            },
        },
        {
            text: "删除",
            keys: "",
            func: () => {
                const list = [...sceneTree.selectedItems] //删除选中
                Confirm.open({
                    title: '提示',
                    content: '确认删除选中的节点？',
                    result: async (res: any) => {
                        const { confirm } = res
                        if (confirm) {
                            list.forEach(obj => {
                                if (obj.isDestroyed()) return
                                obj.detachFromParent()
                            })
                            const flag = treeItem.isDestroyed()
                            if (flag) return
                            treeItem.detachFromParent()
                        }
                    }
                })
            },
        },
        {
            text: "剪切",
            keys: "",
            func: () => {
                checkedItems = [...sceneTree.selectedItems]
                if (!checkedItems.includes(treeItem)) {
                    checkedItems.push(treeItem)
                }
            },
        },
    ]

    // if (treeItem.sceneObject && treeItem.sceneObject.typeName === 'ESCameraViewCollection') {
    //     const sceneObject = treeItem.sceneObject
    //     const item = {
    //         text: "详情面板",
    //         keys: "",
    //         func: () => {
    //             //@ts-ignore
    //             currenESCameraViewCollectionRef.value = sceneObject
    //             sceneObject.dispose(() => {
    //                 currenESCameraViewCollectionRef.value = undefined
    //             })
    //             if (!showESViewCollectionVue3UIRef.value) {
    //                 showESViewCollectionVue3UIRef.value = true
    //             }
    //         },
    //     }
    //     baseItems.unshift(item)
    // }
    // if (treeItem.sceneObject && treeItem.sceneObject.typeName === 'ESPlayer') {
    //     const sceneObject = treeItem.sceneObject
    //     const item = {
    //         text: "详情面板",
    //         keys: "",
    //         func: () => {
    //             //@ts-ignore
    //             currentESPlayerRef.value = sceneObject
    //             sceneObject.dispose(() => {
    //                 currentESPlayerRef.value = undefined
    //             })
    //             if (!showESPlayerVue3UIRef.value) {
    //                 showESPlayerVue3UIRef.value = true
    //             }
    //         },
    //     }
    //     baseItems.unshift(item)
    // }

    //粘贴
    const pasteList: Array<menuContentType> = [
        {
            text: "粘贴到节点内部",
            keys: "",
            func: () => {
                fatherItem = treeItem
                if (Tree.canMoveToTreeItems(checkedItems, fatherItem, 'inner')) {
                    Tree.moveToTreeItems(checkedItems, fatherItem, 'inner')
                    checkedItems = null
                }
            },
        },

        {
            text: "粘贴到节点上方",
            keys: "",
            func: () => {
                fatherItem = treeItem
                if (Tree.canMoveToTreeItems(checkedItems, fatherItem, 'before')) {
                    Tree.moveToTreeItems(checkedItems, fatherItem, 'before')
                    checkedItems = null
                }
            },
        },
        {
            text: "粘贴到节点下方",
            keys: "",
            func: () => {
                fatherItem = treeItem
                if (Tree.canMoveToTreeItems(checkedItems, fatherItem, 'after')) {
                    Tree.moveToTreeItems(checkedItems, fatherItem, 'after')
                    checkedItems = null
                }
            },
        },

    ]
    if (checkedItems) {
        pasteList.forEach((item) => {
            baseItems.push(item)
        })
    }

    const { treeItemContexMenuCallback: cb } = sceneTree.contextMenu;
    cb && cb(baseItems, treeItem, sceneTree, projectManager);

    menuContent.value = baseItems
}

const deleteItem = (e: KeyboardEvent) => {
    if (e.key === 'Delete') {
        const list = [...sceneTree.selectedItems] //删除选中
        if (list.length === 0) return
        Confirm.open({
            title: '提示',
            content: '确认删除选中的节点？',
            result: async (res: any) => {
                const { confirm } = res
                if (confirm) {
                    //todo
                    list.forEach(obj => {
                        if (obj.isDestroyed()) return
                        obj.detachFromParent()
                    })
                }
            }
        })
    }
}

const menuContent = ref<Array<menuContentType>>([])

const contexMenuEvent = (treeItem: SceneTreeItem | undefined) => {//树内右键暴露出来的事件
    currentTreeItem.value = treeItem
    if (!treeItem) {
        whiteSpaceContexMenuEvent()
    } else {
        treeItemContexMenuEvent(treeItem)
    }
}

const flyTo = (treeItem: SceneTreeItem) => {
    const { sceneObject } = treeItem
    if (sceneObject && Reflect.has(sceneObject, 'flyTo')) {
        // @ts-ignore
        sceneObject.flyTo()
    } else {
        Message.warning('暂不支持定位!')
    }
}

const getSceneHeadList = () => {
    const sceneHeadList = [
        {
            icon: require("../../img/select.png"),
            title: '复选',
            func: () => {
                showCheckBox.value = !showCheckBox.value
            }
        }, {
            icon: require("../../img/fold.png"),
            title: '折叠',
            func: () => {
                sceneUiTree.collapseAll()
            }
        }
    ]
    return sceneHeadList

}

</script>

<style scoped>
.scene-tree-wrapper {
    /* min-width: 160px; */
    height: calc(100% - 24px);
    background: #292b2f;
    outline: none;
}

.scene-tree-comp {
    width: 100%;
    height: 100%;
}
</style>
