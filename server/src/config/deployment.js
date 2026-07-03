const os = require('os');

const publicUrl = () =>
  process.env.PUBLIC_APP_URL ||
  process.env.APP_PUBLIC_URL ||
  process.env.CUSTOMER_DOMAIN_URL ||
  '';

const lineWebhookUrl = () =>
  process.env.LINE_WEBHOOK_URL ||
  (publicUrl() ? `${publicUrl().replace(/\/$/, '')}/linebot/webhook.php` : '');

const localLanUrls = () => {
  const port = Number(process.env.PORT || 5000);
  const interfaces = os.networkInterfaces();
  const urls = [];

  Object.values(interfaces).forEach((items = []) => {
    items
      .filter((item) => item.family === 'IPv4' && !item.internal)
      .forEach((item) => urls.push(`http://${item.address}:${port}`));
  });

  return urls;
};

const deploymentMode = () =>
  process.env.DEPLOYMENT_MODE ||
  process.env.POSTSALES_DEPLOYMENT_MODE ||
  'local_customer_domain';

const tunnelProvider = () =>
  process.env.TUNNEL_PROVIDER ||
  process.env.POSTSALES_TUNNEL_PROVIDER ||
  'cloudflare';

module.exports = {
  deploymentMode,
  tunnelProvider,
  publicUrl,
  lineWebhookUrl,
  localLanUrls,
};
