const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
    mode: 'production',
    performance: {
        hints: false,
    },
})
// const { merge } = require('webpack-merge');
// const common = require('./webpack.common.js');
// const TerserPlugin = require('terser-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const path = require('path');

// module.exports = merge(common, {
//     mode: 'production',
//     // devtool: 'source-map',
//     // optimization: {
//     //     minimize: true,
//     //     minimizer: [new TerserPlugin()],
//     //     splitChunks: {
//     //         chunks: 'all',
//     //         name: false,
//     //     },
//     // },
//     plugins: [
//         new CleanWebpackPlugin(),
//         // new HashedModuleIdsPlugin({
//         //     hashDigestLength: 6,
//         // }),
//     ],
//     performance: {
//         hints: false,
//     },
// });
