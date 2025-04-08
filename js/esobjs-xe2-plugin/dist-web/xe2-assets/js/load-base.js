function init() {
    let xe2BaseDir = './js';

    do {
        const scriptSrc = document.currentScript.src;
        if (!scriptSrc) {
            break;
        }
        const result = /(.*)[\/\\](.*)/.exec(scriptSrc);
        if (!result || result.length < 3) {
            break;
        }
        xe2BaseDir = result[1] + '/../../../../';
    } while (false);

    window.xbsjDirs = window.xbsjDirs || { xe2BaseDir };
}

init();