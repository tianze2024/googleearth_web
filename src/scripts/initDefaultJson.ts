import { parse } from 'search-params'
import { AppProjectManager } from '../scripts/AppProjectManager';
import { Czm3DTiles } from 'xbsj-xe2/dist-node/xe2-cesium-objects';
import { GeoSceneObjectCameraController } from 'xbsj-xe2/dist-node/xe2-base-objects';
import Message from '@/components/xe2/utility/Message';

//判断是否为json格式的对象
const isJsonObj = (obj: any) => {
    var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
}

const czmBaseSceneJson = {
    "asset": {
        "version": "0.1.0",
        "createdTime": "2022-06-17T05:54:41.744Z",
        "modifiedTime": "2023-08-25T00:49:14.176Z",
        "name": "基础场景"
    },
    "sceneTree": {
        "root": {
            "children": [
                {
                    "name": "Cesium基础场景",
                    "children": [
                        {
                            "name": "默认视口",
                            "sceneObj": {
                                "id": "0e5a5eb7-8c3c-44f7-b5bd-e53821c7d315",
                                "ref": "v",
                                "type": "CzmViewer",
                                "actived": true,
                                "createCesiumViewerFuncStr": "async function initCesiumViewer(container, czmViewer) {\n    const viewer = await XE2.g.defaultCreateCesiumViewerFunc(container, czmViewer);\n\n    // 若原Czm版权信息展示位置遮挡重要信息，可将以下语句解注释，在别的位置展示\n     viewer._cesiumWidget._creditContainer.style.display = \"none\";\n\n    return viewer;\n}\n",
                                "name": "默认视口"
                            },
                            "children": []
                        },
                        {
                            "name": "离线影像",
                            "sceneObj": {
                                "id": "1c86e136-789a-4a5c-abc6-93cb0fd01957",
                                "type": "CzmImagery",
                                "imageryProvider": {
                                    "type": "TileMapServiceImageryProvider",
                                    "url": "${czm-path}/Assets/Textures/NaturalEarthII"
                                },
                                "zIndex": 0,
                                "name": "离线影像"
                            },
                            "children": []
                        }
                    ]
                }
            ]
        }
    }
}

export async function initDefaultJson(appProjectManager: AppProjectManager) {
    const search = window.location.search.substring(1)
    const parseSearch = parse(search)
    // console.log('parseSearch', parseSearch);
    if (parseSearch.scene) {
        console.log(`parseSearch.scene: ${parseSearch.scene}`);
        if (parseSearch.scene) {
            fetch(`${parseSearch.scene}`).then(response => response.json()).then((data) => {
                console.log(isJsonObj(data));
                if (isJsonObj(data)) {
                    console.log(data);
                    appProjectManager.xe2ProjectManager.json = data
                    Message.success('载入成功')
                } else {
                    Message.warning('json错误,请检查')
                }
            })
        }
    }
    if (parseSearch.ui) {
        console.log(`parseSearch.ui: ${parseSearch.ui}`);
        const ui = +parseSearch.ui;
        if (ui === 0) {
            appProjectManager.showMainToolBar = false;
            appProjectManager.showSceneTreeView = false;
            appProjectManager.showHeaderView = false;
        }
    }
    if (parseSearch.tiles) {
        console.log(`parseSearch.tiles: ${parseSearch.tiles}`);
        if (typeof parseSearch.tiles !== 'string') {
            console.error(`typeof parseSearch.tiles !== 'string'`);
            return;
        }
        if (!parseSearch.tiles.endsWith('.json')) {
            console.error(`!parseSearch.tiles.endsWith('.json')`);
            return;
        }
        const url = parseSearch.tiles;

        appProjectManager.xe2ProjectManager.json = czmBaseSceneJson;

        const d = appProjectManager.xe2ProjectManager.jsonLoadingEvent.dwon(() => {
            d();
            const tilesJson = {
                "type": "Czm3DTiles",
                "name": "Czm3DTiles(3118)",
                "positionEditing": false,
                "allowPicking": false,
                "url": url,
            }
            const treeItem = appProjectManager.xe2ProjectManager.createSceneObjectTreeItemFromJson(tilesJson);
            const tiles = treeItem?.sceneObject as Czm3DTiles;
            setTimeout(() => tiles.flyTo(0), 1000);
        });
    }
    if (parseSearch.gltf) {
        console.log(`parseSearch.gltf: ${parseSearch.gltf}`);
        if (typeof parseSearch.gltf !== 'string') {
            console.error(`typeof parseSearch.gltf !== 'string'`);
            return;
        }
        // if (!parseSearch.gltf.endsWith('.gltf')) {
        //     console.error(`!parseSearch.gltf.endsWith('.gltf')`);
        //     return;
        // }
        const url = parseSearch.gltf;
        appProjectManager.xe2ProjectManager.json = czmBaseSceneJson;

        const d = appProjectManager.xe2ProjectManager.jsonLoadingEvent.dwon(() => {
            d();

            {
                const gltfJson = {
                    "type": "CzmModelPrimitive",
                    "name": "CzmModelPrimitive",
                    "url": url,
                    "positionEditing": false,
                    "allowPicking": true,
                    "position": [116.39, 39.9, 100],
                };
                const treeItem = appProjectManager.xe2ProjectManager.createSceneObjectTreeItemFromJson(gltfJson);
                const gltf = treeItem?.sceneObject as Czm3DTiles;
                setTimeout(() => {
                    gltf.flyTo(0);
                    const treeItem = appProjectManager.xe2ProjectManager.createSceneObjectTreeItemFromJson({
                        "type": "GeoSceneObjectCameraController",
                        "sceneObjectId": gltf.id,
                        "name": "GeoSceneObjectCameraController",
                    });
                    if (!treeItem) return;
                    (treeItem.sceneObject as GeoSceneObjectCameraController).enabled = true;

                }, 1000);
            }
        });
    }
}