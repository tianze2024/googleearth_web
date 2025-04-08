
<script setup lang='ts'>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createVueDisposer, toReadonlyVueRef } from 'vue-xe2-plugin/dist-node/components/xe2/tools';
import { ProjectManager } from 'xbsj-xe2/dist-node/xe2';

import ContextMenuCom from "../../common/ContextMenuCom.vue";
import Confirm from "../../utility/Confirm";

const props = withDefaults(defineProps<{
    projectManager: ProjectManager,
    isMinToolView: boolean,
}>(), {});

const { projectManager, isMinToolView } = props
const { sceneTree } = projectManager;
const d = createVueDisposer(onBeforeUnmount)

type menuContentType = {
    text: string;
    keys: string;
    func: () => void;
} | {
    type: "divider",
}
type CollectListType = {
    name: string,
    icon: string,
    func: () => void;
}

const ctrlKey = ref(false)

// 收藏栏
const collectList = ref<CollectListType[]>([
    {
        icon: require("../../img/no-star.png"),
        name: '点击添加收藏',
        func: () => {
            addCollect()
        }
    }
])
// 右键菜单
const menuContent = ref<Array<menuContentType>>([])

// 格式化日对象
const getNowDate = () => {
    let date = new Date();
    let sign2 = ":";
    let year: number | string = date.getFullYear() // 年
    let month: number | string = date.getMonth() + 1; // 月
    let day: number | string = date.getDate(); // 日
    let hour: number | string = date.getHours(); // 时
    let minutes: number | string = date.getMinutes(); // 分
    let seconds: number | string = date.getSeconds() //秒

    // 给一位数的数据前面加 “0”
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minutes >= 0 && minutes <= 9) {
        minutes = "0" + minutes;
    }
    if (seconds >= 0 && seconds <= 9) {
        seconds = "0" + seconds;
    }
    return year + "-" + month + "-" + day + " " + hour + sign2 + minutes + sign2 + seconds;
}
// 添加收藏
const addCollect = () => {
    const data = projectManager.json
    const collect = {
        name: `${getNowDate()} ${projectManager.json.asset.name}`,
        icon: require("../../img/star.png"),
        func: () => {
            saveCurrentSceneJson(data)
        }
    }
    const arr = []
    const list = {
        name: collect.name,
        json: data
    }
    if (!localStorage.getItem("localCollectLists")) {
        arr.push(list)
        localStorage.setItem("localCollectLists", JSON.stringify(arr))
    } else {
        const local = JSON.parse((localStorage.getItem("localCollectLists") as string))
        local.push(list)
        localStorage.setItem("localCollectLists", JSON.stringify(local))
    }
    if (collectList.value.length === 1) {
        collectList.value.unshift(collect)
    } else {
        collectList.value.splice(-1, 0, collect)
    }
}
// projectManager.json赋值
const saveCurrentSceneJson = (data: any) => {
    if (data) {
        projectManager.json = JSON.parse(JSON.stringify(data))
    }
}
// 收藏节点右键
const contexMenuEvent = (name: string) => {
    if (!name) return;
    if (ctrlKey.value) {
        deleteCollect(name)
    } else {
        const baseItems: Array<menuContentType> = [
            {
                text: "重命名",
                keys: "",
                func: () => {
                    rename(name)
                },
            },
            {
                text: "更新",
                keys: "",
                func: () => {
                    againCollect(name)
                },
            },
            {
                text: "删除",
                keys: "",
                func: () => {
                    deleteCollect(name)
                },
            },
            {
                text: "删除所有收藏",
                keys: "",
                func: () => {
                    clearAllCollect()
                },
            }

        ];
        menuContent.value = baseItems
    }

}
// 重命名
const rename = (name: string) => {
    const newName = prompt("重命名", name)
    if (!newName) return;
    const l = JSON.parse(localStorage.getItem("localCollectLists") as string)
    const c = l.find((e: any) => e.name === name)
    c.name = newName
    localStorage.setItem("localCollectLists", JSON.stringify(l))

    const i = collectList.value.findIndex((e: any) => e.name === name)
    collectList.value[i].name = newName
}
// 更新收藏
const againCollect = (name: string) => {
    const data = projectManager.json
    const newName = projectManager.json.asset.name
    const l = JSON.parse(localStorage.getItem("localCollectLists") as string)
    const c = l.find((e: any) => e.name === name)
    c.json = data
    c.name = `${getNowDate()} ${newName}`
    localStorage.setItem("localCollectLists", JSON.stringify(l))

    const i = collectList.value.findIndex((e: any) => e.name === name)
    collectList.value[i].func = () => {
        saveCurrentSceneJson(data)
    }
    collectList.value[i].name = `${getNowDate()} ${newName}`
}
// 删除收藏
const deleteCollect = (name: string) => {
    Confirm.open({
        title: '提示',
        content: '确认删除该收藏？',
        result: async (res: any) => {
            const { confirm } = res
            if (confirm) {
                const l = JSON.parse(localStorage.getItem("localCollectLists") as string)
                const i1 = l.findIndex((e: any) => e.name === name)
                l.splice(i1, 1)
                localStorage.setItem("localCollectLists", JSON.stringify(l))

                const i2 = collectList.value.findIndex((e: any) => e.name === name)
                collectList.value.splice(i2, 1)
            }
        }
    })
}
// 删除所有收藏
const clearAllCollect = () => {
    Confirm.open({
        title: '提示',
        content: '确认删除所有收藏？',
        result: async (res: any) => {
            const { confirm } = res
            if (confirm) {
                localStorage.removeItem("localCollectLists")
                collectList.value = [
                    {
                        icon: require("../../img/no-star.png"),
                        name: '点击添加收藏',
                        func: () => {
                            addCollect()
                        }
                    }
                ]
            }
        }
    })
}
watch(collectList, () => {
    // list.value = collectList.value
}, { deep: true })

onMounted(() => {
    const l = localStorage.getItem("localCollectLists")
    if (l && JSON.parse(l).length > 0) {
        JSON.parse(l).forEach((e: any) => {
            const list = {
                name: e.name,
                icon: require("../../img/star.png"),
                func: () => {
                    saveCurrentSceneJson(e.json)
                }
            }
            // collectList.value.push(list)
            if (collectList.value.length === 1) {
                collectList.value.unshift(list)
            } else {
                collectList.value.splice(-1, 0, list)
            }
        })
    }
    document.addEventListener("keydown", function (e: any) {
        if (e.code === "ControlLeft") {
            ctrlKey.value = true
        }
    })
    document.addEventListener("keyup", function (e: any) {
        if (e.code === "ControlLeft") {
            ctrlKey.value = false
        }
    })
})


</script>

<template>
    <div class="create_panel">
        <div v-for="item in collectList" class="panel_box" :class="isMinToolView ? 'min_panel' : 'panel'" :key="item.name"
            :title="item.name" @click.stop="item.func()"
            @contextmenu.stop.prevent="contexMenuEvent(item.name !== '点击添加收藏' ? item.name : '')">
            <div :class="isMinToolView ? 'min_icon_box' : 'icon_box'" class="img_box">
                <img :class="isMinToolView ? 'min_sign' : 'sign'" :src="item.icon" />
            </div>
            <div class="sign_title" v-show="!isMinToolView">{{ item.name }}</div>
        </div>
        <ContextMenuCom :baseItems="menuContent"></ContextMenuCom>
    </div>
</template>

<style scoped>
.create_panel {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-right: 2px solid #2c3e50;
    border-left: 2px solid #2c3e50;
    border-radius: 3px;
}

.create_model {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-right: 2px solid #2c3e50;
    border-radius: 3px;
}

.panel_box {
    cursor: pointer;
    border-radius: 3px;
    transition: background 0.3s;
}

.modedl_box {

    border-radius: 3px;
    transition: background 0.3s;
}

.min_panel:hover {
    background-color: #383838;
}

.panel:hover .sign_title {
    color: #2ea11b;
}


.min_icon_box {
    width: 40px;
    height: 40px;
}

.img_box {

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

}

.icon_box {
    width: 60px;
    height: 40px;
    margin: 0 5px;
}


.sign {
    width: 30px;
    height: 30px;
}

.min_sign {
    width: 24px;
    height: 24px;
}

.sign_title {
    width: 60px;
    margin: 0 5px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
