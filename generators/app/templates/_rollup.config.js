/**
 *
 * @author <%= projectAuthor %>
 * @email <%= projectEmail %>
 * @since  <%= projectCreatedAt %>
 */
'use strict';

console.log('building start:');
const rollup = require('rollup');
const replace = require('rollup-plugin-replace');
// Rollup的模块引用只支持 ES6 Module，其他的需要采用 npm 和 commonjs 的插件去解决
const json = require('rollup-plugin-json');// allows Rollup to import data = requirea JSON file
const nodeResolve = require('rollup-plugin-node-resolve');// teaches Rollup how to find external modules
const commonjs = require('rollup-plugin-commonjs');// the majority of packages on npm are exposed as CommonJS modules. We need to convert CommonJS to ES2015 before Rollup can process them.
const eslint = require('rollup-plugin-eslint');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');
const istanbul = require('rollup-plugin-istanbul');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const minify  = require('uglify-js').minify;
const babelrc = require('babelrc-rollup').default;
const shell = require('shelljs');

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

const formatArr = [
    'es',
    'amd',
    'cjs',
    'iife',
    'umd'
];

shell.rm('-rf', 'dist');

module.exports = {
    input: 'src/index.js',
    plugins: [
        json(),
        eslint({ // https://www.npmjs.com/package/rollup-plugin-eslint
            throwError: true,
            exclude: ['package.json', 'node_modules/**']
        }),
        // Replace strings in files while bundling them.
        // https://github.com/rollup/rollup-plugin-replace
        replace({
            exclude: 'node_modules/**',
            CURRENT: JSON.stringify(process.env.NODE_ENV)
        }),
        istanbul({
            exclude: ['test/**/*', 'node_modules/**/*']
        }),
        globals(),
        builtins(),
        nodeResolve({
            jsnext: true,
            extensions: ['.js', '.json']
        }),
        commonjs(),
        babel(babelrc({ addModuleOptions: false })),// https://github.com/eventualbuddha/babelrc-rollup/issues/6
        // https://github.com/TrySound/rollup-plugin-uglify
        (process.env.NODE_ENV === 'production' && uglify(
            {
                output: {
                    comments: function(node, comment) {
                        let text = comment.value;
                        let type = comment.type;
                        if (type == 'comment2') {
                            // multiline comment
                            return /@preserve|@license|@cc_on/i.test(text);
                        }
                    }
                }
            },
            minify
        ))// 注意这里的minify，如果用的是uglify2，相应地需要在package.json中添加"uglify-js": "git+https://github.com/mishoo/UglifyJS2.git#harmony"，再重新install一下，解决uglify默认无法处理ES2015语法的问题
    ],
    external: external,
    output: [
        {
            format: 'es',
            name: '<%= projectNameCamelCase %>',// UMD、IIFE模式中需要 name
            sourcemap: true,
            file: 'dist/<%= projectNameCamelCase %>.es.mjs'
        },
        {
            format: 'amd',
            name: '<%= projectNameCamelCase %>',// UMD、IIFE模式中需要 name
            sourcemap: true,
            file: 'dist/<%= projectNameCamelCase %>.amd.mjs'
        },
        {
            format: 'cjs',
            name: '<%= projectNameCamelCase %>',// UMD、IIFE模式中需要 name
            sourcemap: true,
            file: 'dist/<%= projectNameCamelCase %>.cjs.mjs'
        },
        {
            format: 'iife',
            name: '<%= projectNameCamelCase %>',// UMD、IIFE模式中需要 name
            sourcemap: true,
            file: 'dist/<%= projectNameCamelCase %>.iife.mjs'
        },
        {
            format: 'umd',
            name: '<%= projectNameCamelCase %>',// UMD、IIFE模式中需要 name
            sourcemap: true,
            file: 'dist/<%= projectNameCamelCase %>.umd.mjs'
        }
    ]
}
