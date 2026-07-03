const crypto = require('crypto');
const repository = require('./license.repository');

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (dateValue, days) => {
  const date = new Date(dateValue || today());
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
};

const signPayload = (payload) => {
  const secret = process.env.LICENSE_SIGNING_SECRET || 'dev-license-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

const computeStatus = (license) => {
  if (!license) return { status: 'invalid', allowed: false, reason: 'license_not_found' };
  if (license.customer_status !== 'active') return { status: 'suspended', allowed: false, reason: 'customer_not_active' };
  if (['suspended', 'cancelled'].includes(license.status)) return { status: license.status, allowed: false, reason: 'license_not_active' };

  if (license.expires_at && license.expires_at < today()) {
    const graceUntil = addDays(license.expires_at, license.grace_days);
    if (graceUntil >= today()) return { status: 'offline_grace', allowed: true, reason: 'in_grace_period', grace_until: graceUntil };
    return { status: 'expired', allowed: false, reason: 'expired', grace_until: graceUntil };
  }

  return { status: license.status === 'trial' ? 'trial' : 'active', allowed: true, reason: 'ok' };
};

exports.list = () => repository.list();

exports.create = async (payload) => {
  if (!payload.company_name) {
    const error = new Error('company_name is required');
    error.status = 400;
    throw error;
  }
  const customerId = await repository.createCustomer(payload);
  const license = await repository.createLicense(customerId, payload);
  return repository.get(license.license_id);
};

exports.update = async (id, payload) => repository.update(id, payload);

exports.check = async (payload, ip) => {
  if (!payload.license_key) {
    const error = new Error('license_key is required');
    error.status = 400;
    throw error;
  }
  const license = await repository.findByKey(payload.license_key);
  const state = computeStatus(license);
  if (license) await repository.recordCheckin(license.license_id, payload, state.status, ip);

  const response = {
    allowed: state.allowed,
    status: state.status,
    reason: state.reason,
    company_name: license?.company_name || '',
    domain_name: license?.domain_name || '',
    plan_code: license?.plan_code || '',
    expires_at: license?.expires_at || '',
    grace_until: state.grace_until || '',
    limits: license ? {
      max_users: license.max_users,
      max_technicians: license.max_technicians,
      max_customers: license.max_customers,
      max_storage_gb: license.max_storage_gb,
    } : null,
    checked_at: new Date().toISOString(),
  };
  return { ...response, signature: signPayload(response) };
};
