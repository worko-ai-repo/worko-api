// const path = require("path");

// module.exports = {
//   entry: "./src/app.ts",
//   target: "node",
//   mode: "development",

//   output: {
//     publicPath: "dist",
//     path: path.resolve(__dirname, "dist"),
//     filename: "bundle.js",
//   },
//   resolve: {
//     extensions: [".ts", ".js"],
//   },

//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         use: "ts-loader",
//         include: [path.resolve(__dirname, "src")],
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   devServer: {
//     static: {
//       directory: path.join(__dirname, "dist"), // The root directory to serve content from
//     },
//     compress: true, // Enable gzip compression
//     port: 8080, // Port on which the development server will run
//     hot: true, // Enable hot module replacement
//   },
// };

const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  mode: slsw.lib.webpack.isLocal ? "development" : "production", // Use "production" for deployment

  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: /node_modules/,
      },
    ],
  },
};
