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
    entry: "./ts/app.ts",
    output: {
        path: path.resolve(__dirname, "out"),
        filename: "app.bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            },
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
        extensions: [".ts"],
        alias: {
            ts: path.resolve(__dirname, "ts"),
            html: path.resolve(__dirname, "html"),
            images: path.resolve(__dirname, "images")
        }
    },
    plugins: [
        esLintWebpack,
        extractLess,
        extractHtml
    ],
    devtool: "eval-source-map"
};