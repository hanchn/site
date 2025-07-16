import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import dataService from './mock/services/dataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 主题配置
const CURRENT_THEME = process.env.THEME || 'default';
const THEME_PATH = path.join(__dirname, 'views', 'themes', CURRENT_THEME);

// 设置视图引擎和主题路径
app.set('view engine', 'ejs');
app.set('views', THEME_PATH);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 全局变量中间件
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.currentYear = new Date().getFullYear();
    res.locals.theme = CURRENT_THEME;
    next();
});

// 自定义渲染函数
app.use((req, res, next) => {
    const originalRender = res.render;
    
    res.render = function(view, options = {}, callback) {
        // 如果是页面模板，使用布局
        if (view.startsWith('pages/') || ['index', 'about', 'error'].includes(view)) {
            const templatePath = view.startsWith('pages/') ? view : `pages/${view}`;
            
            // 渲染页面内容
            app.render(templatePath, options, (err, html) => {
                if (err) return callback ? callback(err) : next(err);
                
                // 将页面内容传递给布局
                const layoutOptions = {
                    ...options,
                    body: html
                };
                
                originalRender.call(this, 'layouts/main', layoutOptions, callback);
            });
        } else {
            // 直接渲染其他模板
            originalRender.call(this, view, options, callback);
        }
    };
    
    next();
});

// 路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404错误处理
app.use((req, res, next) => {
    try {
        const pageData = dataService.getPageData();
        res.status(404).render('error', {
            title: `${pageData.site.name || 'VideoSite'} - 页面未找到`,
            message: '抱歉，您访问的页面不存在',
            error: { status: 404 },
            pageStyle: 'error',
            currentPath: req.path,
            ...pageData
        });
    } catch (error) {
        console.error('Error in 404 handler:', error);
        res.status(404).send('页面未找到');
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    try {
        const pageData = dataService.getPageData();
        res.status(err.status || 500);
        res.render('error', {
            title: `${pageData.site.name || 'VideoSite'} - 服务器错误`,
            message: err.message,
            error: err,
            pageStyle: 'error',
            currentPath: req.path,
            ...pageData
        });
    } catch (error) {
        console.error('Error in error handler:', error);
        res.status(500).send('服务器内部错误');
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`当前主题: ${CURRENT_THEME}`);
});

export default app;