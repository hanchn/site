import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.cache = new Map();
  }

  // 读取JSON文件
  readJsonFile(filename) {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const filePath = path.join(this.dataPath, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return filename === 'siteConfig.json' ? {} : [];
    }
  }

  // 获取网站配置
  getSiteConfig() {
    return this.readJsonFile('siteConfig.json');
  }

  // 获取导航数据
  getNavigationData() {
    const config = this.getSiteConfig();
    return config.navigation || {};
  }

  // 获取订阅频道列表
  getSubscribedChannels() {
    const navigation = this.getNavigationData();
    return navigation.subscriptions || [];
  }

  // 获取所有用户
  getUsers() {
    return this.readJsonFile('users.json');
  }

  // 根据ID获取用户
  getUserById(id) {
    const users = this.getUsers();
    return users.find(user => user.id === parseInt(id));
  }

  // 获取所有视频
  getVideos() {
    return this.readJsonFile('videos.json');
  }

  // 根据ID获取视频
  getVideoById(id) {
    const videos = this.getVideos();
    return videos.find(video => video.id === parseInt(id));
  }

  // 获取热门视频
  getTrendingVideos(limit = 20) {
    const videos = this.getVideos();
    return videos
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // 根据分类获取视频
  getVideosByCategory(categoryId, limit = 20) {
    const videos = this.getVideos();
    return videos
      .filter(video => video.categoryId === parseInt(categoryId))
      .slice(0, limit);
  }

  // 根据作者获取视频
  getVideosByAuthor(authorId, limit = 20) {
    const videos = this.getVideos();
    return videos
      .filter(video => video.authorId === parseInt(authorId))
      .slice(0, limit);
  }

  // 搜索视频
  searchVideos(query, limit = 20) {
    const videos = this.getVideos();
    const searchTerm = query.toLowerCase();
    
    return videos
      .filter(video => 
        video.title.toLowerCase().includes(searchTerm) ||
        video.description.toLowerCase().includes(searchTerm) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);
  }

  // 获取所有分类
  getCategories() {
    return this.readJsonFile('categories.json');
  }

  // 获取特色分类
  getFeaturedCategories() {
    const categories = this.getCategories();
    return categories.filter(category => category.featured);
  }

  // 根据ID获取分类
  getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find(category => category.id === parseInt(id));
  }

  // 获取所有频道
  getChannels() {
    return this.readJsonFile('channels.json');
  }

  // 根据ID获取频道
  getChannelById(id) {
    const channels = this.getChannels();
    return channels.find(channel => channel.id === parseInt(id));
  }

  // 获取完整的视频信息（包含作者和分类信息）
  getVideoWithDetails(id) {
    const video = this.getVideoById(id);
    if (!video) return null;

    const author = this.getUserById(video.authorId);
    const category = this.getCategoryById(video.categoryId);

    return {
      ...video,
      author,
      category
    };
  }

  // 获取首页推荐视频
  getHomePageVideos() {
    const videos = this.getVideos();
    const users = this.getUsers();
    const categories = this.getCategories();

    return videos.map(video => {
      const author = users.find(user => user.id === video.authorId);
      const category = categories.find(cat => cat.id === video.categoryId);
      
      return {
        ...video,
        author: {
          id: author.id,
          displayName: author.displayName,
          avatar: author.avatar,
          verified: author.verified
        },
        category: {
          name: category.name,
          slug: category.slug,
          color: category.color
        },
        // 格式化数据
        formattedViewCount: this.formatNumber(video.viewCount),
        formattedPublishDate: this.formatDate(video.publishDate)
      };
    });
  }

  // 获取页面完整数据（包含网站配置、导航等）
  getPageData(additionalData = {}) {
    const siteConfig = this.getSiteConfig();
    const navigation = this.getNavigationData();
    const categories = this.getCategories();
    
    return {
      site: siteConfig.site || {},
      navigation: navigation,
      categories: categories,
      ...additionalData
    };
  }

  // 格式化数字
  formatNumber(num) {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + '千万';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + '百万';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // 格式化日期
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '1天前';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}周前`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}个月前`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}年前`;
    }
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
  }

  // 获取分页的收藏视频
  getCollectionVideos(page = 1, limit = 12) {
    const videos = this.getVideos();
    const users = this.getUsers();
    const categories = this.getCategories();
    
    // 模拟收藏数据，实际应该从数据库获取用户收藏的视频ID列表
    const collectionVideoIds = videos.slice(0, Math.floor(videos.length * 0.7)).map(v => v.id);
    
    const collectionVideos = videos
      .filter(video => collectionVideoIds.includes(video.id))
      .map(video => {
        const author = users.find(user => user.id === video.authorId);
        const category = categories.find(cat => cat.id === video.categoryId);
        
        return {
          ...video,
          author: {
            id: author.id,
            displayName: author.displayName,
            avatar: author.avatar,
            verified: author.verified
          },
          category: {
            name: category.name,
            slug: category.slug,
            color: category.color
          },
          formattedViewCount: this.formatNumber(video.viewCount),
          formattedPublishDate: this.formatDate(video.publishDate)
        };
      });
    
    const total = collectionVideos.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedVideos = collectionVideos.slice(offset, offset + limit);
    
    return {
      videos: paginatedVideos,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: limit
      }
    };
  }
}

export default new DataService();