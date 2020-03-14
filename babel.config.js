module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ['prismjs', {
      languages: ['javascript', 'bash', 'yaml'],
      plugins: ['line-numbers'],
      theme: 'tomorrow',
      css: true
    }]
  ]
}
