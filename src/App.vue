<template>
    <!-- 最外层容器-->
    <div class="flex-column">
        <div class="header-toolbar">
            <!-- 菜单栏：如果showHeaderViewRef为true，则显示菜单栏组件 -->
            <div class="header-view" v-if="showHeaderViewRef">
                <MenuBar :appProjectManager="appProjectManager"></MenuBar>
            </div>
            <!-- 工具栏：如果showMainToolBarRef为true，则显示工具栏组件 -->
            <div class="main-toolbar" v-if="showMainToolBarRef">
                <ToolBar :appProjectManager="appProjectManager"></ToolBar>
            </div>
            <!-- <div class="loginDiv" @click="loginTO"></div> -->
        </div>
        <div class="stree-main-view">
            <StreeToolBar :appProjectManager="appProjectManager"></StreeToolBar>
        </div>
        <!-- 内容区域 -->
        <div class="content-area">
            <!-- 地球视口 -->
            <div class="earthviewer">
                <ViewersComp :projectManager="appProjectManager.xe2ProjectManager">
                </ViewersComp>
            </div>
            div
            <!-- 左侧边栏 -->
            <div class="left-sidebar" v-if="showSceneTreeViewRef"
                :class="{ 'slide-out': !isSidebarVisible, 'slide-in': isSidebarVisible }" ref="leftSideBarRef">
                <div class="sidebar-content">
                    <!-- 场景树视图：如果showSceneTreeViewRef为true，则显示场景树组件 -->
                    <div class="scene-tree-view" v-if="showSceneTreeViewRef">
                        <SceneTreeWrapper nameTitle="场景树" :sceneTree="appProjectManager.xe2ProjectManager.sceneTree"
                            :projectManager="appProjectManager.xe2ProjectManager"
                            :getSceneObjectTypeFunc="() => typeGetting.start()">
                        </SceneTreeWrapper>
                    </div>
                </div>
                <!-- 折叠 -->
                <div class="fold">
                    <div class="foldbutton" @click="toggleSidebar">{{ isSidebarVisible ? '◀' : '▶' }}</div>
                </div>
            </div>
            <!-- <div class="bottom-sidebar" > -->
            <!-- 底部边栏内容 -->
            <!-- </div> -->
            <!-- 属性树包装器外层容器，用于定位关闭按钮和内容区 -->
            <div class="prop-treewrapper-container" v-if="!!propTreeRef">
                <!-- 关闭按钮 -->
                <div class="prop-treewrapper-info"> <a class="prop-treewrapper-text">属性信息栏</a>
                    <div class="close-button" @click="togglePropTreeVisibility"></div>
                </div>
                <!-- 属性树内容 -->
                <div class="prop-treewrapper-content" v-if="!!propTreeRef">
                    <PropTreeWrapper v-if="!!propTreeRef" :propTree="propTreeRef" :key="propTreeKey"
                        @callback="propTreeCallback">
                    </PropTreeWrapper>
                </div>
            </div>
        </div>
    </div>
    <!-- 场景结构树 -->
    <SceneObjectsCreator :show="showSceneObjectsCreatorRef"
        @get-type-name="(type: string) => typeGetting.setTypeName(type)">
    </SceneObjectsCreator>
    <div class="xe2-show-header" v-show="!showHeaderViewRef" @click="showBar">退出全屏</div>
</template>


<script setup lang="ts">
// 引入Vue相关功能
import { onBeforeUnmount, onMounted, ref, computed, watch } from "vue";

// 引入项目中使用的各种组件
import ViewersComp from "vue-xe2-plugin/dist-node/components/xe2/Viewers/Viewers.vue";
import PropTreeWrapper from "vue-xe2-plugin/dist-node/components/xe2/common/PropTree/PropTreeWrapper.vue";
import SceneObjectsCreator from "vue-xe2-plugin/dist-node/components/xe2/common/SceneObjectsCreator.vue";
import SceneTreeWrapper from "vue-xe2-plugin/dist-node/components/xe2/common/SceneTree/SceneTreeWrapper.vue";

// 引入自定义的菜单栏和工具栏组件
import MenuBar from "./components/MenuBar.vue";
import ToolBar from "./components/ToolBar.vue";
import StreeToolBar from "./components/StreeToolBar.vue";


// 引入XE2相关的类型定义
import { createVueDisposer, setEnvironmentVariable, toReadonlyVueRef, toRefKey, toVR, } from "vue-xe2-plugin/dist-node/components/xe2/tools";
import { PropTree } from "xbsj-xe2/dist-node/xe2";
// 引入项目管理相关的脚本
import { AppProjectManager } from "./scripts/AppProjectManager";


// 定义组件的属性类型
const props = withDefaults(
    defineProps<{
        appProjectManager: AppProjectManager;
    }>(),
    {}
);

// 从属性中解构出appProjectManager对象
const { appProjectManager } = props;

// 从appProjectManager中解构出sceneObjectTypeGetting对象
const { sceneObjectTypeGetting: typeGetting } = appProjectManager;

// 从XE2项目管理器中获取propUiTreeManager对象
const { propUiTreeManager } = appProjectManager.xe2ProjectManager;

// 定义属性树的回调函数
const propTreeCallback =
    appProjectManager.xe2ProjectManager.propTreeCallback.bind(
        appProjectManager.xe2ProjectManager
    );

// 创建Vue组件生命周期管理器
const d = createVueDisposer(onBeforeUnmount);

// 定义响应式引用
const propTreeRef = toReadonlyVueRef<PropTree | undefined>(d, [propUiTreeManager, "propTree",]);

const showSceneTreeViewRef = toVR<boolean>(d, [appProjectManager, "showSceneTreeView",]);
const showLeftSidebarViewRef = toVR<boolean>(d, [appProjectManager, "showLeftSidebarView",]);
const showHeaderViewRef = toVR<boolean>(d, [appProjectManager, "showHeaderView",]);
const showMainToolBarRef = toVR<boolean>(d, [appProjectManager, "showMainToolBar",]);
const propTreeKey = toRefKey(propTreeRef);
// 定义场景对象创建器的显示状态
const showSceneObjectsCreatorRef = toVR<boolean>(d, [appProjectManager.sceneObjectTypeGetting, "showDialog",]);

// 定义左侧边栏和底部边栏的引用
const leftSideBarRef = ref<HTMLDivElement | null>(null);
//调整大小
const bottomSideBarRef = ref<HTMLDivElement | null>(null);

// 定义响应式变量控制侧边栏显示
const isSidebarVisible = ref(true);
const leftSidebarX = ref('');

// foldbutton点击事件处理器
const toggleSidebar = () => {
    isSidebarVisible.value = !isSidebarVisible.value;
};


showLeftSidebarViewRef.value = true;

// 组件挂载时的逻辑
onMounted(() => {
    setEnvironment(); // 加载本地环境变量


    if (leftSideBarRef.value) {
        appProjectManager.appLayout.leftSideBarResizing.element =
            leftSideBarRef.value;
    }

    if (bottomSideBarRef.value) {
        appProjectManager.appLayout.bottomSideBarResizing.element =
            bottomSideBarRef.value;
    }

    //动态修改状态和左侧跨度和比例
    const leftSidebar = document.querySelector('.left-sidebar') as HTMLElement;
    if (!leftSidebar) return;

    const updateWidth = () => {
        let newWidth = `${leftSidebar.offsetWidth}px`; // 获取left-sidebar的宽度
        document.documentElement.style.setProperty('--left-sidebar-width', newWidth);
        leftSidebarX.value = newWidth; // 获取并更新 X 值
    };

    // 使用ResizeObserver监听宽度变化
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            updateWidth();
        }
    });

    resizeObserver.observe(leftSidebar);

    // 初始更新一次宽度
    updateWidth();
});

//监听左侧栏跨度，修改状态栏
watch(isSidebarVisible, (newValue) => {
    let newWidth = newValue ? leftSidebarX.value : '0px';
    // 更新 CSS 变量，这里假设您已经在某处使用了这个变量来控制相关元素的宽度
    document.documentElement.style.setProperty('--left-sidebar-width', newWidth);

    // 如果您需要根据侧边栏状态调整其他元素的宽度，可以在这里添加逻辑
    // 例如，根据侧边栏是否可见动态调整 ESViewerStatusBarScale 的宽度
    const statusBarWidth = newValue ? 'calc(100% - newWidth)' : '100%';
    document.documentElement.style.setProperty('--status-bar-scale-width', statusBarWidth);
});

// 设置环境变量的函数
const setEnvironment = () => {
    const storage = localStorage.getItem("XE2LocalEnvironmentVariable");
    if (!storage) return;
    const itemList = JSON.parse(storage) as {
        name: string;
        enabled: boolean;
        dir: string | undefined;
    }[];
    if (itemList.length === 0) return;

    const list = itemList.filter((el) => {
        if (el.enabled) return el;
    });
    if (list.length === 0) return;
    list.forEach((el) => {
        setEnvironmentVariable(el.name, el.dir);
    });
};

//关闭按钮
const togglePropTreeVisibility = () => {
    propTreeRef.value = !propTreeRef.value;
};

const showBar = () => {
    showSceneTreeViewRef.value = true
    showHeaderViewRef.value = true
    showMainToolBarRef.value = true
    showLeftSidebarViewRef.value = true
}


const loginTO = () => {
    window.open("https://account.bjxbsj.cn/index.html");
}
</script>


<style>
body,
html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    width: 100%;
    height: 100%;
}

.header-toolbar {
    box-shadow: 0px 5px 20px rgb(0, 0, 0);
    z-index: 1;
}

/* 基本布局样式 */
.flex-column {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* 顶部视图样式 */
.header-view {
    flex: none;
    height: 30px;
}

/* 主工具栏样式 */
.main-toolbar {
    flex: none;
    height: 48px;
    background-color: #292b2f;
}

.stree-main-view {
    position: fixed;
    z-index: 1000;
    bottom: 40px;
    right: 10px;
}

.xe2-show-header {
    top: 22px;
    left: 30px;
    width: 100px;
    height: 40px;
    line-height: 40px;
    border-radius: 25px;
    color: #1f0202;
    outline: none;
    border: none;
    font-size: 14px;
    color: #fff;
    text-align: center;
    background-color: #292b2fe8;
    box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.61);
    position: fixed;
}

.loginDiv {
    top: 22px;
    right: 30px;
    width: 36px;
    height: 36px;
    border-radius: 50px;
    color: #1f0202;
    outline: none;
    border: none;
    font-size: 16px;
    background: url(../src/components/xe2/img/login.svg) no-repeat center;
    background-color: rgb(162, 0, 255);
    position: fixed;
}
.loginDiv:hover {
    cursor: pointer;
}
/* 内容区域样式 */
.content-area {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.earthviewer {
    position: relative;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.left-sidebar {
    top: 0px;
    position: fixed;
    width: 300px;
    height: 100%;
    background-size: 28px;
    background-color: #292b2f;
    transition: transform 0.5s ease-in-out;
}


.slide-out {
    transform: translateX(-100%);
}

.slide-in {
    transform: translateX(0);
}


.fold {
    top: 0px;
    position: fixed;
    width: 10px;
    height: 100%;
    right: -10px;
    background: url(../src/components/xe2/img/shuxian.png) no-repeat center;
    background-size: 28px;
    background-color: #292b2f;
    transition: transform 0.5s ease-in-out;
}

.fold:hover {
    background-color: #484a4e;

}

.foldbutton {
    width: 25px;
    height: 50px;
    line-height: 50px;
    align-self: center;
    position: relative;
    text-align: center;
    color: #fff;
    top: calc(50% - 25px);
    left: 100%;
    z-index: 9999;
    background-color: #292b2f;
    border-top-left-radius: 0px;
    /* 左上角 */
    border-top-right-radius: 15px;
    /* 右上角 */
    border-bottom-left-radius: 0px;
    /* 左下角 */
    border-bottom-right-radius: 15px;
    /* 右下角 */
    outline: none;
}

/* 左侧边栏内容样式 */
.sidebar-content {
    display: flex;
    margin-top: 90px;
    margin-left: 10px;
    height: 90%;
    background-color: #292b2f;
    /* 高度填满父容器 */
    overflow: auto;
    overflow: hidden;
    /* 内容超出时显示滚动条 */
}

/* 场景树视图样式 */
.scene-tree-view {
    flex-grow: 1;
    /* 使场景树视图占满所有可用空间 */
    overflow-x: hidden;
    /* 隐藏水平滚动条 */
    overflow-y: auto;
    /* 垂直滚动条在需要时出现 */
}

/* 底部状态栏样式 */
.ESViewerStatusBarScale {
    left: calc(var(--left-sidebar-width, 320px)) !important;
    /* width: calc(100% - 320px) !important */
    width: calc(100% - var(--left-sidebar-width, 320px)) !important;
    /* 默认宽度为320px */
}

.CzmESViewerStatusBarScale {
    left: calc(var(--left-sidebar-width, 320px)) !important;
    /* width: calc(100% - 320px) !important */
    width: calc(100% - var(--left-sidebar-width, 320px)) !important;
    /* 默认宽度为320px */
}


.bottom-sidebar {
    height: 32px;
    background: #292b2f00;
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 20;
}

/* 属性栏 */
.prop-treewrapper-container {
    position: absolute;
    overflow: hidden;
    right: 20px;
    top: 100px;
    z-index: 10;
    height: 70%;
    background-color: #292b2f;
    border-radius: 15px;

}

.prop-treewrapper-info {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 50px;
    background-color: #292b2f;

}

.prop-treewrapper-text {
    position: absolute;
    top: 15px;
    left: 30px;
    color: white;
    font-size: 16px;
    padding-bottom: 20px;
}

/* 关闭按钮样式 */
.close-button {
    position: absolute;
    top: 15px;
    right: 20px;
    width: 28px;
    height: 28px;
    border-radius: 15px;
    cursor: pointer;
    background: url(../src/components/xe2/img/close.svg) no-repeat center;
    background-size: 14px;
}

.close-button:hover {
    background-color: rgba(240, 248, 255, 0.288);
}

/* 属性树内容区样式 */
.prop-treewrapper-content {
    margin-top: 50px;
    /* 为关闭按钮留出空间 */
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 50px;
    width: 350px;
    height: 90%;
    /* 根据视口高度动态计算 */
    background-color: #292b2f;
    overflow-y: auto;
}

/* 滚动条样式 */
.prop-treewrapper-content::-webkit-scrollbar {
    width: 5px;
}

.prop-treewrapper-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.prop-treewrapper-content::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
./scripts/WindowResizing