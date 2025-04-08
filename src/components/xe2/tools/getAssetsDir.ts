import { SceneObject } from "xbsj-xe2/dist-node/xe2-utils";

export function getAssetsDir() {
    return SceneObject.context.getEnv(`vue-xe2-plugin-assets-dir`);
}

export function setAssetsDir(dir: string | undefined) {
    return SceneObject.context.setEnv(`vue-xe2-plugin-assets-dir`, dir);
}

export function getEnvironmentVariable(name: string) {
    return SceneObject.context.getEnv(name);
}

export function setEnvironmentVariable(name: string, dir: string | undefined) {
    return SceneObject.context.setEnv(name, dir);
}
