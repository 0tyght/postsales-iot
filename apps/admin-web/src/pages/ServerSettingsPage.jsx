import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const readyText = (ok) => ok ? 'พร้อมใช้งาน' : 'ยังไม่พร้อม';
const badgeClass = (ok) => `badge ${ok ? 'badge-active' : 'badge-inactive'}`;
const trimSlash = (value = '') => value.replace(/\/$/, '');

const initialSettings = {
  company_name: '',
  company_domain: '',
  public_app_url: '',
  cloudflare_tunnel_name: '',
  license_key: '',
  license_server_url: '',
  line_customer_channel_secret: '',
  line_customer_channel_access_token: '',
  line_customer_basic_id: '',
  line_customer_webhook_url: '',
  line_team_channel_access_token: '',
  line_team_target_id: '',
};

const secretKeys = new Set([
  'license_key',
  'line_customer_channel_secret',
  'line_customer_channel_access_token',
  'line_team_channel_access_token',
  'line_team_target_id',
]);

export default function ServerSettingsPage() {
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [testingTeam, setTestingTeam] = useState(false);

  const load = async () => {
    try {
      const data = await api('/system/status');
      const map = data.settings || {};
      setStatus(data);
      setSettings((prev) => ({
        ...prev,
        company_name: map.company_name || '',
        company_domain: map.company_domain || '',
        public_app_url: map.public_app_url || data.public_url || '',
        cloudflare_tunnel_name: map.cloudflare_tunnel_name || '',
        license_server_url: map.license_server_url || '',
        line_customer_basic_id: map.line_customer_basic_id || '',
        line_customer_webhook_url: map.line_customer_webhook_url || data.line?.customer_oa?.webhook_url || data.line_webhook_url || '',
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const customerWebhook = useMemo(() => (
    settings.line_customer_webhook_url ||
    status?.line?.customer_oa?.webhook_url ||
    (settings.public_app_url ? `${trimSlash(settings.public_app_url)}/linebot/webhook.php` : '')
  ), [settings.line_customer_webhook_url, settings.public_app_url, status]);

  const setField = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const copy = async (text) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setMessage('คัดลอกแล้ว');
  };

  const buildSavePayload = () => Object.fromEntries(
    Object.entries(settings).filter(([key, value]) => !secretKeys.has(key) || String(value || '').trim())
  );

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = buildSavePayload();
      if (!payload.line_customer_webhook_url && payload.public_app_url) {
        payload.line_customer_webhook_url = `${trimSlash(payload.public_app_url)}/linebot/webhook.php`;
      }
      await api('/system/settings', { method: 'PUT', body: JSON.stringify(payload) });
      setSettings((prev) => ({
        ...prev,
        license_key: '',
        line_customer_channel_secret: '',
        line_customer_channel_access_token: '',
        line_team_channel_access_token: '',
      }));
      setMessage('บันทึกการตั้งค่าระบบแล้ว');
      await load();
    } catch (x) {
      setError(x.message);
    } finally {
      setSaving(false);
    }
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

  const testTeamLine = async () => {
    setTestingTeam(true);
    setMessage('');
    setError('');
    try {
      const result = await api('/line/team/test', {
        method: 'POST',
        body: JSON.stringify({ text: 'ทดสอบแจ้งเตือนทีมช่างจาก Post-Sales IoT\nหากเห็นข้อความนี้ แปลว่า LINE ทีมช่างพร้อมใช้งานแล้ว' }),
      });
      setMessage(result?.skipped ? `ยังส่งไม่ได้: ${result.reason}` : 'ส่งข้อความทดสอบเข้าทีมช่างแล้ว');
    } catch (x) {
      setError(x.message);
    } finally {
      setTestingTeam(false);
    }
  };

  const line = status?.line || {};
  const customerLine = line.customer_oa || {};
  const teamLine = line.technician_team || {};

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>เซิร์ฟเวอร์ โดเมน และ LINE</h1>
          <p>ตั้งค่าระบบสำหรับใช้งานจริง แยก LINE ลูกค้ากับ LINE ทีมช่างให้ชัดเจน</p>
        </div>
        <div className="head-actions">
          <button className="btn" type="button" onClick={load}>ตรวจสถานะใหม่</button>
          <button className="btn" type="button" onClick={refreshLicense}>ตรวจ License</button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="server-settings-grid">
        <div className="panel">
          <h2>สถานะระบบ</h2>
          <div className="metric-row"><span>Edition</span><strong>{status?.edition_name || status?.edition || '-'}</strong></div>
          <div className="metric-row"><span>Database</span><strong>{readyText(status?.database?.ok)}</strong></div>
          <div className="metric-row"><span>LINE ลูกค้า</span><span className={badgeClass(customerLine.configured)}>{readyText(customerLine.configured)}</span></div>
          <div className="metric-row"><span>LINE ทีมช่าง</span><span className={badgeClass(teamLine.configured)}>{readyText(teamLine.configured)}</span></div>
          <div className="metric-row"><span>License</span><strong>{status?.license?.status || 'not_configured'}</strong></div>
          <div className="metric-row"><span>แพ็กเกจ</span><strong>{status?.license?.plan_code || status?.license?.plan || '-'}</strong></div>
        </div>

        <form className="panel server-wide" onSubmit={save}>
          <h2>ตั้งค่าหลัก</h2>
          <div className="form-grid">
            <label className="form-field">ชื่อบริษัท
              <input value={settings.company_name} onChange={(e) => setField('company_name', e.target.value)} placeholder="บริษัทลูกค้า" />
            </label>
            <label className="form-field">โดเมนลูกค้า
              <input value={settings.company_domain} onChange={(e) => setField('company_domain', e.target.value)} placeholder="service.customercompany.com" />
            </label>
            <label className="form-field">Public URL
              <input value={settings.public_app_url} onChange={(e) => setField('public_app_url', e.target.value)} placeholder="https://service.customercompany.com" />
            </label>
            <label className="form-field">Cloudflare Tunnel Name
              <input value={settings.cloudflare_tunnel_name} onChange={(e) => setField('cloudflare_tunnel_name', e.target.value)} placeholder="postsales-iot-customer" />
            </label>
            <label className="form-field">License Server URL
              <input value={settings.license_server_url} onChange={(e) => setField('license_server_url', e.target.value)} placeholder="https://license.yourcompany.com" />
            </label>
            <label className="form-field">License Key
              <input value={settings.license_key} onChange={(e) => setField('license_key', e.target.value)} placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน" />
            </label>
          </div>

          <div className="line-config-sections">
            <div className="line-config-card">
              <div className="section-heading">
                <div>
                  <h3>LINE OA ลูกค้า</h3>
                  <p>ใช้รับ Webhook จากลูกค้า ผูกบัญชี TYTC แจ้งปัญหา รับรอบ service และส่งสถานะงาน</p>
                </div>
                <span className={badgeClass(customerLine.configured)}>{readyText(customerLine.configured)}</span>
              </div>
              <div className="form-grid">
                <label className="form-field">Channel Secret
                  <input value={settings.line_customer_channel_secret} onChange={(e) => setField('line_customer_channel_secret', e.target.value)} placeholder="เว้นว่างไว้ถ้าไม่เปลี่ยน" />
                </label>
                <label className="form-field">Channel Access Token
                  <input value={settings.line_customer_channel_access_token} onChange={(e) => setField('line_customer_channel_access_token', e.target.value)} placeholder="เว้นว่างไว้ถ้าไม่เปลี่ยน" />
                </label>
                <label className="form-field">LINE Basic ID
                  <input value={settings.line_customer_basic_id} onChange={(e) => setField('line_customer_basic_id', e.target.value)} placeholder="@xxxxxxx" />
                </label>
                <label className="form-field">Webhook URL
                  <input value={settings.line_customer_webhook_url} onChange={(e) => setField('line_customer_webhook_url', e.target.value)} placeholder={customerWebhook || 'https://service.customer.com/linebot/webhook.php'} />
                </label>
              </div>
            </div>

            <div className="line-config-card">
              <div className="section-heading">
                <div>
                  <h3>LINE ทีมช่าง</h3>
                  <p>ใช้ส่งแจ้งเตือนเคสใหม่เข้ากลุ่มหรือบัญชีทีมช่าง ไม่จำเป็นต้องมี Webhook ถ้าใช้แค่แจ้งเตือน</p>
                </div>
                <span className={badgeClass(teamLine.configured)}>{readyText(teamLine.configured)}</span>
              </div>
              <div className="form-grid">
                <label className="form-field">Team Channel Access Token
                  <input value={settings.line_team_channel_access_token} onChange={(e) => setField('line_team_channel_access_token', e.target.value)} placeholder="เว้นว่างไว้ถ้าไม่เปลี่ยน" />
                </label>
                <label className="form-field">Team Target ID / Group ID
                  <input value={settings.line_team_target_id} onChange={(e) => setField('line_team_target_id', e.target.value)} placeholder="Cxxxxxxxx หรือ Uxxxxxxxx" />
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn" type="button" onClick={testTeamLine} disabled={testingTeam}>{testingTeam ? 'กำลังส่ง...' : 'ทดสอบส่งเข้าทีมช่าง'}</button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</button>
          </div>
        </form>

        <div className="panel server-wide">
          <h2>URL ที่ต้องนำไปใช้</h2>
          <div className="server-url-list">
            <div>
              <span>หน้าใช้งาน</span>
              <code>{settings.public_app_url || status?.public_url || '-'}</code>
              <button className="btn" type="button" onClick={() => copy(settings.public_app_url || status?.public_url)}>คัดลอก</button>
            </div>
            <div>
              <span>Webhook สำหรับ LINE OA ลูกค้า</span>
              <code>{customerWebhook || '-'}</code>
              <button className="btn" type="button" onClick={() => copy(customerWebhook)}>คัดลอก</button>
            </div>
            <div>
              <span>LAN ภายใน</span>
              <code>{status?.lan_urls?.join(' , ') || '-'}</code>
            </div>
          </div>
        </div>

        <div className="panel server-wide">
          <h2>สรุปการใช้งาน LINE ที่ถูกต้อง</h2>
          <ol className="setup-steps">
            <li>LINE OA ลูกค้าใช้ Webhook เดียวคือ <code>/linebot/webhook.php</code></li>
            <li>ลูกค้าเพิ่มเพื่อนและส่งรหัส <code>TYTC0000</code> เพื่อผูกบัญชีกับข้อมูลลูกค้า</li>
            <li>LINE ทีมช่างใช้สำหรับรับแจ้งเตือนเคสใหม่ จึงใช้ Token และ Target ID แยกจาก LINE ลูกค้า</li>
            <li>ถ้าอนาคตต้องให้ทีมช่างพิมพ์คำสั่งผ่าน LINE ค่อยเพิ่ม Webhook แยกสำหรับทีมช่าง</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
