const path = require('path')
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
    // entry: './src/client/cannon/cannonShootGame.ts',
    entry: './src/client/multiLoader.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: isProduction ? 'bundle.[hash].js' : 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    },
}