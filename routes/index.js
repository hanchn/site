import express from 'express';
import dataService from '../mock/services/dataService.js';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  try {
    const videos = dataService.getHomePageVideos();
    const pageData = dataService.getPageData({
      videos: videos,
      featuredCategories: dataService.getFeaturedCategories()
    });
    
    res.render('pages/index', {
      title: `${pageData.site.name || 'VideoSite'} - 首页`,
      pageStyle: 'home',
      currentPath: req.path,
      ...pageData
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    next(error);
  }
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  try {
    const pageData = dataService.getPageData();
    
    res.render('pages/about', {
      title: `${pageData.site.name || 'VideoSite'} - 关于我们`,
      pageStyle: 'about',
      currentPath: req.path,
      ...pageData
    });
  } catch (error) {
    console.error('Error loading about page:', error);
    next(error);
  }
});

/* GET trending page. */
router.get('/trending', function(req, res, next) {
  try {
    const videos = dataService.getTrendingVideos(20);
    const pageData = dataService.getPageData({ videos });
    
    res.render('pages/trending', {
      title: `${pageData.site.name || 'VideoSite'} - 时下流行`,
      pageStyle: 'home',
      currentPath: req.path,
      ...pageData
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
    const pageData = dataService.getPageData({ videos, query });
    
    res.render('pages/search', {
      title: `${pageData.site.name || 'VideoSite'} - 搜索: ${query}`,
      pageStyle: 'home',
      currentPath: req.path,
      ...pageData
    });
  } catch (error) {
    console.error('Error loading search page:', error);
    next(error);
  }
});

/* GET collection page. */
router.get('/collection', function(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    
    const collectionData = dataService.getCollectionVideos(page, limit);
    const pageData = dataService.getPageData({
      videos: collectionData.videos,
      pagination: collectionData.pagination,
      featuredCategories: dataService.getFeaturedCategories()
    });
    
    res.render('pages/collection', {
      title: `${pageData.site.name || 'VideoSite'} - 我的收藏`,
      pageStyle: 'home',
      currentPath: req.path,
      ...pageData
    });
  } catch (error) {
    console.error('Error loading collection page:', error);
    next(error);
  }
});

/* GET video detail page. */
router.get('/videos/:id', function(req, res, next) {
  try {
    const videoId = req.params.id;
    const video = dataService.getVideoWithDetails(videoId);
    
    if (!video) {
      const pageData = dataService.getPageData();
      return res.status(404).render('pages/error', {
        title: `${pageData.site.name || 'VideoSite'} - 视频未找到`,
        pageStyle: 'error',
        currentPath: req.path,
        ...pageData,
        error: {
          status: 404,
          message: '视频未找到'
        }
      });
    }
    
    // 获取相关视频
    const relatedVideos = dataService.getVideosByCategory(video.categoryId, 10)
      .filter(v => v.id !== video.id);
    
    const pageData = dataService.getPageData({ video, relatedVideos });
    
    res.render('pages/video', {
      title: `${pageData.site.name || 'VideoSite'} - ${video.title}`,
      pageStyle: 'video',
      currentPath: req.path,
      ...pageData
    });
  } catch (error) {
    console.error('Error loading video page:', error);
    next(error);
  }
});

export default router;