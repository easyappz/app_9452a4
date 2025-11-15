import React, { useEffect, useRef, useState } from 'react';
import { heartbeat, getOnlineCount } from '../../api/members';
import { getMessages, sendMessage } from '../../api/messages';
import './home.css';

function Home() {
  const [clientId, setClientId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const lastIdRef = useRef(null);
  const listRef = useRef(null);

  const ensureClientId = () => {
    let id = localStorage.getItem('chat_client_id');
    if (!id) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID().replaceAll('-', '');
      } else {
        id = String(Date.now()) + String(Math.random()).slice(2);
      }
      localStorage.setItem('chat_client_id', id);
    }
    return id;
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const loadInitial = async () => {
    try {
      const id = ensureClientId();
      const hb = await heartbeat(id);
      setClientId(hb.client_id);
      setDisplayName(hb.display_name);
      setOnlineCount(hb.online_count || 0);
      const res = await getMessages();
      const msgs = res.messages || [];
      setMessages(msgs);
      lastIdRef.current = msgs.length ? msgs[msgs.length - 1].id : null;
      setTimeout(scrollToBottom, 50);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Ошибка загрузки данных');
    }
  };

  const pollMessages = async () => {
    try {
      const res = await getMessages(lastIdRef.current);
      const newMsgs = res.messages || [];
      if (newMsgs.length) {
        setMessages(prev => {
          const merged = [...prev, ...newMsgs];
          lastIdRef.current = merged[merged.length - 1].id;
          return merged;
        });
        setTimeout(scrollToBottom, 20);
      }
    } catch (_) {
      // silent
    }
  };

  const doHeartbeat = async () => {
    try {
      const hb = await heartbeat(clientId || ensureClientId());
      if (!clientId) setClientId(hb.client_id);
      setDisplayName(hb.display_name);
      if (typeof hb.online_count === 'number') setOnlineCount(hb.online_count);
    } catch (_) {}
  };

  const pollOnline = async () => {
    try {
      const res = await getOnlineCount();
      setOnlineCount(res.online_count || 0);
    } catch (_) {}
  };

  const onSend = async () => {
    setError('');
    const text = input.trim();
    if (!text) return;
    try {
      const id = clientId || ensureClientId();
      const msg = await sendMessage(id, text);
      setMessages(prev => [...prev, msg]);
      lastIdRef.current = msg.id;
      setInput('');
      setTimeout(scrollToBottom, 20);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Не удалось отправить сообщение');
    }
  };

  useEffect(() => {
    loadInitial();
    const msgTimer = setInterval(pollMessages, 2000);
    const hbTimer = setInterval(doHeartbeat, 20000);
    const onlineTimer = setInterval(pollOnline, 10000);
    return () => {
      clearInterval(msgTimer);
      clearInterval(hbTimer);
      clearInterval(onlineTimer);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-wrap" data-easytag="id1-src/components/Home/index.jsx">
      <header className="chat-header">
        <div className="title">Групповой чат</div>
        <div className="meta">
          <span className="badge">Онлайн: {onlineCount}</span>
          <span className="me">Вы: {displayName || '...'}</span>
        </div>
      </header>

      <main className="chat-main" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className="msg">
            <div className="msg-top">
              <span className="author">{m.author_name}</span>
              <span className="time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="content">{m.content}</div>
          </div>
        ))}
      </main>

      <footer className="chat-input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          maxLength={2000}
        />
        <button className="send" onClick={onSend}>Отправить</button>
      </footer>

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

export default Home;
