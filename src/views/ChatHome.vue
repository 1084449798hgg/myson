<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="header-title">微信</div>
        <div class="header-actions">
          <span class="icon-btn">🔍</span>
          <span class="icon-btn">➕</span>
        </div>
      </div>
      <div class="chat-list">
        <div
          v-for="(chat, index) in chatList"
          :key="index"
          :class="['chat-item', { active: activeChatIndex === index }]"
          @click="selectChat(index)"
        >
          <div class="avatar">
            <img :src="chat.avatar" :alt="chat.name" />
            <span v-if="chat.unread > 0" class="badge">{{ chat.unread > 99 ? '99+' : chat.unread }}</span>
          </div>
          <div class="chat-info">
            <div class="chat-top">
              <span class="chat-name">{{ chat.name }}</span>
              <span class="chat-time">{{ chat.time }}</span>
            </div>
            <div class="chat-last-msg">{{ chat.lastMsg }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-panel">
      <div v-if="activeChat" class="chat-window">
        <div class="chat-header">
          <span class="chat-title">{{ activeChat.name }}</span>
          <div class="chat-header-actions">
            <span class="icon-btn">📞</span>
            <span class="icon-btn">⋯</span>
          </div>
        </div>

        <div ref="messageContainer" class="message-list">
          <div
            v-for="(msg, index) in activeChat.messages"
            :key="index"
            :class="['message-item', msg.isSelf ? 'self' : 'other']"
          >
            <div v-if="!msg.isSelf" class="msg-avatar">
              <img :src="activeChat.avatar" :alt="activeChat.name" />
            </div>
            <div class="msg-content">
              <div class="msg-bubble">{{ msg.content }}</div>
            </div>
            <div v-if="msg.isSelf" class="msg-avatar">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=me" alt="我" />
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-toolbar">
            <span class="icon-btn">🎤</span>
            <span class="icon-btn" @click="toggleEmoji">😊</span>
            <span class="icon-btn">📁</span>
            <span class="icon-btn">💬</span>
          </div>
          <div v-if="showEmoji" class="emoji-panel">
            <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">
              {{ emoji }}
            </span>
          </div>
          <div class="input-wrapper">
            <textarea
              v-model="inputMessage"
              class="message-input"
              placeholder="输入消息..."
              @keydown.enter.exact="sendMessage"
              @keydown.enter.shift="true"
              rows="2"
            ></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">
              发送
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-panel">
        <div class="empty-icon">💬</div>
        <p class="empty-text">选择一个会话开始聊天</p>
      </div>
    </div>

    <div class="bottom-nav">
      <div :class="['nav-item', { active: activeNav === 'chat' }]" @click="activeNav = 'chat'">
        <span class="nav-icon">💬</span>
        <span class="nav-text">微信</span>
      </div>
      <div :class="['nav-item', { active: activeNav === 'contacts' }]" @click="activeNav = 'contacts'">
        <span class="nav-icon">👥</span>
        <span class="nav-text">通讯录</span>
      </div>
      <div :class="['nav-item', { active: activeNav === 'discover' }]" @click="activeNav = 'discover'">
        <span class="nav-icon">🌐</span>
        <span class="nav-text">发现</span>
      </div>
      <div :class="['nav-item', { active: activeNav === 'sheet' }]" @click="goToSheet">
        <span class="nav-icon">📊</span>
        <span class="nav-text">表格</span>
      </div>
      <div :class="['nav-item', { active: activeNav === 'earth' }]" @click="goToEarth">
        <span class="nav-icon">🌍</span>
        <span class="nav-text">地球</span>
      </div>
      <div :class="['nav-item', { active: activeNav === 'me' }]" @click="activeNav = 'me'">
        <span class="nav-icon">👤</span>
        <span class="nav-text">我</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatHome',
  data() {
    return {
      activeChatIndex: 0,
      inputMessage: '',
      showEmoji: false,
      activeNav: 'chat',
      emojiList: [
        '😀', '😂', '🤣', '😊', '😍', '🤔', '😎', '🥳',
        '😢', '😡', '👍', '👎', '❤️', '🎉', '🔥', '💯',
        '🌹', '☕', '🍺', '🎁', '⭐', '💪', '🙏', '👋'
      ],
      chatList: [
        {
          name: '文件传输助手',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=file',
          lastMsg: '欢迎使用微信聊天！',
          time: '刚刚',
          unread: 0,
          messages: [
            { isSelf: false, content: '你好！欢迎使用微信聊天界面~', time: '10:00' },
            { isSelf: false, content: '这是一个模拟微信的聊天界面示例。', time: '10:01' },
            { isSelf: true, content: '收到！这个界面做得不错👍', time: '10:02' },
            { isSelf: false, content: '你可以在下方输入框发送消息，试试吧！', time: '10:03' }
          ]
        },
        {
          name: '张三',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
          lastMsg: '明天几点开会？',
          time: '09:30',
          unread: 2,
          messages: [
            { isSelf: false, content: '你好，在吗？', time: '09:25' },
            { isSelf: false, content: '明天几点开会？', time: '09:30' }
          ]
        },
        {
          name: '产品交流群',
          avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=group',
          lastMsg: '李四: 新版本已经发布了',
          time: '昨天',
          unread: 5,
          messages: [
            { isSelf: false, content: '大家好，新版本进展如何？', time: '昨天 14:00' },
            { isSelf: true, content: '我这边功能都开发完了', time: '昨天 14:30' },
            { isSelf: false, content: '李四: 新版本已经发布了', time: '昨天 16:00' }
          ]
        },
        {
          name: '李四',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
          lastMsg: '好的，收到！',
          time: '昨天',
          unread: 0,
          messages: [
            { isSelf: true, content: '文档我发你邮箱了', time: '昨天 11:00' },
            { isSelf: false, content: '好的，收到！', time: '昨天 11:05' }
          ]
        },
        {
          name: '王五',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
          lastMsg: '周末一起吃饭？',
          time: '星期三',
          unread: 0,
          messages: [
            { isSelf: false, content: '周末一起吃饭？', time: '星期三 18:00' }
          ]
        },
        {
          name: '技术交流群',
          avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech',
          lastMsg: '赵六: Vue3确实比Vue2好用多了',
          time: '星期二',
          unread: 0,
          messages: [
            { isSelf: false, content: '大家觉得Vue3怎么样？', time: '星期二 10:00' },
            { isSelf: false, content: '赵六: Vue3确实比Vue2好用多了', time: '星期二 10:30' }
          ]
        }
      ]
    }
  },
  computed: {
    activeChat() {
      if (this.activeChatIndex >= 0 && this.activeChatIndex < this.chatList.length) {
        return this.chatList[this.activeChatIndex]
      }
      return null
    }
  },
  methods: {
    selectChat(index) {
      this.activeChatIndex = index
      this.chatList[index].unread = 0
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    sendMessage() {
      if (!this.inputMessage.trim()) return

      this.activeChat.messages.push({
        isSelf: true,
        content: this.inputMessage.trim(),
        time: this.getCurrentTime()
      })

      this.activeChat.lastMsg = this.inputMessage.trim()
      this.activeChat.time = '刚刚'

      const msg = this.inputMessage.trim()
      this.inputMessage = ''

      this.$nextTick(() => {
        this.scrollToBottom()
      })

      setTimeout(() => {
        this.receiveAutoReply(msg)
      }, 1000)
    },
    receiveAutoReply(userMsg) {
      const replies = [
        '好的，收到！',
        '我知道了~',
        '嗯嗯，继续说',
        '这个想法不错！',
        '👍👍👍',
        '哈哈哈',
        '让我想想...',
        '没问题！',
        '好的好的',
        '😊'
      ]
      const randomReply = replies[Math.floor(Math.random() * replies.length)]

      this.activeChat.messages.push({
        isSelf: false,
        content: randomReply,
        time: this.getCurrentTime()
      })

      this.activeChat.lastMsg = randomReply
      this.activeChat.time = '刚刚'

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    getCurrentTime() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    toggleEmoji() {
      this.showEmoji = !this.showEmoji
    },
    insertEmoji(emoji) {
      this.inputMessage += emoji
    },
    goToSheet() {
      this.$router.push('/sheet')
    },
    goToEarth() {
      this.$router.push('/earth')
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.sidebar {
  width: 280px;
  background-color: #2e2e2e;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  color: #fff;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #2e2e2e;
  border-bottom: 1px solid #3a3a3a;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.icon-btn {
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #3a3a3a;
}

.chat-item:hover {
  background-color: #3a3a3a;
}

.chat-item.active {
  background-color: #07c160;
}

.avatar {
  position: relative;
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  margin-right: 12px;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  background-color: #fa5151;
  color: #fff;
  font-size: 11px;
  border-radius: 9px;
  padding: 0 5px;
  box-sizing: border-box;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-left: 10px;
}

.chat-item.active .chat-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-last-msg {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item.active .chat-last-msg {
  color: rgba(255, 255, 255, 0.8);
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 56px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.chat-header-actions {
  display: flex;
  gap: 20px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message-item.self {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.msg-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.msg-content {
  max-width: 60%;
  margin: 0 12px;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message-item.other .msg-bubble {
  background-color: #fff;
  color: #333;
  position: relative;
}

.message-item.other .msg-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #fff;
}

.message-item.self .msg-bubble {
  background-color: #95ec69;
  color: #333;
  position: relative;
}

.message-item.self .msg-bubble::before {
  content: '';
  position: absolute;
  right: -6px;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #95ec69;
}

.input-area {
  background-color: #f5f5f5;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.input-toolbar {
  display: flex;
  gap: 20px;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.emoji-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
  max-height: 120px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #f0f0f0;
}

.input-wrapper {
  display: flex;
  padding: 10px 20px 15px;
  gap: 15px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: none;
  outline: none;
  background-color: #fff;
  font-family: inherit;
  line-height: 1.5;
  max-height: 100px;
}

.message-input:focus {
  border-color: #07c160;
}

.send-btn {
  padding: 8px 24px;
  background-color: #07c160;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
  height: 36px;
}

.send-btn:hover:not(:disabled) {
  background-color: #06ad56;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.empty-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
}

.bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .sidebar {
    display: none;
  }

  .bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 56px;
    background-color: #f7f7f7;
    border-top: 1px solid #e5e5e5;
    flex-shrink: 0;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #999;
    font-size: 11px;
  }

  .nav-item.active {
    color: #07c160;
  }

  .nav-icon {
    font-size: 22px;
    margin-bottom: 2px;
  }

  .nav-text {
    font-size: 11px;
  }
}
</style>
