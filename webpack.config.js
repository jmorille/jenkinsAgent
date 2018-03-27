const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
//const  command = require("shebang!../bin/command");
module.exports = {

    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    module: {
        rules: [
            {
                test: path.resolve(__dirname, 'src/index.js'),
                use: 'shebang-loader',
            },
        ],
    },

};