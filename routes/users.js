import express from 'express';
const router = express.Router();

// 用户列表
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
];

// 获取所有用户
router.get('/', (req, res) => {
  res.render('users/index', {
    title: '用户列表',
    users: users
  });
});

// 获取单个用户
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).render('error', {
      title: '用户未找到',
      message: '指定的用户不存在',
      error: { status: 404 }
    });
  }
  
  res.render('users/detail', {
    title: `用户详情 - ${user.name}`,
    user: user
  });
});

export default router;