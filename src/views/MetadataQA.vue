<template>
  <div class="metadata-qa-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="bot-icon-container">
          <img src="../modules/msdat-dashboard/components/assets/ai-launcher-green.svg" alt="AI" style="width: 24px; height: 24px;" />
        </div>
        <div class="sidebar-title">
          <div class="title-main">MSDAT</div>
          <div class="title-sub">Metadata ChatBot</div>
        </div>
      </div>

      <button class="new-analysis-btn" @click="clearChat">
        <b-icon icon="plus" font-scale="1.2"></b-icon>
        <span>New Data Analysis</span>
      </button>

      <div class="sidebar-section-title">
        <b-icon icon="clock-history" class="mr-1"></b-icon> RECENT QUERIES
      </div>

      <div class="history-list">
        <div
          v-for="history in chatHistory"
          :key="history.id"
          :class="['history-item', { active: history.id === sessionId }]"
          @click="loadSession(history.id)"
        >
          <div class="history-icon">
            <b-icon icon="chat-left-text"></b-icon>
          </div>
          <div class="history-content">
            <span class="history-title">{{ history.title }}</span>
            <span class="history-date" v-if="history.timestamp">{{ formatDate(history.timestamp) }}</span>
          </div>
          <b-icon
            icon="trash"
            class="delete-icon"
            @click.stop="deleteSession(history.id)"
          ></b-icon>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">
            <b-icon icon="person-circle" font-scale="1.5"></b-icon>
          </div>
          <div class="user-info">
            <span class="user-name">{{ displayUserName }}</span>
            <span class="user-role" v-if="isAuthenticated">Authorized User</span>
            <span class="user-role" v-else>Guest</span>
          </div>
          <b-icon icon="gear" class="settings-icon"></b-icon>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="main-chat-area">
      <!-- Top Header -->
      <div class="chat-top-header">
        <div class="header-badges">
          <span class="badge-item"><b-icon icon="geo-alt"></b-icon> National View</span>
          <span class="badge-item linked"><b-icon icon="link"></b-icon> DHIS2 Linked</span>
          <span class="badge-item live"><b-icon icon="lightning-fill"></b-icon> Live Reporting</span>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="exportReport"><b-icon icon="download"></b-icon> Export Report</button>
          <button class="icon-btn"><b-icon icon="question-circle"></b-icon></button>
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <!-- Empty State -->
        <div v-if="messages.length === 0" class="empty-state">
          <div class="robot-icon-wrapper">
            <img src="../modules/msdat-dashboard/components/assets/ai-launcher-green.svg" alt="AI Logo" style="width: 40px; height: 40px;" />
          </div>
          <h2>How can I help you with MSDAT today?</h2>
          <p class="empty-subtitle">
            👋 Hi there! I'm <span class='soma-name'><strong>Soma</strong></span> — <strong>MSDAT Data Assistant</strong>.<br><br>
            Ask me about <strong>metadata, indicators, data sources</strong>, reporting periods, or even how to interpret key health metrics.
          </p>
        </div>

        <!-- Chat Rows -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message-row', message.type]"
        >
          <div class="message-content-wrapper">
            <div class="message-avatar" v-if="message.type === 'bot'">
              <div class="bot-avatar">
                <img src="../modules/msdat-dashboard/components/assets/ai-launcher-green.svg" alt="AI" />
              </div>
            </div>
            <div class="message-text">
              <div class="markdown-body" v-if="message.type === 'bot'" v-html="renderMarkdown(message.text)"></div>
              <div class="text-body" v-else>{{ message.text }}</div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="message-row bot">
          <div class="message-content-wrapper">
            <div class="message-avatar">
              <div class="bot-avatar">
                <img src="../modules/msdat-dashboard/components/assets/ai-launcher-green.svg" alt="AI" />
              </div>
            </div>
            <div class="message-text">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area-wrapper">
        <div v-if="messages.length === 0" class="suggestions">
          <span class="suggestions-label">SUGGESTIONS:</span>
          <button
            v-for="(suggestion, sIndex) in defaultSuggestions"
            :key="sIndex"
            class="suggestion-chip"
            @click="sendSuggestedMessage(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>

        <div class="input-container">
          <textarea
            v-model="userInput"
            @input="autoResizeInput"
            @keyup.enter.exact="sendMessage"
            placeholder="Inquire about health indicators, reporting rates, or validation issues..."
            :disabled="isLoading"
            ref="chatInput"
            rows="1"
          ></textarea>

          <button
            class="send-btn"
            @click="sendMessage"
            :disabled="isLoading || !userInput.trim()"
          >
            <b-icon icon="cursor-fill" font-scale="1" class="mr-2" style="transform: rotate(45deg);"></b-icon> Analyze
          </button>
        </div>

        <div class="footer-status">
          <span class="status-item"><b-icon icon="shield-check" class="text-secondary"></b-icon> Data verified by FMOH DHIS2</span>
          <span class="status-item"><b-icon icon="info-circle" class="text-secondary"></b-icon> Information subject to validation cycles</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { mapGetters } from 'vuex';

export default {
  name: 'MetadataQA',
  data() {
    return {
      userInput: '',
      messages: [],
      isLoading: false,
      sessionId: '',
      chatHistory: [],
      defaultSuggestions: [
        'What health indicators are available?',
        'Explain the data sources used in MSDAT',
        'How do I interpret maternal health metrics?',
      ],
    };
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated', 'getUser']),
    displayUserName() {
      if (this.isAuthenticated && this.getUser) {
        return this.getUser.username || this.getUser.email || 'User';
      }
      return 'User';
    },
  },
  methods: {
    generateSessionId() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16);
        let v;
        if (c === 'x') {
          v = r;
        } else {
          v = (r % 4) + 8;
        }
        return v.toString(16);
      });
    },
    persistSession() {
      const currentSession = {
        id: this.sessionId,
        title: this.getSessionTitle(),
        messages: this.messages,
        timestamp: Date.now(),
      };

      let allSessions = this.getAllSessions();

      const existingIndex = allSessions.findIndex((s) => s.id === this.sessionId);
      if (existingIndex !== -1) {
        allSessions[existingIndex] = currentSession;
      } else {
        allSessions.unshift(currentSession);
      }

      if (allSessions.length > 50) {
        allSessions = allSessions.slice(0, 50);
      }

      localStorage.setItem('metadata_qa_sessions', JSON.stringify(allSessions));
      this.loadChatHistory();
    },
    getAllSessions() {
      const stored = localStorage.getItem('metadata_qa_sessions');
      return stored ? JSON.parse(stored) : [];
    },
    getSessionTitle() {
      const firstUserMessage = this.messages.find((m) => m.type === 'user');
      if (firstUserMessage) {
        const text = firstUserMessage.text.trim();
        return text.length > 40 ? `${text.substring(0, 40)}...` : text;
      }
      return `Chat ${new Date().toLocaleDateString()}`;
    },
    loadChatHistory() {
      this.chatHistory = this.getAllSessions();
    },
    loadSession(sessionId) {
      if (sessionId === this.sessionId) return;
      const sessions = this.getAllSessions();
      const session = sessions.find((s) => s.id === sessionId);

      if (session) {
        this.sessionId = session.id;
        this.messages = session.messages || [];
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    async deleteSession(sessionId) {
      const result = await this.$swal({
        title: 'Delete conversation?',
        text: 'Are you sure you want to delete this conversation?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      });

      if (result && result.isConfirmed) {
        let sessions = this.getAllSessions();
        sessions = sessions.filter((s) => s.id !== sessionId);
        localStorage.setItem('metadata_qa_sessions', JSON.stringify(sessions));
        this.loadChatHistory();

        if (sessionId === this.sessionId) {
          this.clearChat();
        }
      }
    },
    clearChat() {
      this.sessionId = this.generateSessionId();
      this.messages = [];
      this.persistSession();
      this.$nextTick(() => this.scrollToBottom());
    },
    restoreSession() {
      const storedId = sessionStorage.getItem('metadata_qa_session_id');
      const storedMessages = sessionStorage.getItem('metadata_qa_messages');

      if (storedId) {
        this.sessionId = storedId;
      } else {
        this.sessionId = this.generateSessionId();
        sessionStorage.setItem('metadata_qa_session_id', this.sessionId);
      }

      if (storedMessages) {
        try {
          this.messages = JSON.parse(storedMessages);
        } catch (e) {
          this.messages = [];
        }
      } else {
        this.messages = [];
      }

      this.loadChatHistory();

      const lastSessionId = localStorage.getItem('metadata_qa_last_session');

      if (lastSessionId && this.chatHistory.length > 0) {
        const lastSession = this.chatHistory.find((s) => s.id === lastSessionId);

        if (lastSession) {
          this.sessionId = lastSession.id;
          this.messages = lastSession.messages || [];
          return;
        }
      }

      if (this.chatHistory.length > 0) {
        const mostRecent = this.chatHistory[0];
        this.sessionId = mostRecent.id;
        this.messages = mostRecent.messages || [];
      } else if (!storedId) {
        this.persistSession();
      }

      localStorage.setItem('metadata_qa_last_session', this.sessionId);
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      this.messages.push({
        type: 'user',
        text: this.userInput,
      });
      this.persistSession();

      const userMessage = this.userInput;
      this.userInput = '';
      this.isLoading = true;

      this.$nextTick(() => {
        if (this.$refs.chatInput) this.$refs.chatInput.style.height = 'auto';
      });

      try {
        const response = await fetch('https://n8n.e4eweb.space/webhook/7038e292-511b-49ca-94ba-92738219de03', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            chatInput: userMessage,
          }),
        });

        const raw = await response.text();
        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch (e) {
          data = null;
        }

        if (!response.ok) {
          console.error('Chatbot fetch error', response.status, response.statusText, raw);
          const serverMessage = (data && (data.error || data.message)) ? (data.error || data.message) : raw || `${response.status} ${response.statusText}`;
          this.messages.push({
            type: 'bot',
            text: `Error from server: ${serverMessage}`,
          });
        } else {
          const botText = (data && (data.text || data.message || data.response))
            ? (data.text || data.message || data.response)
            : (raw || 'Sorry, I did not understand the response.');

          this.messages.push({
            type: 'bot',
            text: botText,
          });
        }
      } catch (error) {
        console.error('Chatbot network/error', error);
        const errMsg = error && error.message ? error.message : '';
        this.messages.push({
          type: 'bot',
          text: `Sorry, I encountered an error. ${errMsg}`,
        });
      } finally {
        this.isLoading = false;
        this.persistSession();
        localStorage.setItem('metadata_qa_last_session', this.sessionId);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    sendSuggestedMessage(suggestion) {
      this.userInput = suggestion;
      this.sendMessage();
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    renderMarkdown(text) {
      return marked.parse(text || '');
    },
    autoResizeInput() {
      this.$nextTick(() => {
        const input = this.$refs.chatInput;
        if (input) {
          input.style.height = 'auto';
          input.style.height = `${input.scrollHeight}px`;
        }
      });
    },
    async exportReport() {
      if (this.messages.length === 0) {
        await this.$swal({
          title: 'Nothing to export',
          text: 'No analysis to export.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
        return;
      }
      const content = this.messages.map((m) => `${m.type.toUpperCase()}:\n${m.text}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MSDAT_Analysis_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
  },
  mounted() {
    this.restoreSession();
    this.$nextTick(() => this.scrollToBottom());
  },
};
</script>

<style lang="scss" scoped>
.metadata-qa-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #007d53;
  color: white;
  gap: 0.75rem;

  .bot-icon-container {
    width: 32px;
    height: 32px;
    background-color: rgba(255,255,255,0.2);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-title {
    display: flex;
    flex-direction: column;

    .title-main {
      font-weight: 700;
      font-size: 1rem;
      line-height: 1.2;
    }
    .title-sub {
      font-size: 0.75rem;
      opacity: 0.9;
    }
  }
}

.new-analysis-btn {
  margin: 1.5rem;
  background-color: #008751;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.6rem 0.75rem;
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #006b40;
  }
}

.sidebar-section-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  padding: 0 1.5rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0 0.75rem;
  gap: 0.25rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #475569;
  position: relative;
  transition: all 0.2s;

  .history-icon {
    opacity: 0.6;
  }

  .history-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .history-title {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .history-date {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 0.1rem;
    }
  }

  .delete-icon {
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
    flex-shrink: 0;
    color: #94a3b8;

    &:hover {
      color: #ef4444;
    }
  }

  &:hover {
    background-color: #f8fafc;

    .delete-icon {
      opacity: 1;
    }
  }

  &.active {
    background-color: #007d53;
    color: white;

    .history-icon {
      opacity: 1;
    }
    .history-content {
      .history-date { color: rgba(255,255,255,0.7); }
    }
    .delete-icon {
      color: rgba(255,255,255,0.7);
      opacity: 1;
      &:hover { color: #fca5a5; }
    }
  }
}

.health-domains-list {
  padding: 0 0.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .domain-item {
    font-size: 0.85rem;
    color: #475569;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f1f5f9;
    }

    .chevron {
      font-size: 0.75rem;
      color: #94a3b8;
    }
  }
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .user-role {
      font-size: 0.7rem;
      color: #64748b;
    }
  }

  .settings-icon {
    color: #94a3b8;
    &:hover { color: #475569; }
  }
}

/* Main Chat Area */
.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #ffffff;
}

.chat-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  .header-badges {
    display: flex;
    gap: 0.75rem;

    .badge-item {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      background-color: #f8fafc;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid #e2e8f0;

      &.linked {
        color: #15803d;
        background-color: #f0fdf4;
        border-color: #bbf7d0;
      }
      &.live {
        color: #0369a1;
        background-color: #f0f9ff;
        border-color: #bae6fd;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .action-btn {
      font-size: 0.8rem;
      font-weight: 500;
      color: #475569;
      background-color: transparent;
      border: 1px solid #cbd5e1;
      padding: 0.4rem 0.75rem;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #f8fafc;
        color: #0f172a;
      }
    }

    .icon-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.4rem;

      &:hover { color: #0f172a; }
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 180px; /* Space for input area */
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;

  .robot-icon-wrapper {
    width: 56px;
    height: 56px;
    background-color: #f0fdf4;
    color: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1rem;
  }

  .empty-subtitle {
    font-size: 0.95rem;
    color: #64748b;
    max-width: 550px;
    line-height: 1.5;
  }
}

.message-row {
  padding: 1.5rem 2rem;
  display: flex;
  width: 100%;
}

.message-content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  width: 100%;
}

/* User Messages On the Right */
.message-row.user {
  .message-content-wrapper {
    justify-content: flex-end;
  }

  .message-text {
    background-color: #008751;
    color: white;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    border-bottom-right-radius: 0.25rem;
    max-width: 80%;
    font-size: 0.95rem;
    line-height: 1.5;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
}

/* Bot Messages On the Left */
.message-row.bot {
  background-color: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  border-top: 1px solid #f1f5f9;

  .message-content-wrapper {
    justify-content: flex-start;
  }

  .message-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    background-color: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    .bot-avatar {
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .message-text {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #1e293b;
    padding-top: 0.25rem;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 5px 0;

  span {
    width: 6px;
    height: 6px;
    background-color: #94a3b8;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Input Area */
.input-area-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 15%);
  padding: 2rem 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.suggestions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 800px;

  .suggestions-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    margin-right: 0.5rem;
  }

  .suggestion-chip {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    color: #475569;
    padding: 0.4rem 0.8rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }
  }
}

.input-container {
  width: 100%;
  max-width: 800px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);

  &:focus-within {
    border-color: #007d53;
    box-shadow: 0 0 0 2px rgba(0, 125, 83, 0.1);
  }

  .icon-btn {
    background: none;
    border: none;
    color: #94a3b8;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover { color: #475569; }
  }

  textarea {
    flex: 1;
    border: none;
    resize: none;
    padding: 0.5rem 0.75rem;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
    outline: none;
    background: transparent;
    color: #1e293b;
    max-height: 120px;

    &::placeholder {
      color: #94a3b8;
    }
  }

  .send-btn {
    background-color: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 0.5rem;

    &:disabled {
      background-color: #f1f5f9;
      color: #94a3b8;
      border-color: #e2e8f0;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: #dcfce7;
      border-color: #86efac;
    }

    /* Simple arrow tweak for matching Figma's send representation if needed */
    .icon {
      margin-right: 0.25rem;
    }
  }
}

.footer-status {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 800px;

  .status-item {
    font-size: 0.65rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}

/* Markdown Styles inside bot messages */
::v-deep .markdown-body {
  font-size: 0.95rem !important;
  line-height: 1.6;
  color: #1e293b;

  p {
    margin-bottom: 0.75rem;
    &:last-child { margin-bottom: 0; }
  }

  strong {
    font-weight: 600;
    color: #0f172a;
  }

  ul, ol {
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.25rem;
  }

  code {
    background-color: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.85em;
    color: #db2777;
  }

  pre {
    background-color: #0f172a;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;

    code {
      background-color: transparent;
      padding: 0;
      color: #e2e8f0;
    }
  }

  .soma-name {
     color: #008751;
     font-weight: 700;
  }
}
</style>
