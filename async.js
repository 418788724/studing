//（1）回调函数。将异步操作包装成 Thunk 函数，在回调函数里面交回执行权。
//（2）Promise 对象。将异步操作包装成 Promise 对象，用then方法交回执行权。

/**
 * 原生用promise包装fs模块的readFile
 * 基于 Promise 对象的自动执行
 * 用到const fs = require('fs');
 */
(() => {
    const fs = require('fs');

    let readFile = function (fileName) {
        return new Promise(function (resolve, reject) {
            fs.readFile(fileName, function (error, data) {
                if (error) return reject(error);
                resolve(data);
            });
        });
    };

    let gen = function* () {
        let f1 = yield readFile('./input.txt');
        let f2 = yield readFile('./output.txt');
        console.log(f1.toString());
        console.log(f2.toString());
    };

    // //手动执行Generator函数
    // let g = gen();
    // g.next().value.then(function (data) {
    //     g.next(data).value.then(function (data) {
    //         g.next(data);
    //     });
    // });

    //自动执行Generator函数，根据co模块原理
    function run(gen) {
        let g = gen();

        function next(data) {
            let result = g.next(data);
            if (result.done) return result.value;
            result.value.then(function (data) {
                next(data);
            });
        }
        next();
    }

    run(gen);
})();

/**
 * 只要 Generator 函数还没执行到最后一步，
 * next函数就调用自身，以此实现自动执行。
 * 基于Thunk函数的自动执行
 * const fs = require('fs');
 * const thunkify = require('thunkify');
 */
(() => {
    const fs = require('fs'),
        thunkify = require('thunkify'),
        readFileThunk = thunkify(fs.readFile);

    function* gen() {
        let r1 = yield readFileThunk('./input.txt');
        console.log(r1.toString());
        let r2 = yield readFileThunk('./output.txt');
        console.log(r2.toString());
    }

    //手动执行Generator函数
    // let  g = gen();
    // let  r1 = g.next();
    // r1.value(function(err, data){
    //     if(err) throw err;
    //     let r2 = g.next(data);
    //     r2.value(function(err, data){
    //         if(err) throw err;
    //         g.next(data);
    //     });
    // });

    //自动执行Generator函数，根据co模块原理
    function run(fn) {
        let gen = fn();

        function next(err, data) {
            //console.log(gen.next(data));
            let result = gen.next(data);
            if (result.done) return;
            result.value(next);
        }

        next();
    }

    run(gen);

})();

/**
 * 不用Thunkify和co模块实现异步
 */
;
(() => {
    const fs = require('fs');
    //Thunk函数
    const Thunk = (fn) => (...args) => (callback) => fn.call(this, ...args, callback);
    const readFileThunk = Thunk(fs.readFile);
    //Generator函数
    function* gen() {
        let r1 = yield readFileThunk('input.txt');
        console.log(r1.toString());
        let r2 = yield readFileThunk('output.txt');
        console.log(r2.toString());
    }
    //自动执行Generator函数,根据co模块原理
    function runAuto(fn) {
        let g = fn();

        function next(err, data) {
            let result = g.next(data);
            if (result.done) return;
            result.value(next);
        }
        next();
    }

    runAuto(gen);

})();

/**
 * ES7中async异步执行，Generator函数的语法糖
 */
;
(() => {

    const fs = require('fs');

    const readFile = function (fileName) {
        return new Promise(function (resolve, reject) {
            fs.readFile(fileName, function (error, data) {
                if (error) return reject(error);
                resolve(data);
            });
        });
    };

    const asyncReadFile = async function () {
        const f1 = await readFile('input.txt');
        const f2 = await readFile('output.txt');
        console.log(f1.toString());
        console.log(f2.toString());
    };
    asyncReadFile();
})();