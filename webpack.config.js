var path = require("path");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

var extractLess = new ExtractTextPlugin({
    filename: "app.css"
});

var extractHtml = new HtmlWebpackPlugin({
    template: "index.template.html"
});

module.exports = {
    entry: "./js/app.js",
    output: {
        path: path.resolve(__dirname, "out"),
        filename: "app.bundle.js"
    },
    module: {
        loaders: [
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader",
                options: {
                    failOnWarning: true,
                    failOnError: true
                }
            },
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
    resolve: {
        extensions: [".js"],
        alias: {
            js: path.resolve(__dirname, "./js"),
            html: path.resolve(__dirname, "./html")
        }
    },
    plugins: [
        extractLess,
        extractHtml,
    ],
    devtool: 'eval-source-map'
};