import ResourcePage from '../components/ResourcePage';
import StatusBadge from '../components/StatusBadge';
import { fmtDate } from '../services/api';

export default function WarrantyAlertPage() {
  return <ResourcePage
    title="ประกันอุปกรณ์"
    description="ตรวจวันหมดประกันของอุปกรณ์แต่ละชิ้น เพื่อวางแผนเคลม ซ่อม หรือเปลี่ยนอุปกรณ์"
    endpoint="/devices/warranty-alerts"
    idKey="device_id"
    readOnly
    filters={[
      {
        key: 'warranty_range', label: 'สถานะประกัน',
        predicate: (row, value) => value === 'expired'
          ? row.days_remaining < 0
          : value === 'soon' ? row.days_remaining >= 0 && row.days_remaining <= 60 : row.days_remaining > 60,
        options: [
          { value: 'expired', label: 'หมดแล้ว' },
          { value: 'soon', label: 'หมดภายใน 60 วัน' },
          { value: 'valid', label: 'มากกว่า 60 วัน' },
        ],
      },
      {
        key: 'device_status', label: 'สถานะอุปกรณ์',
        options: [
          { value: 'active', label: 'ใช้งานอยู่' },
          { value: 'inactive', label: 'เลิกใช้งาน' },
        ],
      },
    ]}
    columns={[
      { key: 'serial_number', label: 'Serial Number' },
      { key: 'model_name', label: 'รุ่น' },
      { key: 'customer_name', label: 'ลูกค้า' },
      { key: 'site_name', label: 'จุดติดตั้ง' },
      { key: 'device_status', label: 'สถานะ', render: row => <StatusBadge value={row.device_status} /> },
      { key: 'warranty_end_date', label: 'วันหมดประกันอุปกรณ์', render: row => fmtDate(row.warranty_end_date) },
      {
        key: 'days_remaining', label: 'ระยะเวลา',
        render: row => row.days_remaining < 0
          ? `หมดแล้ว ${Math.abs(row.days_remaining)} วัน`
          : `เหลือ ${row.days_remaining} วัน`,
      },
    ]}
  />;
}
