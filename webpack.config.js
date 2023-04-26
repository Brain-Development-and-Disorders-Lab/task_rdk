const path = require("path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  console.log("Target:", env.target || "desktop");

  return {
    mode: "development",
    entry: {
      index: "./src/index.ts",
    },
    devtool: "inline-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        title: "RDK Game",
      }),
      new DefinePlugin({
        __TARGET__: JSON.stringify(env.target || "desktop"),
      }),
    ],
    devServer: {
      contentBase: [
        // Output path
        path.join(__dirname, "./dist"),
        // Assets path
        path.join(__dirname, "./src/img"),
      ],
      // Required public path for assets
      contentBasePublicPath: "/img",
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].bundle.js",
      clean: true,
    },
  };
};
