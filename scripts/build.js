const fs = require('fs-extra');
const childProcess = require('child_process');


try {
    // Remove current build
    fs.removeSync('./dist/');
    // Copy front-end files
    fs.copySync('./public', './dist/public');
    fs.copySync('./views', './dist/views');
    // Transpile the typescript files
    childProcess.exec('tsc');
} catch (err) {
    console.log(err);
}
