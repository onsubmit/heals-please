const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");

const extractLess = new MiniCssExtractPlugin({
    filename: "app.css"
});

const extractHtml = new HtmlWebpackPlugin({
    template: "index.template.html"
});

const esLintWebpack = new ESLintWebpackPlugin({
    failOnWarning: true
});

module.exports = {
    mode: "production",
    entry: "./js/app.js",
    output: {
        path: path.resolve(__dirname, "out"),
        filename: "app.bundle.js"
    },
    module: {
        rules: [
            {
                test: /knockout-latest(\.debug)?\.js$/,
                loader: "expose-loader",
                options: {
                    exposes: [ "ko" ]
                }
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                options:
                {
                    minimize: false,
                    esModule: false
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options:
                        {
                            name: "[path][name].[ext]",
                            esModule: false
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "less-loader"
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js"],
        alias: {
            js: path.resolve(__dirname, "./js"),
            html: path.resolve(__dirname, "./html"),
            images: path.resolve(__dirname, "./images")
        }
    },
    plugins: [
        esLintWebpack,
        extractLess,
        extractHtml
    ],
    devtool: "eval-source-map"
};