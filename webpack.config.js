const path = require("path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  return {
    mode: "development",
    entry: {
      index: "./src/index.ts",
    },
    devtool: "inline-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        title: "RDK Task",
      }),
      new DefinePlugin({
        __TARGET__: JSON.stringify(env.target || "desktop"),
      }),
    ],
    devServer: {
      contentBase: [
        // Output path
        path.join(__dirname, "./dist"),
        // Stimuli path
        path.join(__dirname, "./src/stimuli"),
        // Resources path
        path.join(__dirname, "./src/resources"),
      ],
      // Required public path for assets
      contentBasePublicPath: "/stimuli",
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
