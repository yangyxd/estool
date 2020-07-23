const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
    publicPath: './',
    assetsDir: 'static',
    productionSourceMap: false,
    runtimeCompiler: true,
    configureWebpack: config => {
        let plugins = [
            // `npm run build --report`
            // new BundleAnalyzerPlugin()
        ];
        if (process.env.NODE_ENV === 'production') {
            // 正式运行使用 gzip
            // plugins.push(new CompressionWebpackPlugin({
            //     test: /\.js$|\.html$|\.css/, // 匹配文件名
            //     threshold: 2048, // 对超过2k的数据进行压缩
            //     deleteOriginalAssets: false, // 是否删除原文件
            // }))
        }
        return {
            plugins: plugins
        };
    },
    // devServer: {
    //     proxy: {
    //         '/api':{
    //             target:'http://jsonplaceholder.typicode.com',
    //             changeOrigin:true,
    //             pathRewrite:{
    //                 '/api':''
    //             }
    //         }
    //     }
    // }
}