import api from './axios';

export async function getMessages(afterId) {
  const params = {};
  if (afterId) params.after_id = afterId;
  const { data } = await api.get('/api/messages/', { params });
  return data;
}

export async function sendMessage(clientId, content) {
  const { data } = await api.post('/api/messages/', { client_id: clientId, content });
  return data;
}
