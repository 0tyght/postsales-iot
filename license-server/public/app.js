const tokenInput = document.querySelector('#adminToken');
const saveToken = document.querySelector('#saveToken');
const createForm = document.querySelector('#createForm');
const editForm = document.querySelector('#editForm');
const dialog = document.querySelector('#editDialog');
const rows = document.querySelector('#licenseRows');
const message = document.querySelector('#message');
const summary = document.querySelector('#summary');
const refresh = document.querySelector('#refresh');

let licenses = [];

const token = () => localStorage.getItem('license_admin_token') || '';
tokenInput.value = token();

const showMessage = (text, isError = false) => {
  message.hidden = false;
  message.textContent = text;
  message.style.background = isError ? '#fff0f0' : '#e9f8f4';
  message.style.borderColor = isError ? '#f1b8b8' : '#b8eadc';
  message.style.color = isError ? '#a83232' : '#08705c';
};

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({ success: false, message: 'Invalid response' }));
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Request failed');
  return payload.data;
};

const formData = (form) => {
  const data = Object.fromEntries(new FormData(form).entries());
  ['max_users', 'max_technicians', 'max_customers', 'max_storage_gb', 'grace_days'].forEach(key => {
    if (data[key] !== undefined && data[key] !== '') data[key] = Number(data[key]);
  });
  Object.keys(data).forEach(key => {
    if (data[key] === '') delete data[key];
  });
  return data;
};

const badge = status => `<span class="badge ${status}">${status || '-'}</span>`;

const render = () => {
  summary.textContent = `${licenses.length} licenses`;
  if (!licenses.length) {
    rows.innerHTML = '<tr><td colspan="7" class="empty">ยังไม่มีข้อมูล</td></tr>';
    return;
  }
  rows.innerHTML = licenses.map(item => `
    <tr>
      <td><b>${item.company_name || '-'}</b><br><small>${item.contact_phone || ''}</small></td>
      <td class="license-key">${item.license_key}</td>
      <td>${badge(item.status)}</td>
      <td>${item.plan_code || '-'}<br><small>${item.billing_cycle || '-'}</small></td>
      <td>${item.domain_name || '-'}</td>
      <td>${item.expires_at || '-'}</td>
      <td>
        <div class="actions">
          <button data-edit="${item.license_id}">แก้ไข</button>
          <button data-copy="${item.license_key}">คัดลอก</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const load = async () => {
  try {
    licenses = await api('/api/licenses');
    render();
  } catch (error) {
    showMessage(error.message, true);
  }
};

saveToken.addEventListener('click', () => {
  localStorage.setItem('license_admin_token', tokenInput.value.trim());
  showMessage('บันทึก Token แล้ว');
  load();
});

refresh.addEventListener('click', load);

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const created = await api('/api/licenses', { method: 'POST', body: JSON.stringify(formData(createForm)) });
    createForm.reset();
    createForm.plan_code.value = 'local-business';
    createForm.status.value = 'trial';
    createForm.billing_cycle.value = 'monthly';
    createForm.max_users.value = 10;
    createForm.max_technicians.value = 5;
    createForm.max_customers.value = 500;
    createForm.max_storage_gb.value = 20;
    showMessage(`สร้าง License แล้ว: ${created.license_key}`);
    await load();
  } catch (error) {
    showMessage(error.message, true);
  }
});

rows.addEventListener('click', async (event) => {
  const editId = event.target.dataset.edit;
  const copyKey = event.target.dataset.copy;
  if (copyKey) {
    await navigator.clipboard?.writeText(copyKey);
    showMessage('คัดลอก License Key แล้ว');
  }
  if (editId) {
    const item = licenses.find(x => String(x.license_id) === String(editId));
    if (!item) return;
    Object.entries(item).forEach(([key, value]) => {
      if (editForm.elements[key]) editForm.elements[key].value = value ?? '';
    });
    dialog.showModal();
  }
});

document.querySelector('#closeDialog').addEventListener('click', () => dialog.close());

editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const data = formData(editForm);
    const id = data.license_id;
    delete data.license_id;
    await api(`/api/licenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    dialog.close();
    showMessage('บันทึก License แล้ว');
    await load();
  } catch (error) {
    showMessage(error.message, true);
  }
});

load();
