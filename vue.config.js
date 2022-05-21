const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
    .rule('tsx')
    .test(/\.tsx?$/)
    .use('ts-loader')
    .loader('ts-loader')
  }
})
