const db = require('../../config/db');
const deployment = require('../../config/deployment');
const edition = require('../../config/edition');
const repository = require('./system.repository');
const lineService = require('../line/line.service');
const licenseClient = require('../../services/licenseClient.service');

const maskSecret = (value = '') => {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

exports.status = async () => {
  let database = { ok: false };
  try {
    await db.query('SELECT 1');
    database = { ok: true };
  } catch (error) {
    database = { ok: false, message: error.message };
  }

  const settings = await repository.findAll().catch(() => []);
  const settingMap = Object.fromEntries(
    settings.map((item) => [
      item.setting_key,
      item.is_secret ? maskSecret(item.setting_value) : item.setting_value,
    ])
  );

  const license = await licenseClient.current();
  const safeLicense = { ...license };
  delete safeLicense.raw_license_key;
  const lineSummary = await lineService.configSummary();
  return {
    edition: edition.edition(),
    edition_name: edition.commercialName(),
    deployment_mode: deployment.deploymentMode(),
    required_online_mode: 'customer_domain',
    tunnel_provider: deployment.tunnelProvider(),
    public_url: deployment.publicUrl(),
    line_webhook_url: deployment.lineWebhookUrl(),
    lan_urls: deployment.localLanUrls(),
    database,
    line: lineSummary,
    license: safeLicense,
    settings: settingMap,
  };
};

exports.settings = async () => {
  const rows = await repository.findAll();
  return rows.map((item) => ({
    ...item,
    setting_value: item.is_secret ? maskSecret(item.setting_value) : item.setting_value,
  }));
};

exports.updateSettings = async (payload = {}) => {
  const allowed = [
    ['company_name', 'company'],
    ['company_domain', 'deployment'],
    ['public_app_url', 'deployment'],
    ['cloudflare_tunnel_name', 'deployment'],
    ['line_customer_channel_secret', 'line', true],
    ['line_customer_channel_access_token', 'line', true],
    ['line_customer_basic_id', 'line'],
    ['line_customer_webhook_url', 'line'],
    ['line_team_channel_access_token', 'line', true],
    ['line_team_target_id', 'line', true],
    ['license_key', 'license', true],
    ['license_server_url', 'license'],
  ];

  const items = allowed
    .filter(([key]) => Object.prototype.hasOwnProperty.call(payload, key))
    .map(([key, group, secret]) => ({
      setting_key: key,
      setting_group: group,
      is_secret: Boolean(secret),
      setting_value: String(payload[key] ?? ''),
    }));

  const result = await repository.upsertMany(items);
  licenseClient.clearCache();
  lineService.clearConfigCache?.();
  if (payload.refresh_license) await licenseClient.checkRemote({ force: true });
  return result;
};

exports.refreshLicense = async () => licenseClient.checkRemote({ force: true });
