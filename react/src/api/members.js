import api from './axios';

export async function heartbeat(clientId) {
  const payload = clientId ? { client_id: clientId } : {};
  const { data } = await api.post('/api/members/heartbeat/', payload);
  return data;
}

export async function getOnlineCount() {
  const { data } = await api.get('/api/members/online_count/');
  return data;
}
