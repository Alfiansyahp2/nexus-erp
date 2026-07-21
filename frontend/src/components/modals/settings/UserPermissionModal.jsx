import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Button, Select, Row, Col, Typography, message, Spin, Divider } from 'antd';
import api from '../../../api/axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;

const UserPermissionModal = ({ visible, onCancel, onSuccess, user }) => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [checkedPerms, setCheckedPerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Grouped permissions to display nicely
  const [groupedPermissions, setGroupedPermissions] = useState({});

  useEffect(() => {
    if (visible) {
      fetchAllPermissions();
      if (user && user.permissions) {
        setCheckedPerms(user.permissions);
      } else {
        setCheckedPerms([]);
      }
    }
  }, [visible, user]);

  const fetchAllPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('rbac/permissions/');
      const perms = response.data;
      setAllPermissions(perms);
      
      // Group by prefix (e.g., 'hr.employee.view' -> 'hr')
      const groups = {};
      perms.forEach(p => {
        const prefix = p.slug.split('.')[0];
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(p);
      });
      setGroupedPermissions(groups);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      message.error('Gagal memuat daftar hak akses');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (value) => {
    let newPerms = [...checkedPerms];
    const slugs = allPermissions.map(p => p.slug);

    // Provide basic templates
    if (value === 'superadmin') {
      newPerms = slugs;
    } else if (value === 'hr') {
      newPerms = slugs.filter(s => s.startsWith('hr.') || s.startsWith('dashboard.'));
    } else if (value === 'finance') {
      newPerms = slugs.filter(s => s.startsWith('finance.') || s.startsWith('dashboard.'));
    } else if (value === 'inventory') {
      newPerms = slugs.filter(s => s.startsWith('inventory.') || s.startsWith('dashboard.'));
    } else if (value === 'clear') {
      newPerms = [];
    }

    setCheckedPerms(newPerms);
  };

  const handleCheckboxChange = (slug, checked) => {
    if (checked) {
      setCheckedPerms(prev => [...prev, slug]);
    } else {
      setCheckedPerms(prev => prev.filter(p => p !== slug));
    }
  };

  const handleSelectGroup = (prefix, selectAll) => {
    const groupSlugs = groupedPermissions[prefix].map(p => p.slug);
    if (selectAll) {
      const toAdd = groupSlugs.filter(slug => !checkedPerms.includes(slug));
      setCheckedPerms(prev => [...prev, ...toAdd]);
    } else {
      setCheckedPerms(prev => prev.filter(slug => !groupSlugs.includes(slug)));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await api.put(`rbac/users/${user.id}/permissions/`, {
        permissions: checkedPerms
      });
      message.success('Hak akses berhasil diperbarui!');
      onSuccess();
    } catch (error) {
      console.error('Error updating permissions:', error);
      message.error('Gagal menyimpan pembaruan hak akses');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={<span>Edit Akses Spesifik: <Text type="danger">{user?.username}</Text></span>}
      open={visible}
      onCancel={onCancel}
      width={800}
      centered
      styles={{
        body: { maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '10px' }
      }}
      footer={[
        <Button key="back" onClick={onCancel}>Batal</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
          Simpan Pembaruan Akses
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Gunakan Template Akses:</Text>
          <Select 
            style={{ width: 250, marginLeft: 16 }} 
            placeholder="Pilih template untuk autofill"
            onChange={handleTemplateChange}
          >
            <Option value="superadmin">Template: Super Admin (All Access)</Option>
            <Option value="hr">Template: HR Manager</Option>
            <Option value="finance">Template: Finance Admin</Option>
            <Option value="inventory">Template: Inventory Admin</Option>
            <Option value="clear">-- Kosongkan Semua (Clear) --</Option>
          </Select>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            (Setelah menggunakan template, Anda tetap bisa mencentang/menghapus centang di bawah ini)
          </Text>
        </div>
        
        <Divider />

        <div style={{ paddingRight: 10 }}>
          {Object.keys(groupedPermissions).map(prefix => {
            const groupSlugs = groupedPermissions[prefix].map(p => p.slug);
            const allChecked = groupSlugs.every(slug => checkedPerms.includes(slug));
            const someChecked = groupSlugs.some(slug => checkedPerms.includes(slug));
            const isIndeterminate = someChecked && !allChecked;

            return (
              <div key={prefix} style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: '#f0f2f5', borderRadius: 4 }}>
                  <Checkbox 
                    indeterminate={isIndeterminate}
                    checked={allChecked}
                    onChange={(e) => handleSelectGroup(prefix, e.target.checked)}
                  >
                    <Title level={5} style={{ margin: 0, display: 'inline-block', textTransform: 'capitalize' }}>
                      Modul: {prefix}
                    </Title>
                  </Checkbox>
                </div>
                
                <Row gutter={[16, 8]} style={{ paddingLeft: 24 }}>
                  {groupedPermissions[prefix].map(perm => (
                    <Col span={8} key={perm.slug}>
                      <Checkbox 
                        checked={checkedPerms.includes(perm.slug)}
                        onChange={(e) => handleCheckboxChange(perm.slug, e.target.checked)}
                      >
                        {perm.slug.replace(`${prefix}.`, '')}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })}
        </div>
      </Spin>
    </Modal>
  );
};

export default UserPermissionModal;
