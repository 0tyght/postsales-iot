const crypto = require('crypto');
const os = require('os');
const deployment = require('../config/deployment');
const edition = require('../config/edition');
const settingsRepository = require('../modules/system/system.repository');

const CHECK_INTERVAL_MS = Number(process.env.POSTSALES_LICENSE_CHECK_INTERVAL_MS || 24 * 60 * 60 * 1000);
let memoryCache = null;

const mask = (value = '') => {
  if (!value) return '';
  if (value.length <= 10) return '********';
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

const machineId = () => {
  const raw = `${os.hostname()}|${os.platform()}|${os.arch()}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

const statusFromSettings = async () => {
  const settings = await settingsRepository.findAll().catch(() => []);
  const map = Object.fromEntries(settings.map(item => [item.setting_key, item.setting_value]));
  return {
    allowed: map.license_allowed === '1',
    status: map.license_status || process.env.POSTSALES_LICENSE_STATUS || 'not_configured',
    reason: map.license_reason || '',
    plan_code: map.license_plan || process.env.POSTSALES_LICENSE_PLAN || '',
    expires_at: map.license_expires_at || process.env.POSTSALES_LICENSE_EXPIRES_AT || '',
    checked_at: map.license_checked_at || '',
    license_key: mask(process.env.POSTSALES_LICENSE_KEY || map.license_key || ''),
    raw_license_key: process.env.POSTSALES_LICENSE_KEY || map.license_key || '',
    license_server_url: process.env.POSTSALES_LICENSE_SERVER_URL || map.license_server_url || '',
    source: 'local_cache',
  };
};

exports.required = () => edition.isCustomerLocal();

exports.current = async () => {
  if (!exports.required()) {
    return {
      allowed: true,
      status: process.env.POSTSALES_LICENSE_STATUS || 'internal',
      reason: 'internal_dev',
      source: 'internal',
    };
  }
  if (memoryCache) return memoryCache;
  memoryCache = await statusFromSettings();
  return memoryCache;
};

exports.checkRemote = async ({ force = false } = {}) => {
  if (!exports.required()) return exports.current();

  const cached = memoryCache || await statusFromSettings();
  const last = cached.checked_at ? new Date(cached.checked_at).getTime() : 0;
  if (!force && last && Date.now() - last < CHECK_INTERVAL_MS) return cached;

  const licenseKey = process.env.POSTSALES_LICENSE_KEY || cached.raw_license_key || '';
  const serverUrl = (process.env.POSTSALES_LICENSE_SERVER_URL || cached.license_server_url || '').replace(/\/$/, '');
  if (!licenseKey || !serverUrl) {
    memoryCache = { ...cached, allowed: false, status: 'not_configured', reason: 'missing_license_server_or_key', source: 'local' };
    return memoryCache;
  }

  try {
    const response = await fetch(`${serverUrl}/api/licenses/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        machine_id: machineId(),
        app_version: process.env.POSTSALES_APP_VERSION || '0.1.0',
        public_url: deployment.publicUrl(),
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.message || `License server HTTP ${response.status}`);
    const data = payload.data;
    await settingsRepository.upsertMany([
      { setting_key: 'license_status', setting_group: 'license', setting_value: data.status },
      { setting_key: 'license_reason', setting_group: 'license', setting_value: data.reason || '' },
      { setting_key: 'license_allowed', setting_group: 'license', setting_value: data.allowed ? '1' : '0' },
      { setting_key: 'license_plan', setting_group: 'license', setting_value: data.plan_code || '' },
      { setting_key: 'license_expires_at', setting_group: 'license', setting_value: data.expires_at || '' },
      { setting_key: 'license_checked_at', setting_group: 'license', setting_value: data.checked_at || new Date().toISOString() },
    ]);
    memoryCache = { ...data, source: 'remote', license_key: mask(licenseKey) };
    return memoryCache;
  } catch (error) {
    memoryCache = {
      ...cached,
      allowed: cached.allowed,
      status: cached.allowed ? 'offline_grace' : 'license_check_failed',
      reason: error.message,
      source: 'local_cache',
    };
    return memoryCache;
  }
};

exports.clearCache = () => {
  memoryCache = null;
};
