import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const statusText = (value) => {
  if (value === true) return 'พร้อม';
  if (value === false) return 'ยังไม่พร้อม';
  return value || '-';
};

export default function ServerSettingsPage() {
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState({ company_domain: '', public_app_url: '', cloudflare_tunnel_name: '', license_key: '', license_server_url: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api('/system/status').then(data => {
    setStatus(data);
    setSettings({
      company_domain: data.settings?.company_domain || '',
      public_app_url: data.settings?.public_app_url || data.public_url || '',
      cloudflare_tunnel_name: data.settings?.cloudflare_tunnel_name || '',
      license_server_url: data.settings?.license_server_url || '',
      license_key: '',
    });
  }).catch(e => setError(e.message));

  useEffect(() => { load(); }, []);

  const webhook = useMemo(() => status?.line_webhook_url || (settings.public_app_url ? `${settings.public_app_url.replace(/\/$/, '')}/linebot/webhook.php` : ''), [status, settings.public_app_url]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api('/system/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setMessage('บันทึกการตั้งค่าเซิร์ฟเวอร์แล้ว');
      await load();
    } catch (x) {
      setError(x.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setMessage('คัดลอกแล้ว');
  };

  const refreshLicense = async () => {
    setMessage('');
    setError('');
    try {
      const result = await api('/system/license/refresh', { method: 'POST', body: JSON.stringify({}) });
      setMessage(`ตรวจ License แล้ว: ${result.status || '-'}`);
      await load();
    } catch (x) {
      setError(x.message);
    }
  };

  return <section>
    <div className="page-head"><div><h1>เซิร์ฟเวอร์และโดเมน</h1><p>สำหรับรุ่นขายจริงแบบติดตั้งในเครื่องลูกค้า ใช้โดเมนลูกค้าเอง และออนไลน์ผ่าน Cloudflare Tunnel</p></div></div>
    {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
    <div className="server-settings-grid">
      <div className="panel">
        <h2>สถานะระบบ</h2>
        <div className="metric-row"><span>Edition</span><strong>{status?.edition || 'local_server'}</strong></div>
        <div className="metric-row"><span>โหมดใช้งาน</span><strong>{status?.deployment_mode || '-'}</strong></div>
        <div className="metric-row"><span>Database</span><strong>{statusText(status?.database?.ok)}</strong></div>
        <div className="metric-row"><span>LINE ลูกค้า</span><strong>{statusText(status?.line?.customer_oa_configured)}</strong></div>
        <div className="metric-row"><span>LINE ทีมช่าง</span><strong>{statusText(status?.line?.team_oa_configured)}</strong></div>
        <div className="metric-row"><span>License</span><strong>{status?.license?.status || 'not_configured'}</strong></div>
        <div className="metric-row"><span>แพ็กเกจ</span><strong>{status?.license?.plan_code || status?.license?.plan || '-'}</strong></div>
        <div className="metric-row"><span>หมดอายุ</span><strong>{status?.license?.expires_at || '-'}</strong></div>
        <button className="btn" onClick={load}>ตรวจสถานะใหม่</button>
        <button className="btn" onClick={refreshLicense}>ตรวจ License ตอนนี้</button>
      </div>
      <form className="panel" onSubmit={save}>
        <h2>โดเมนลูกค้า</h2>
        <label className="form-field">โดเมนลูกค้า<input value={settings.company_domain} onChange={e => setSettings({ ...settings, company_domain: e.target.value })} placeholder="service.customercompany.com" /></label>
        <label className="form-field">Public URL<input value={settings.public_app_url} onChange={e => setSettings({ ...settings, public_app_url: e.target.value })} placeholder="https://service.customercompany.com" /></label>
        <label className="form-field">Cloudflare Tunnel Name<input value={settings.cloudflare_tunnel_name} onChange={e => setSettings({ ...settings, cloudflare_tunnel_name: e.target.value })} placeholder="postsales-iot-customer" /></label>
        <label className="form-field">License Server URL<input value={settings.license_server_url} onChange={e => setSettings({ ...settings, license_server_url: e.target.value })} placeholder="https://license.yourcompany.com" /></label>
        <label className="form-field">License Key<input value={settings.license_key} onChange={e => setSettings({ ...settings, license_key: e.target.value })} placeholder={status?.license?.license_key || 'TYT-PSIOT-XXXX-XXXX'} /></label>
        <div className="modal-actions"><button className="btn primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</button></div>
      </form>
      <div className="panel server-wide">
        <div className="section-heading"><div><h2>URL สำหรับใช้งานจริง</h2><p>หลังตั้งค่า Cloudflare Tunnel แล้ว ให้ใช้ URL เหล่านี้กับลูกค้าและ LINE Developers</p></div></div>
        <div className="server-url-list">
          <div><span>หน้าใช้งาน</span><code>{settings.public_app_url || status?.public_url || 'https://service.customercompany.com'}</code><button className="btn" onClick={() => copy(settings.public_app_url || status?.public_url)}>คัดลอก</button></div>
          <div><span>LINE Webhook</span><code>{webhook || 'https://service.customercompany.com/linebot/webhook.php'}</code><button className="btn" onClick={() => copy(webhook)}>คัดลอก</button></div>
          <div><span>LAN ภายในร้าน</span><code>{status?.lan_urls?.join(' , ') || '-'}</code></div>
        </div>
      </div>
      <div className="panel server-wide">
        <h2>ขั้นตอนติดตั้งให้ลูกค้า</h2>
        <ol className="setup-steps">
          <li>ติดตั้ง Post-Sales IoT Local Server บนคอม Windows ของลูกค้า</li>
          <li>ตั้งโดเมนลูกค้า เช่น <code>service.customer.com</code></li>
          <li>เชื่อม Cloudflare Tunnel จากโดเมนเข้ามาที่เครื่องเซิร์ฟเวอร์ลูกค้า</li>
          <li>ตั้งค่า LINE OA webhook เป็น URL ของโดเมนลูกค้า</li>
          <li>ใส่ License Key และเปิดใช้งานระบบ</li>
        </ol>
      </div>
    </div>
  </section>;
}
