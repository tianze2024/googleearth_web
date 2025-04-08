import { createApp } from 'vue';
import App from './App.vue';
import { AppProjectManager } from './scripts/AppProjectManager';
// import { initSceneTreeDiv } from './testUi';
import { copyright } from './copyright';
import './scripts/TestPropertyObjectInApp1';
import { initDefaultJson } from './scripts/initDefaultJson';
import './components/xe2';


// @ts-ignore
//window.testPropertyObjectInApp1 = new TestPropertyObjectInApp1();

const appProjectManager = new AppProjectManager();
const app = createApp(App, { appProjectManager })

initDefaultJson(appProjectManager)
app.mount('#app');

// only for debug
// @ts-ignore
window.g_appProjectManager = appProjectManager;
// @ts-ignore
window.g_app = app;

copyright.print();

// @ts-ignore
window.g_xe2CopyRightsTxt && console.log(window.g_xe2CopyRightsTxt());
