import express from 'express';
const router = express.Router();

// 首页路由
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Express + EJS 项目',
    message: '欢迎使用Express和EJS！',
    currentYear: new Date().getFullYear()
  });
});

// 关于页面路由
router.get('/about', (req, res) => {
  res.render('about', {
    title: '关于我们',
    description: '这是一个使用Express和EJS构建的现代化Web应用程序'
  });
});

export default router;