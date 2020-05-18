const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    mode : 'development',
    entry : './src/index.ts',
    module : {
        rules : [
            {
                test : /\.tsx?$/,
                loader: 'ts-loader',
                exclude: '/node-modules/'
            }
        ]
    },
    resolve : {
        extensions : ['.tsx', '.ts', '.js']
    },
    output : {
        filename : 'bundle.js',
        path : path.resolve(__dirname, 'dist')
    },
    plugins : [new HtmlWebpackPlugin({
        template : 'src/index.ejs'
    })],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000
      }
};