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
      return [];
    }
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
          color: category.color
        },
        // 格式化数据
        formattedViewCount: this.formatNumber(video.viewCount),
        formattedPublishDate: this.formatDate(video.publishDate)
      };
    });
  }

  // 格式化数字
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + '万';
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
}

export default new DataService();