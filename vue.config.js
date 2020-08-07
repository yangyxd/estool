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
    // 在这里配置代理服务（解决跨域问题）
    devServer: {
        // 服务器会将任何未知请求代理到这个地址
        // 注意：请将这个地址同样设置给 config.js 中的 sProxyBaseUrl
        proxy: 'https://es-c2f345l7.public.tencentelasticsearch.com:9200'
    }
}