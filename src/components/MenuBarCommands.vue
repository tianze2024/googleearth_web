<template>
  <div ref="dropdownRef" class="header_box" @click.self="pullMenuType = undefined">
    <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'file') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'file') ? undefined : 'file'">文件</button>
      <PullMenu v-show="pullMenuType === 'file'" :menuList="baseItemsFile" @funClick="pullMenuType = undefined">
      </PullMenu>
    </div>
    <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'view') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'view') ? undefined : 'view'">视图</button>
      <PullMenu v-show="pullMenuType === 'view'" :menuList="baseItemsView" @funClick="pullMenuType = undefined">
      </PullMenu>
    </div>

    <!-- <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'add') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'add') ? undefined : 'add'">添加</button>
      <PullMenu v-show="pullMenuType === 'add'" :menuList="baseItemsAdd" @funClick="pullMenuType = undefined">
      </PullMenu>
    </div> -->
    <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'help') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'help') ? undefined : 'help'">帮助</button>
      <PullMenu v-show="pullMenuType === 'help'" :menuList="baseItemsHelp" @funClick="pullMenuType = undefined">
      </PullMenu>
      <ConvertEnvironment v-if="convertEnvironment" @close="convertEnvironment = false"></ConvertEnvironment>
    </div>
    <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'source') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'source') ? undefined : 'source'">源码</button>
      <PullMenu v-show="pullMenuType === 'source'" :menuList="baseItemsSource" @funClick="pullMenuType = undefined">
      </PullMenu>
      <ConvertEnvironment v-if="convertEnvironment" @close="convertEnvironment = false"></ConvertEnvironment>
    </div>
    <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'tileser') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'tileser') ? undefined : 'tileser'">私有云</button>
      <PullMenu v-show="pullMenuType === 'tileser'" :menuList="baseItemsTileser" @funClick="pullMenuType = undefined">
      </PullMenu>
      <ConvertEnvironment v-if="convertEnvironment" @close="convertEnvironment = false"></ConvertEnvironment>
    </div>
    <div class="GH_PullDownMenu">
      <button class="header_title" :class="(pullMenuType === 'tool') ? 'height_light' : ''"
        @click="pullMenuType = (pullMenuType === 'tool') ? undefined : 'tool'">意见箱</button>
      <PullMenu v-show="pullMenuType === 'tool'" :menuList="baseItemsTool" @funClick="pullMenuType = undefined">
      </PullMenu>
    </div>
    <!-- <div class="file_name" v-show="!nameRefIsChange" @dblclick="nameRefIsChange = true">{{ nameRef }}({{ fileName }})
    </div> -->
    <div class="update_name" v-show="nameRefIsChange"><input type="text" v-model.lazy="nameRef"
        @blur="nameRefIsChange = false" @keydown.enter="nameRefIsChange = false"></div>
  </div>

  <Window :title="markdownTitle" :show="!!aboutInfo" :only-button="true" @ok="offMarkdown" :ok-text="'关闭'" :width="800"
    :height="500">
    <div style="margin: 20px;height: calc(100% - 40px);overflow: auto;">
      <MarkdownReader :is-Json="isJson" :markdown-str="aboutInfo"></MarkdownReader>
    </div>
  </Window>

  <Window title="内部测试数据" :show="showTestData" :only-button="true" @ok="showTestData = false" :ok-text="'关闭'" :width="800"
    :height="500">
    <div style="margin: 10px;height: calc(100% - 20px);overflow: auto; ">
      <iframe src="https://www.wolai.com/vtxf/7fFDFx5uk9jwVdXer1XUka" frameborder="0" class="iframeData"></iframe>
    </div>
  </Window>

  <JsonStringProp :jsonStr="jsonStr" :isShow="jsonStrShow" @changeShow="changeShow" @getJsonStr="setJson">
  </JsonStringProp>

  <JsonStringProp :jsonStr="localEnvironment" :isShow="showEnvironment" :sampleValue="envSampleValue"
    @getJsonStr="setEnvironment" @changeShow="changeEnvironment">
  </JsonStringProp>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MarkdownReader from 'vue-xe2-plugin/dist-node/components/xe2/common/MarkdownReader.vue';
import JsonStringProp from 'vue-xe2-plugin/dist-node/components/xe2/common/PropTree/commons/JsonStringProps.vue';
import PullMenu from "vue-xe2-plugin/dist-node/components/xe2/common/PullMenu.vue";
import Window from "vue-xe2-plugin/dist-node/components/xe2/common/Window.vue";
import { createVueDisposer, setEnvironmentVariable, toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';
import Message from 'vue-xe2-plugin/dist-node/components/xe2/utility/Message';
import { FileHandleType, Player, SceneObject, getOpenFileHandle, getSaveFileHandle, getTextFromFile, requestWriteAccess, saveFile } from "xbsj-xe2/dist-node/xe2-base-objects";
import { JsonValue } from "xbsj-xe2/dist-node/xe2-base-utils";
import ConvertEnvironment from "../examples/components/ConvertEnvironment.vue";
import { AppProjectManager } from "../scripts/AppProjectManager";

const convertEnvironment = ref(false)

const props = withDefaults(defineProps<{
  appProjectManager: AppProjectManager,
}>(), {});

const { appProjectManager } = props;

const d = createVueDisposer(onBeforeUnmount)
const showSceneTreeViewRef = toVR<boolean>(d, [appProjectManager, "showSceneTreeView"])
const showSceneTree2ViewRef = toVR<boolean>(d, [appProjectManager, "showSceneTree2View"])
const showPlayerViewRef = toVR<boolean>(d, [appProjectManager.xe2ProjectManager, "showPlayerView"])
const showLeftSidebarViewRef = toVR<boolean>(d, [appProjectManager, "showLeftSidebarView",])
const nameRef = toVR<string>(d, [appProjectManager.xe2ProjectManager.asset, "name"])
const showHeaderViewRef = toVR<boolean>(d, [appProjectManager, "showHeaderView"])
const showMainToolBarRef = toVR<boolean>(d, [appProjectManager, "showMainToolBar"])
const editingOnPickingRef = toVR<boolean>(d, [appProjectManager.xe2ProjectManager, "editingOnPicking"])
const allowPickingOnCreatingRef = toVR<boolean>(d, [appProjectManager.xe2ProjectManager, "allowPickingOnCreating"])
const transparentBackgroundRef = toVR<boolean>(d, [appProjectManager, "transparentBackground"]);
const currentPlayerRef = toVR<Player | undefined>(d, [appProjectManager.xe2ProjectManager, "currentPlayer"]);
const isMinToolViewRef = toVR<boolean>(d, [appProjectManager, "isMinToolView"]);
const showFavoritesToolbarRef = toVR<boolean>(d, [appProjectManager, "showFavoritesToolbar"]);
const showSceneCreatingToolbarRef = toVR<boolean>(d, [appProjectManager, "showSceneCreatingToolbar"]);
const showModelCreatingToolbarRef = toVR<boolean>(d, [appProjectManager, "showModelCreatingToolbar"]);


const showSearchToolbarRef = toVR<boolean>(d, [appProjectManager, "showSearchToolbar"])
const showMappingToolbarRef = toVR<boolean>(d, [appProjectManager, "showMappingToolbar"])
const showMapLayerToolbarRef = toVR<boolean>(d, [appProjectManager, "showMapLayerToolbar"])


const nameRefIsChange = ref(false)
const dropdownRef = ref<null | HTMLElement>(null)

const pullMenuType = ref<'file' | 'help' | 'view' | 'tool' | 'add' | 'source' | 'tileser' | undefined>(undefined)
const aboutInfo = ref('');
const isJson = ref(false);
const markdownTitle = ref('信息');
const handle = ref<any>(undefined)
const jsonStrShow = ref(false)
const jsonStr = ref<string>('')
const modelIsShow = ref(true)
const emits = defineEmits(['modelShow']);

const showTestData = ref(false);

const baseItemsView = computed(() => {
  const itemsView = [{
    text: showSceneTreeViewRef.value ? '场景结构树 ✓' : '场景结构树',
    keys: "",
    func: () => {
      showSceneTreeViewRef.value = !showSceneTreeViewRef.value
    },
  }, {
    text: showHeaderViewRef.value ? '菜单 ✓' : '菜单',
    keys: "",
    func: () => {
      showHeaderViewRef.value = !showHeaderViewRef.value
    },
  }, {
    text: showMainToolBarRef.value ? '主工具栏 ✓' : '主工具栏',
    keys: "",
    func: () => {
      showMainToolBarRef.value = !showMainToolBarRef.value
    },
    children: [

      {
        text: showSearchToolbarRef.value ? '搜索框 ✓' : '搜索框',
        keys: "",
        func: () => {
          showSearchToolbarRef.value = !showSearchToolbarRef.value
        }
      },
      {
        text: showMappingToolbarRef.value ? '标记测量工具栏 ✓' : '标记测量工具栏',
        keys: "",
        func: () => {
          showMappingToolbarRef.value = !showMappingToolbarRef.value
        }
      },
      {
        text: showMapLayerToolbarRef.value ? '地图图层工具栏 ✓' : '地图图层工具栏',
        keys: "",
        func: () => {
          showMapLayerToolbarRef.value = !showMapLayerToolbarRef.value
        }
      },
      {
        text: showFavoritesToolbarRef.value ? '收藏工具栏 ✓' : '收藏工具栏',
        keys: "",
        func: () => {
          showFavoritesToolbarRef.value = !showFavoritesToolbarRef.value
        },
      },
      {
        text: showSceneCreatingToolbarRef.value ? '场景创建工具栏 ✓' : '场景创建工具栏',
        keys: "",
        func: () => {
          showSceneCreatingToolbarRef.value = !showSceneCreatingToolbarRef.value
        },
      },
    ]
  }, {
    text: editingOnPickingRef.value ? '拾取后编辑 ✓' : '拾取后编辑',
    keys: "",
    func: () => {
      editingOnPickingRef.value = !editingOnPickingRef.value
    },
  }, {
    text: allowPickingOnCreatingRef.value ? '对象创建时开启允许拾取的选项 ✓' : '对象创建时开启允许拾取的选项',
    keys: "",
    func: () => {
      allowPickingOnCreatingRef.value = !allowPickingOnCreatingRef.value
    },
  }, {
    text: transparentBackgroundRef.value ? '背景透明 ✓' : '背景透明',
    keys: "",
    func: () => {
      transparentBackgroundRef.value = !transparentBackgroundRef.value
    },
  }, {
    text: '全屏',
    keys: "",
    func: () => {
      oneKeyFullScreen()
    },
  },
  ]
  return itemsView
})

const oneKeyFullScreen = () => {
  showSceneTreeViewRef.value = false
  showHeaderViewRef.value = false
  showMainToolBarRef.value = false
  showPlayerViewRef.value = false
  showLeftSidebarViewRef.value = false;
}

const changeShow = (flag: boolean) => {
  jsonStrShow.value = flag
}

const openJsonEdit = (jsonStrs: string) => {
  jsonStr.value = jsonStrs
  jsonStrShow.value = true
}
const setJson = (str: string) => {
  if (str === '') return
  appProjectManager.xe2ProjectManager.jsonStr = str
}

let jsonFileHandle: FileHandleType | undefined = undefined;
const fileName = ref('未保存');

function setJsonFileHandle(handle: FileHandleType | undefined) {
  jsonFileHandle = handle;
  fileName.value = handle ? handle.name : '未保存';
}

const openJsonFile = async () => {
  try {
    Message.info('正在打开..')
    const handle = await getOpenFileHandle('json');
    if (!handle) return;
    const jsonStr = await getTextFromFile(handle);
    if (!jsonStr) return;
    setJsonFileHandle(handle);
    // @ts-ignore
    appProjectManager.xe2ProjectManager.json = JSON.parse(jsonStr);
    Message.success('打开成功！')
  } catch (error) {
    Message.error(`打开失败！ error: ${error}`);
  }
}
function loadJsFile(jsSrc: string) {
  return new Promise<void>((resolve) => {
    const js = document.createElement('script')
    js.src = jsSrc
    document.body.appendChild(js)
    js.onload = () => {
      URL.revokeObjectURL(jsSrc)
      resolve()
    }
  })
}
const openJsFile = async () => {
  try {
    Message.info('正在打开..')
    const handle = await getOpenFileHandle('js')
    if (!handle) return
    const jsStr = await getTextFromFile(handle)
    if (!jsStr) return
    const jsSrc = URL.createObjectURL(new Blob([jsStr], { type: 'text/javascript' }))
    await loadJsFile(jsSrc)
    Message.success('载入成功！')
  } catch (error) {
    Message.error(`载入失败! error: ${error}`)
    console.error(`载入失败! error: ${error}`, error)
  }
}
const loadJsPath = async () => {
  try {
    const jsPath = window.prompt(`JS文件路径`, 'http://www.earthsdk.com/xxx.js')
    if (jsPath) {
      await loadJsFile(jsPath)
      Message.success('载入成功')
    }
  } catch (error) {
    Message.success('载入失败!')
  }
}
const saveAs = async (json: JsonValue, name?: string) => {
  try {
    Message.info('正在另存为..');
    const handle = await getSaveFileHandle('json', name);
    if (!handle) return;
    const jsonStr = JSON.stringify(json, undefined, '    ');
    await saveFile(handle, jsonStr);
    setJsonFileHandle(handle);
    Message.success('另存成功!');
  } catch (error) {
    Message.error('另存失败! error: ${error}');
  }
}

const save = async (json: JsonValue, name: string) => {
  if (!jsonFileHandle) {
    saveAs(json, name);
  } else {
    try {
      if (jsonFileHandle.name !== name + '.json') {
        Message.warning(`注意文件名和项目名不同！`);
        console.warn(`注意保存的文件名(${jsonFileHandle.name})和项目名(${name + ".json"})不同！`);
      }
      Message.info('正在保存..');
      const jsonStr = JSON.stringify(json, undefined, '    ');
      await requestWriteAccess(jsonFileHandle);
      await saveFile(jsonFileHandle, jsonStr);
      Message.success('保存成功!');
    } catch (error) {
      Message.error(`保存失败，错误：${error}`);
    }
  }
}

const baseItemsFile = [
  {
    text: "新建场景文件",
    keys: "Ctrl+Alt+N",
    func: () => {
      handle.value = undefined;
      appProjectManager.xe2ProjectManager.jsonStr = "";
    },
  },
  {
    text: "打开场景文件",
    keys: "Ctrl+O",
    func: () => {
      openJsonFile();
    },
  },
  {
    text: "打开最近一次场景文件",
    keys: "",
    func: () => {
      const lastJson = localStorage.getItem("lastJson")
      if (!lastJson) {
        Message.warning('场景不存在');
        return
      }
      appProjectManager.xe2ProjectManager.json = JSON.parse(lastJson)
    }
  },
  {
    text: "加载本地JS文件",
    keys: "",
    func: () => {
      openJsFile()
    }
  },
  {
    text: "加载网络JS路径",
    keys: "",
    func: () => {
      loadJsPath()
    }
  },
  {
    type: "divider",
  },
  {
    text: "保存场景文件",
    keys: "Ctrl+S",
    func: () => {
      const json = appProjectManager.xe2ProjectManager.json
      const name = appProjectManager.xe2ProjectManager.asset.name
      save(json, name);
    },
  },
  {
    text: "场景文件另存为..",
    keys: "Ctrl+Shift+S",
    func: () => {
      const json = appProjectManager.xe2ProjectManager.json;
      const name = appProjectManager.xe2ProjectManager.asset.name + '.scene';
      saveAs(json, name);
    },
  },
];

const localEnvironment = ref('[]')
const showEnvironment = ref(false)

const getEnvironment = () => {
  showEnvironment.value = true
  const storage = localStorage.getItem("XE2LocalEnvironmentVariable");
  if (!storage) return
  const itemList = JSON.parse(storage) as { name: string, dir: string | undefined }[]
  localEnvironment.value = JSON.stringify(itemList, undefined, '    ');
}

const envSampleValue = `
#### 此为示例数据，如果想要新增环境变量，请往数组内部添加
${'```'}js
[
  {
    "name": "vue-xe2-plugin-assets-dir",
    "enabled":true,
    "dir":"http://localhost:8080/js/vue-xe2-plugin/dist-web/vue-xe2-plugin-assets"
  }
]
${'```'}
`
const setMarkdownOrJson = (isJsonFlag: boolean, title: string, markdownOrJsonstr: string) => {
  isJson.value = isJsonFlag
  markdownTitle.value = title
  if (aboutInfo.value !== "") {
    aboutInfo.value = ''
  }
  aboutInfo.value = markdownOrJsonstr
}

const offMarkdown = () => {
  aboutInfo.value = ''
  markdownTitle.value = '信息'
  isJson.value = false
}


const setEnvironment = (str: string) => {
  localStorage.setItem("XE2LocalEnvironmentVariable", str)

  const itemList = JSON.parse(str) as { name: string, enabled: boolean, dir: string | undefined }[]
  if (itemList.length === 0) return

  const list = itemList.filter(el => {
    if (el.enabled) return el
  })
  if (list.length === 0) return
  list.forEach(el => {
    setEnvironmentVariable(el.name, el.dir)
  })

  showEnvironment.value = false
  localEnvironment.value = '[]'
}

const changeEnvironment = (flag: boolean) => {
  showEnvironment.value = flag
  localEnvironment.value = '[]'
}

const baseItemsHelp = [
  {
    text: "当前项目配置信息",
    keys: "",
    func: () => {
      let content = appProjectManager.xe2ProjectManager.jsonStr;
      openJsonEdit(content)
    },
  },
  {
    text: "本地环境变量管理",
    keys: "",
    func: () => {
      getEnvironment()
    },
  },
  {
    text: '当前项目环境变量列表',
    keys: "",
    func: () => {
      const { context } = SceneObject;
      //@ts-ignore
      const env = context._environmentVariables as { [k: string]: string };
      const envKeys = Object.keys(env);
      envKeys.sort();
      const str = envKeys.map(e => `${e} | ${env[e]}`).join('\n');

      setMarkdownOrJson(true, '环境变量列表', str)
    }
  },
  {
    text: '所有场景对象类型列表',
    keys: '',
    func: () => {
      const { context } = SceneObject;
      //@ts-ignore
      const typeNames = [...context._sceneObjConstructorsMap.keys()];
      typeNames.sort();
      const json = typeNames.map(e => ({
        type: e,
        info: context.getProps(e),
      }));
      const jsonStr = JSON.stringify(json, undefined, '    ');

      setMarkdownOrJson(true, '对象列表', jsonStr)
    }
  },
  {
    text: '所有场景对象类型列表(简版)',
    keys: '',
    func: () => {
      const { context } = SceneObject;
      //@ts-ignore
      const typeNames = [...context._sceneObjConstructorsMap.keys()];
      typeNames.sort();
      const json = typeNames.map(e => {
        const info = context.getProps(e) ?? {};
        const chsName = info.chsName ?? '';
        const tagsStr = ((info.tags ?? []) as string[]).join(',');
        const description = info.description ?? '';
        return `${e} | ${chsName} | ${tagsStr} | ${description}`;
      });
      const jsonStr = json.join('\n');

      setMarkdownOrJson(true, '对象列表', jsonStr)
    }
  },
  {
    text: '环境变量自动计算',
    keys: '',
    func: () => {
      convertEnvironment.value = true
    }
  },
  {
    text: '内部测试数据',
    keys: '',
    func: () => {
      showTestData.value = true
      // window.open("https://www.wolai.com/vtxf/7fFDFx5uk9jwVdXer1XUka")
    }
  },
  {
    type: "divider",
  },
  {
    text: "版本信息",
    keys: "",
    func: () => {
      // @ts-ignore
      const str = window.g_xe2CopyRightsMd && window.g_xe2CopyRightsMd() || '<center>暂无数据</center>';
      setMarkdownOrJson(false, '版本信息', str)
    },
  },
];

const offPullMenu = (e: Event) => {
  if (dropdownRef.value && dropdownRef.value.contains && !dropdownRef.value.contains(e.target as Node)) {
    if (pullMenuType.value) {
      pullMenuType.value = undefined
    }

  }

}

const defaultEvent = (event: KeyboardEvent) => {
  if (!event.ctrlKey) return

  if ((!event.shiftKey) && event.key === 's') {
    event.preventDefault()
    const json = appProjectManager.xe2ProjectManager.json
    const name = appProjectManager.xe2ProjectManager.asset.name
    save(json, name);

  } else if (event.altKey && event.key === 'n') {
    event.preventDefault()
    handle.value = undefined;
    appProjectManager.xe2ProjectManager.jsonStr = "";

  } else if (event.key === 'o') {
    event.preventDefault()
    openJsonFile();

  } else if (event.shiftKey && event.key === 'S') {
    event.preventDefault()
    const json = appProjectManager.xe2ProjectManager.json;
    const name = appProjectManager.xe2ProjectManager.asset.name
    saveAs(json, name);

  }
}

onMounted(() => {
  addEventListener("click", offPullMenu, false)
  addEventListener('keydown', defaultEvent)
  onBeforeUnmount(() => {
    removeEventListener("click", offPullMenu, false)
    window.removeEventListener('keydown', defaultEvent)
  })
})


const baseItemsTool = computed(() => {
  const itemsView = [{
    text: '提建议',
    keys: "",
    func: () => {
      window.open("https://www.wjx.cn/vm/Q00IWqS.aspx");
    },
  }
  ]
  return itemsView
})

const baseItemsAdd = computed(() => {
  const itemsView = [{
    text: '地标',
    keys: "",
    func: () => {
      // showSceneTreeViewRef.value = !showSceneTreeViewRef.value
    },
  }, {
    text: '线段',
    keys: "",
    func: () => {
      // showHeaderViewRef.value = !showHeaderViewRef.value
    },
  }, {
    text: '多边形',
    keys: "",
    func: () => {
      // showHeaderViewRef.value = !showHeaderViewRef.value
    },
  }
  ]
  return itemsView
})

const baseItemsSource = computed(() => {
  const itemsView = [{
    text: '云地球Web端源码',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/yuanma/");
    },
  }, {
    text: 'TileSer离线服务系统源码',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/");
    },
  }]
  return itemsView
})

const baseItemsTileser = computed(() => {
  const itemsView = [
    
  {
    text: '在线测试API',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/image.html");
    },
  }, {
    text: '全球历史影像(离线)',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/gehis.html");
    },
  }, {
    text: '全球最新影像(离线)',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/zuixin.html");
    },
  }, {
    text: '全球3D倾斜模型(离线)',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/3dtiles.html");
    },
  },  {
    text: '全球OSGB倾斜模型(离线)',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/osgb.html");
    },
  },{
    text: '街景(离线)',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/jiejing.html");
    },
  },{
    text: '地形(离线)',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/api/terrain.html");
    },
  },{
    text: '其他私有云服务',
    keys: "",
    func: () => {
      window.open("https://web.giiiis.com/yuanma/");
    },
  }, 


]
  return itemsView
})
</script>

<style scoped>
.header_box {
  width: 100%;
  height: 100%;
  display: flex;

  justify-content: flex-start;
  align-items: center;
}

.header_title {
  width: 60px;
  font-size: 14px;
  height: 30px;
  background: #292b2f;
  color: #fff;
  border: none;
  cursor: pointer;
}

.header_title:hover {
  background: #666565;
}

.height_light {
  background: #00485c !important;
}


.GH_PullDownMenu {
  position: relative;
  /* margin-left: 2px; */
}

.version {
  width: 100%;
  height: 100%;
  text-align: center;
  line-height: 60px;
}

.file_name {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  position: absolute;
  left: 50%;
  cursor: pointer;
}

.update_name>input {
  width: 200px;
  background: #003847;
  border: 1px solid #384b50;
  outline: 1px solid #384b50;
  border-radius: 2px;
  font-size: 12px;
  height: 20px;
  line-height: 20px;
  padding-left: 10px;
  color: #fff;
  position: absolute;
  left: 50%;
  top: 2px;
}

.update_name>input:focus {
  outline: 1px solid #384b50;
}

.iframeData {
  width: 100%;
  height: 100%;
}
</style>
