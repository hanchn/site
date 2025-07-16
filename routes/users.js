const express = require('express');
const router = express.Router();
const dataService = require('../mock/services/dataService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  try {
    const users = dataService.getUsers();
    
    res.render('users/index', {
      title: 'VideoSite - 用户列表',
      pageStyle: 'users',
      currentPath: req.path,
      users: users
    });
  } catch (error) {
    console.error('Error loading users page:', error);
    next(error);
  }
});

/* GET user detail page. */
router.get('/:id', function(req, res, next) {
  try {
    const userId = req.params.id;
    const user = dataService.getUserById(userId);
    
    if (!user) {
      return res.status(404).render('pages/error', {
        title: 'VideoSite - 用户未找到',
        pageStyle: 'error',
        currentPath: req.path,
        error: {
          status: 404,
          message: '用户未找到'
        }
      });
    }
    
    // 获取用户的视频
    const userVideos = dataService.getVideosByAuthor(userId, 20);
    
    res.render('users/detail', {
      title: `VideoSite - ${user.displayName}`,
      pageStyle: 'users',
      currentPath: req.path,
      user: user,
      videos: userVideos
    });
  } catch (error) {
    console.error('Error loading user detail page:', error);
    next(error);
  }
});

module.exports = router;