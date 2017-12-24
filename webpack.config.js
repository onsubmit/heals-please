var path = require("path");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

var extractLess = new ExtractTextPlugin({
    filename: "app.css"
});

var extractHtml = new HtmlWebpackPlugin({
    title: "Heals, please."
});

module.exports = {
    entry: "./js/app.js",
    output: {
        path: path.resolve(__dirname, "out"),
        filename: "app.bundle.js"
    },
    module: {
        loaders:
        [
            {
                test: /knockout-latest(\.debug)?\.js$/,
                loader: "expose-loader?ko"
            },
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options:
                        {
                            name: "[path][name].[ext]"
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: extractLess.extract({
                    use: [
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "less-loader"
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        extractLess,
        extractHtml
    ],
    devtool: 'eval-source-map'
}