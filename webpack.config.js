const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
//const  command = require("shebang!../bin/command");
module.exports = {
    entry:   './src/server.js',
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    resolve: {
        // Add in `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        modules: [
            path.resolve(__dirname,`/node_modules`),
            'node_modules'
        ]
    },
    module: {
        rules: [
            {
                test: path.resolve(__dirname, 'src/server.js'),
                use: 'shebang-loader',
            },
            {
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                test: /\.tsx?$/,
                use: [ {  loader: 'ts-loader' } ]
            }
        ],
    },

};