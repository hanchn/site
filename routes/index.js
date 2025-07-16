const express = require('express');
const router = express.Router();
const dataService = require('../mock/services/dataService');

/* GET home page. */
router.get('/', function(req, res, next) {
  try {
    const videos = dataService.getHomePageVideos();
    const categories = dataService.getCategories();
    
    res.render('pages/index', {
      title: 'VideoSite - 首页',
      pageStyle: 'home',
      currentPath: req.path,
      videos: videos,
      categories: categories
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    next(error);
  }
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('pages/about', {
    title: 'VideoSite - 关于我们',
    pageStyle: 'about',
    currentPath: req.path
  });
});

/* GET trending page. */
router.get('/trending', function(req, res, next) {
  try {
    const videos = dataService.getTrendingVideos(20);
    const categories = dataService.getCategories();
    
    res.render('pages/trending', {
      title: 'VideoSite - 时下流行',
      pageStyle: 'home',
      currentPath: req.path,
      videos: videos,
      categories: categories
    });
  } catch (error) {
    console.error('Error loading trending page:', error);
    next(error);
  }
});

/* GET search results. */
router.get('/search', function(req, res, next) {
  try {
    const query = req.query.q || '';
    const videos = query ? dataService.searchVideos(query, 20) : [];
    const categories = dataService.getCategories();
    
    res.render('pages/search', {
      title: `VideoSite - 搜索: ${query}`,
      pageStyle: 'home',
      currentPath: req.path,
      query: query,
      videos: videos,
      categories: categories
    });
  } catch (error) {
    console.error('Error loading search page:', error);
    next(error);
  }
});

/* GET video detail page. */
router.get('/videos/:id', function(req, res, next) {
  try {
    const videoId = req.params.id;
    const video = dataService.getVideoWithDetails(videoId);
    
    if (!video) {
      return res.status(404).render('pages/error', {
        title: 'VideoSite - 视频未找到',
        pageStyle: 'error',
        currentPath: req.path,
        error: {
          status: 404,
          message: '视频未找到'
        }
      });
    }
    
    // 获取相关视频
    const relatedVideos = dataService.getVideosByCategory(video.categoryId, 10)
      .filter(v => v.id !== video.id);
    
    res.render('pages/video', {
      title: `VideoSite - ${video.title}`,
      pageStyle: 'video',
      currentPath: req.path,
      video: video,
      relatedVideos: relatedVideos
    });
  } catch (error) {
    console.error('Error loading video page:', error);
    next(error);
  }
});

module.exports = router;