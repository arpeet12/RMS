export const setAgentPermissions = (agent, permissions) => {
  try {
    const keyUser = agent?.user?.username ? `agentPerm:u:${agent.user.username}` : null;
    const keyId = agent?.id ? `agentPerm:id:${agent.id}` : null;
    const value = JSON.stringify(permissions || {});
    if (keyUser) localStorage.setItem(keyUser, value);
    if (keyId) localStorage.setItem(keyId, value);
  } catch {}
};

export const getPermissionsByUsername = (username) => {
  try {
    const raw = localStorage.getItem(`agentPerm:u:${username}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getPermissionsById = (id) => {
  try {
    const raw = localStorage.getItem(`agentPerm:id:${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
