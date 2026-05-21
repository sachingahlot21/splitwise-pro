const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

async function apiFetch(path: string, opts: RequestInit = {}, runtimeToken?: string | null) {
  const token = runtimeToken || getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(json?.error || res.statusText);
    return json;
  } catch (e) {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }
}

export const api = {
  // auth
  register: (payload: any) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: (runtimeToken?: string | null) => apiFetch('/api/auth/me', {}, runtimeToken),

  // groups
  getGroups: (runtimeToken?: string | null) => apiFetch('/api/groups', {}, runtimeToken),
  createGroup: (payload: any, runtimeToken?: string | null) => apiFetch('/api/groups', { method: 'POST', body: JSON.stringify(payload) }, runtimeToken),
  getGroup: (groupId: string, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}`, {}, runtimeToken),
  updateGroup: (groupId: string, payload: any, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}`, { method: 'PATCH', body: JSON.stringify(payload) }, runtimeToken),
  deleteGroup: (groupId: string, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}`, { method: 'DELETE' }, runtimeToken),

  // members
  getMembers: (groupId: string, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}/members`, {}, runtimeToken),
  addMember: (groupId: string, payload: any, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify(payload) }, runtimeToken),
  removeMember: (groupId: string, memberId: string, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}/members/${memberId}`, { method: 'DELETE' }, runtimeToken),

  // invoices
  getInvoices: (query?: { groupId?: string }, runtimeToken?: string | null) => {
    if (query?.groupId) return apiFetch(`/api/invoices?groupId=${query.groupId}`, {}, runtimeToken);
    return apiFetch('/api/invoices', {}, runtimeToken);
  },
  createInvoice: (payload: any, runtimeToken?: string | null) => apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(payload) }, runtimeToken),
  getInvoice: (invoiceId: string, runtimeToken?: string | null) => apiFetch(`/api/invoices/${invoiceId}`, {}, runtimeToken),
  updateInvoice: (invoiceId: string, payload: any, runtimeToken?: string | null) => apiFetch(`/api/invoices/${invoiceId}`, { method: 'PATCH', body: JSON.stringify(payload) }, runtimeToken),
  deleteInvoice: (invoiceId: string, runtimeToken?: string | null) => apiFetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' }, runtimeToken),

  // balances
  getBalances: (groupId: string, runtimeToken?: string | null) => apiFetch(`/api/groups/${groupId}/balances`, {}, runtimeToken),
};
