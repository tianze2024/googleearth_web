
interface SceneObject {
    id: string;
    type: string;
    name: string;
    position?: number[];
    positions?: number[][];
}

interface SceneNode {
    name: string;
    sceneObj?: SceneObject;
    children?: SceneNode[];
}

interface SceneTree {
    root: SceneNode;
}

interface InputJSON {
    sceneTree: SceneTree;
}

interface GeoJSONFeature {
    type: "Feature";
    properties: {
        name: string;
    };
    geometry: {
        type: "Point" | "LineString" | "Polygon";
        coordinates: number[] | number[][] | number[][][];
    };
}

interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

export function convertJsonToGeoJson(input: InputJSON): GeoJSONFeatureCollection {
    const geoJson: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
    };

    function processNode(node: SceneNode) {
        node.children?.forEach(child => {
            if (child.sceneObj) {
                const { sceneObj } = child;
                let feature: GeoJSONFeature | null = null;

                switch (sceneObj.type) {
                    case "ESGeoDivTextPoi":
                    case "ESImageLabel":
                    case "ESLocalCircle":
                        feature = {
                            type: "Feature",
                            properties: {
                                name: sceneObj.name,
                            },
                            geometry: {
                                type: "Point",
                                coordinates: sceneObj.position || [],
                            },
                        };
                        break;
                    case "GeoPolyline":
                    case "GeoDistanceMeasurement":
                        feature = {
                            type: "Feature",
                            properties: {
                                name: sceneObj.name,
                            },
                            geometry: {
                                type: "LineString",
                                coordinates: sceneObj.positions || [],
                            },
                        };
                        break;
                    case "GeoPolygon":
                    case "GeoAreaMeasurement":
                        let positions = sceneObj.positions || [];
                        // 确保多边形闭合
                        if (positions.length > 0 && positions[0] !== positions[positions.length - 1]) {
                            positions.push(positions[0]);
                        }
                        feature = {
                            type: "Feature",
                            properties: {
                                name: sceneObj.name,
                            },
                            geometry: {
                                type: "Polygon",
                                coordinates: [positions],
                            },
                        };
                        break;
                }

                if (feature) {
                    geoJson.features.push(feature);
                }
            }

            // 递归处理子节点
            if (child.children) {
                processNode(child);
            }
        });
    }

    processNode(input.sceneTree.root);

    return geoJson;
}


// 没有高度，上面有高度
export function convertToGeoJSON(input: InputJSON): GeoJSONFeatureCollection {
    const geoJson: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
    };

    function processNode(node: SceneNode) {
        node.children?.forEach(child => {
            if (child.sceneObj) {
                const { sceneObj } = child;
                let feature: GeoJSONFeature | null = null;

                switch (sceneObj.type) {
                    case "ESGeoDivTextPoi":
                    case "ESLocalCircle":
                        feature = {
                            type: "Feature",
                            properties: {
                                name: sceneObj.name,
                            },
                            geometry: {
                                type: "Point",
                                coordinates: sceneObj.position ? sceneObj.position.slice(0, 2) : [],
                            },
                        };
                        break;
                    case "GeoPolyline":
                    case "GeoDistanceMeasurement":
                        feature = {
                            type: "Feature",
                            properties: {
                                name: sceneObj.name,
                            },
                            geometry: {
                                type: "LineString",
                                coordinates: sceneObj.positions ? sceneObj.positions.map(pos => pos.slice(0, 2)) : [],
                            },
                        };
                        break;
                    case "GeoPolygon":
                    case "GeoAreaMeasurement":
                        let positions = sceneObj.positions ? sceneObj.positions.map(pos => pos.slice(0, 2)) : [];
                        // 确保多边形闭合
                        if (positions.length > 0 && positions[0] !== positions[positions.length - 1]) {
                            positions.push(positions[0]);
                        }
                        feature = {
                            type: "Feature",
                            properties: {
                                name: sceneObj.name,
                            },
                            geometry: {
                                type: "Polygon",
                                coordinates: [positions],
                            },
                        };
                        break;
                }

                if (feature) {
                    geoJson.features.push(feature);
                }
            }

            // 递归处理子节点
            if (child.children) {
                processNode(child);
            }
        });
    }

    processNode(input.sceneTree.root);

    return geoJson;
}


export async function openAndReadFile(): Promise<{ content: string, fileType: string }> {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.kml,.geojson';
        input.style.display = 'none';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const fileType = file.name.endsWith('.kml') ? 'CzmKml' : 'CzmGeoJson';
                if (fileType === 'CzmGeoJson') {
                    // GeoJSON文件，直接以UTF-8读取
                    readTextFile(file, 'utf-8').then(content => {

                        resolve({ content, fileType });
                    }).catch(error => reject(error));
                } else if (fileType === 'CzmKml') {
                    // 尝试以UTF-8读取KML文件，检查编码声明
                    readTextFile(file, 'utf-8').then(content => {
                        const encodingDeclaration = content.match(/<\?xml\s+version="1.0"\s+encoding="([^"]+)"\?>/i);
                        if (encodingDeclaration && encodingDeclaration[1].toLowerCase() !== 'utf-8') {
                            console.log('检测到非UTF-8编码，尝试使用GB2312解码');
                            // 如果声明了非UTF-8编码，则尝试以GB2312读取
                            readTextFile(file, 'gb2312').then(content => {
                                resolve({ content, fileType });
                            }).catch(error => reject(error));
                        } else {
                            // 如果是UTF-8或没有声明编码，则直接返回内容
                            resolve({ content, fileType });
                        }
                    }).catch(error => reject(error));
                }
            } else {
                reject(new Error('No file selected'));
            }
        };

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    });
}

function readTextFile(file: File, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (encoding === 'gb2312') {
                // 对于GB2312编码，使用TextDecoder进行转换
                const decoder = new TextDecoder('gb2312');
                const content = decoder.decode(new Uint8Array(reader.result as ArrayBuffer));
                resolve(content);
            } else {
                // 对于UTF-8编码，直接返回字符串
                resolve(reader.result as string);
            }
        };
        reader.onerror = () => {
            reject(reader.error);
        };
        if (encoding === 'gb2312') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file, 'utf-8');
        }
    });
}


export const styleKML = `(dataSource) => {
    if (dataSource) {
        dataSource.entities.values.forEach(entity => {
            if (entity.polygon) {
                entity.polygon.outlineColor = Cesium.Color.RED; 
                entity.polygon.material = Cesium.Color.fromRandom({alpha: 0.5}); 
            } else if (entity.polyline) {
                entity.polyline.width = 5; // 线宽
                entity.polyline.material = Cesium.Color.YELLOW; // 线颜色
                var startPosition = entity.polyline.positions.getValue(Cesium.JulianDate.now())[0];
                entity.position = startPosition; // 设置标签的位置为线的起始位置
                entity.label = new Cesium.LabelGraphics({
                   text: entity.name,
                    font: '24px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -20) // 根据需要调整偏移量
                });
            } else if (entity.billboard) {
                entity.billboard.image = 'https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png'; // 广告牌图片
                entity.billboard.scale = 1; // 广告牌缩放比例
                entity.label = new Cesium.LabelGraphics({
                  text: entity.name,
                  font: "20px Helvetica",               // 字体和大小
                  fillColor: Cesium.Color.WHITE,         // 文字颜色
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,    //位置
                  pixelOffset: new Cesium.Cartesian2(50.0, -15.0),  //偏移
                });}});}
}
`

export const styleGeoJson = `(dataSource) => {
    if (dataSource) {
        dataSource.entities.values.forEach(entity => {
            if (entity.polygon) {
                entity.polygon.outlineColor = Cesium.Color.RED; 
                entity.polygon.material = Cesium.Color.fromRandom({alpha: 0.5}); 
            } else if (entity.polyline) {
                entity.polyline.width = 5; // 线宽
                entity.polyline.material = Cesium.Color.YELLOW; // 线颜色
                var startPosition = entity.polyline.positions.getValue(Cesium.JulianDate.now())[0];
                entity.position = startPosition; // 设置标签的位置为线的起始位置
                entity.label = new Cesium.LabelGraphics({
                   text: entity.name,
                    font: '24px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -20) // 根据需要调整偏移量
                });
            } else if (entity.billboard) {
                entity.billboard.image = 'https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png'; // 广告牌图片
                entity.billboard.scale = 0.5; // 广告牌缩放比例
                entity.label = new Cesium.LabelGraphics({
                  text: entity.name,
                  font: "20px Helvetica",               // 字体和大小
                  fillColor: Cesium.Color.WHITE,         // 文字颜色
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,    //位置
                  pixelOffset: new Cesium.Cartesian2(50.0, -15.0),  //偏移
                });}});}
}
`