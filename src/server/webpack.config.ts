import path from 'path';
import { Configuration, IgnorePlugin } from 'webpack';
const config: Configuration = {
    entry: './index.ts',
    module: {
        rules: [
            {
                test: /\.(ts|js)?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript',
                        ],
                    },
                },
            },
            {
                test: /\.html/,
                type: 'asset',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            bcrypt: path.resolve(__dirname, 'shims/bcrypt.js'),
        },
    },
    plugins: [
        new IgnorePlugin({ resourceRegExp: /^aws-sdk$/ }),
        new IgnorePlugin({ resourceRegExp: /^bufferutil$/ }),
        new IgnorePlugin({ resourceRegExp: /^mock-aws-s3$/ }),
        new IgnorePlugin({ resourceRegExp: /^nock$/ }),
        new IgnorePlugin({ resourceRegExp: /^node-gyp$/ }),
        new IgnorePlugin({ resourceRegExp: /^npm$/ }),
        new IgnorePlugin({ resourceRegExp: /^pg-native$/ }),
        new IgnorePlugin({ resourceRegExp: /^utf-8-validate$/ }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    target: 'node',
};
export default config;
