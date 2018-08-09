export default {
  pages: {
    '/': { context: { title: '项目列表' } },
  },
  plugins: [
    "umi-plugin-dva"
  ],
  // hd: true,
  hashHistory: false,
  // exportStatic: true,
};