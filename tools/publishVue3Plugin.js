const { ncp } = require('ncp');
const rimraf = require('rimraf');

async function clearAndCopyLib(source, destination) {
    await new Promise((resolve, reject) => {
        rimraf(destination, error => {
            if (error) {
                console.error(error);
                resolve();
                return;
            }
            console.log(`rimraf success!`);
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(source, destination, error => {
            if (error) {
                console.error(error);
                resolve();
                return;
            }
            console.log('ncp success!');
            resolve();
        });
    });
}

async function copyLibs() {
    {
        const srcDir = './src/components/xe2';
        const destDir = '../vue-xe2-plugin/dist-node/components/xe2';
        console.log(`--- ${srcDir} -> ${destDir} ---`);
        await clearAndCopyLib(srcDir, destDir);  
    }

    {
        const srcDir = './src/components/xe2-dist-web';
        const destDir = '../vue-xe2-plugin/dist-web';
        console.log(`--- ${srcDir} -> ${destDir} ---`);
        await clearAndCopyLib(srcDir, destDir);  
    }
}

copyLibs();
