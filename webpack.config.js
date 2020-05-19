const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry : './src/index.ts',
    module : {
        rules : [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader"
                }
            }
        ]
    },
    resolve : {
        extensions : ['.tsx', '.ts', '.js'],
        modules : ["node_modules", "src"]
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