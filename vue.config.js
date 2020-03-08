module.exports = {
  devServer: {
    proxy: 'http://127.0.0.1:8100'
  },

  transpileDependencies: [
    'vuetify'
  ],

  pwa: {
    themeColor: '#4A90E2',
    manifestCrossorigin: 'anonymous'
  }
}
