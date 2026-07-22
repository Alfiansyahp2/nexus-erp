import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert, Tabs, Descriptions, Avatar, Row, Col, Divider, Tag, Button } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import api from '../api/axiosConfig';
import ProfileEditModal from '../components/modals/ProfileEditModal';

const { Title, Text } = Typography;

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProfile = async () => {
        try {
            const response = await api.get('hr/employees/me/');
            setProfile(response.data);
        } catch (err) {
            setError('Gagal memuat profil atau Anda belum memiliki profil pegawai.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <Spin size="large" tip="Memuat Profil..." />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <Card>
                <Alert message="Oops!" description={error} type="error" showIcon />
            </Card>
        );
    }

    const items = [
        {
            key: '1',
            label: 'Data Pribadi',
            children: (
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Nama Lengkap">{profile.full_name}</Descriptions.Item>
                    <Descriptions.Item label="NIK KTP">{profile.nik_ktp}</Descriptions.Item>
                    <Descriptions.Item label="Tempat, Tanggal Lahir">
                        {profile.place_of_birth}, {profile.date_of_birth}
                    </Descriptions.Item>
                    <Descriptions.Item label="Jenis Kelamin">
                        {profile.gender === 'L' ? 'Laki-laki' : profile.gender === 'P' ? 'Perempuan' : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Agama">{profile.religion || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Golongan Darah">{profile.blood_group || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Status Pernikahan">
                        {profile.marital_status === 'SINGLE' ? 'Belum Kawin' : 
                         profile.marital_status === 'MARRIED' ? 'Kawin' : 
                         profile.marital_status === 'WIDOWED' ? 'Cerai Mati' : 
                         profile.marital_status === 'DIVORCED' ? 'Cerai Hidup' : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Alamat">{profile.address || '-'}</Descriptions.Item>
                </Descriptions>
            )
        },
        {
            key: '2',
            label: 'Data Kepegawaian',
            children: (
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="ID Pegawai (NIP)">{profile.employee_id}</Descriptions.Item>
                    <Descriptions.Item label="Tanggal Bergabung">{profile.join_date}</Descriptions.Item>
                    <Descriptions.Item label="Departemen">{profile.department_name}</Descriptions.Item>
                    <Descriptions.Item label="Posisi">{profile.position_name}</Descriptions.Item>
                    <Descriptions.Item label="Status Kepegawaian">
                        <Tag color="blue">{profile.employment_status}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            )
        },
        {
            key: '3',
            label: 'Finansial & Legal',
            children: (
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="NPWP">{profile.npwp || '-'}</Descriptions.Item>
                    <Descriptions.Item label="BPJS Kesehatan">{profile.bpjs_kesehatan || '-'}</Descriptions.Item>
                    <Descriptions.Item label="BPJS Ketenagakerjaan">{profile.bpjs_ketenagakerjaan || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Bank">{profile.bank_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Nomor Rekening">{profile.bank_account_number || '-'}</Descriptions.Item>
                </Descriptions>
            )
        },
        {
            key: '4',
            label: 'Kontak Darurat',
            children: (
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Nama Kontak">{profile.emergency_contact_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Hubungan">{profile.emergency_contact_relation || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Nomor Telepon">{profile.emergency_contact_phone || '-'}</Descriptions.Item>
                </Descriptions>
            )
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={8} lg={6}>
                <Card 
                    style={{ textAlign: 'center' }} 
                    extra={
                        <Button 
                            type="text" 
                            icon={<EditOutlined style={{ color: '#1890ff', fontSize: '18px' }} />} 
                            onClick={() => setIsEditModalOpen(true)}
                        />
                    }
                >
                    <Avatar size={100} icon={<UserOutlined />} src={profile.photo || undefined} style={{ marginBottom: '16px' }} />
                    <Title level={4} style={{ marginBottom: 4, fontSize: '18px' }}>{profile.full_name}</Title>
                    <Text type="secondary">{profile.position_name}</Text>
                    
                    <Divider dashed />
                    
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>NIP / Employee ID</Text><br />
                            <Text strong>{profile.employee_id}</Text>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Departemen</Text><br />
                            <Text strong>{profile.department_name}</Text>
                        </div>
                    </div>
                </Card>
            </Col>
            
            <Col xs={24} md={16} lg={18}>
                <Card>
                    <Tabs defaultActiveKey="1" items={items} />
                </Card>
            </Col>

            <ProfileEditModal 
                open={isEditModalOpen} 
                onCancel={() => setIsEditModalOpen(false)} 
                profile={profile} 
                onSuccess={fetchProfile}
            />
        </Row>
    );
};

export default Profile;
