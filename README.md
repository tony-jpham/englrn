# EnglRN - English Learning Daily Vocabulary Bot

## 📚 Mô Tả Dự Án

**EnglRN** là một ứng dụng backend để cung cấp từ vựng tiếng Anh hàng ngày cho người học qua **Discord**. Dự án tích hợp Node.js, Express, MongoDB và Discord Webhook để tự động gửi các bài học từ vựng mỗi ngày.

## 🎯 Tính Năng Chính

- **📤 Gửi từ vựng hàng ngày**: Tự động gửi danh sách từ vựng tiếng Anh qua Discord
- **📊 Quản lý cơ sở dữ liệu**: Lưu trữ và theo dõi các từ vựng đã học qua MongoDB
- **🔄 Lập lịch tự động**: Sử dụng node-cron để gửi từ vựng định kỳ
- **🏷️ Phân loại từ vựng**: Các từ được phân loại theo cấp độ (beginner, intermediate, advanced), thẻ và loại
- **✅ Theo dõi tiến độ**: Ghi nhận lịch sử từ vựng đã sử dụng và số lượng từ đã học

## 🛠️ Stack Công Nghệ

### Backend
- **Node.js** + **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database & ORM
- **node-cron** - Lập lịch tự động
- **Discord Webhook** - Gửi tin nhắn tới Discord
- **Moment.js** - Xử lý ngày giờ
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Auto-restart server khi có thay đổi
- **Morgan** - HTTP request logger
- **Dotenv** - Quản lý biến môi trường

## 📁 Cấu Trúc Dự Án

```
englrn/
├── app.js                 # Express app configuration
├── package.json           # Dependency management
├── .env                   # Environment variables
├── bin/
│   └── www               # Application entry point
├── config/
│   └── db.js             # MongoDB connection setup
├── models/
│   └── Word.js           # Word schema & model
├── routes/
│   ├── index.js          # Main routes
│   └── users.js          # User routes
├── jobs/
│   ├── SendVocab.js      # Daily vocabulary sender
│   └── utils/
│       ├── DiscordMessage.js  # Discord webhook integration
│       └── WordHandling.js    # Word database operations
├── controllers/          # (Placeholder for controllers)
├── public/               # Static files (HTML, CSS, JS)
├── config/db.js          # Database configuration
└── README.md             # Project documentation
```

## 🗄️ Mô Hình Dữ Liệu

### Word Schema
```javascript
{
  id: String,              // Unique identifier (e.g., biz_0001)
  term: String,           // English word
  type: String,           // Part of speech (noun, verb, etc.)
  meaning_vi: String,     // Vietnamese meaning
  tags: [String],         // Classification tags (e.g., ["software", "development"])
  level: String,          // Difficulty level (beginner, intermediate, advanced)
  examples: [Object],     // Usage examples with English & Vietnamese
  lastUsed: Date          // Last sent date for tracking
}
```

## 🔧 Cài Đặt & Chạy

### Prerequisites
- Node.js (v14+)
- MongoDB database
- Discord Webhook URL

### Installation

1. **Clone/Download dự án**
   ```bash
   cd englrn
   ```

2. **Cài đặt dependencies**
   ```bash
   yarn install
   ```

3. **Cấu hình environment variables**
   
   Tạo file `.env` với nội dung:
   ```
   PORT=8080
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/englrn
   DISCORD_HOOK_URL=your_discord_webhook_url
   ENG_LRN_AVATAR_URL=your_avatar_image_url
   WORD_PER_DAY=10
   ```

4. **Chạy development server**
   ```bash
   yarn dev
   ```
   
   Hoặc chạy production:
   ```bash
   yarn start
   ```

## 📋 Cách Sử Dụng

### API Endpoints

- `GET /` - Homepage
- `GET /users` - User routes

### Scheduled Jobs

**SendVocab.js** - Gửi từ vựng hàng ngày
- Lấy số từ vựng được cấu hình (mặc định: 10 từ/ngày)
- Lấy các từ chưa được sử dụng từ database
- Định dạng tin nhắn với:
  - Số thứ tự
  - Từ tiếng Anh
  - Nghĩa tiếng Việt
  - Link dịch Google
  - Thống kê số từ đã học
- Gửi qua Discord Webhook
- Cập nhật trạng thái "đã sử dụng" trong database

## 🎓 Dữ Liệu Từ Vựng

Dự án hiện chứa **300 bài học từ vựng** tập trung vào:
- **Software Development** (Phát triển phần mềm)
- **Agile Methodologies** (Phương pháp Agile)
- **Version Control** (Kiểm soát phiên bản)
- **Database & Backend** (Cơ sở dữ liệu & Backend)
- **DevOps & Tools** (DevOps & Công cụ)

Mỗi từ vựng bao gồm:
- Định nghĩa tiếng Việt
- Ví dụ sử dụng (có dịch tiếng Việt)
- Cấp độ khó (beginner/intermediate/advanced)
- Thẻ phân loại

Dữ liệu được lưu trong: `jobs/Untitled-1.json` (300 entries)

## 🔄 Workflow Hàng Ngày

1. **Node-cron** kích hoạt công việc SendVocab vào thời điểm định sẵn
2. **getNextUnusedWords()** truy vấn 10 từ tiếng Anh chưa dùng từ MongoDB
3. **countUsedWords()** đếm tổng số từ đã học
4. Định dạng message với thông tin từ vựng
5. **sendDiscordMessage()** gửi qua Discord Webhook
6. **updateUsedWords()** cập nhật `lastUsed` timestamp
7. Người dùng nhận được message trên Discord với từ vựng mới

## 🚀 Các Tính Năng Nâng Cao (Có thể triển khai)

- [ ] User authentication & personalization
- [ ] Custom learning paths
- [ ] Spaced repetition algorithm
- [ ] Web dashboard để quản lý từ vựng
- [ ] API endpoints cho mobile app
- [ ] Support đa ngôn ngữ
- [ ] Gamification (points, badges, leaderboard)

## 📝 Ghi Chú

- **Discord Integration**: Hiện tại, Discord message sending được comment lại. Cần enable nếu muốn sử dụng thực tế
- **Database**: Sử dụng MongoDB Atlas (cloud)
- **Scheduling**: Sử dụng node-cron cho lập lịch

## 📧 Contact & Support

Dự án này được phát triển cho mục đích học tập tiếng Anh thông qua vocabulary learning hàng ngày.
