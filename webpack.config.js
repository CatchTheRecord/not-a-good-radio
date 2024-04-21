const path = require('path');

module.exports = {
    entry: './index.js',
    target: 'node',
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        usedExports: false,
    },
    stats: {
        moduleTrace: false
    },
    node: {
        __dirname: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
