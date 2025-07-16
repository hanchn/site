import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404错误处理
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '页面未找到',
    message: '抱歉，您访问的页面不存在',
    error: { status: 404 }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  res.status(err.status || 500);
  res.render('error', {
    title: '服务器错误',
    message: err.message,
    error: err
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;