import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, Tabs, message, Alert } from 'antd';
import dayjs from 'dayjs';
import api from '../../api/axiosConfig';

const { Option } = Select;
const { TextArea } = Input;

const ProfileEditModal = ({ open, onCancel, profile, onSuccess }) => {
    const [form] = Form.useForm();
    const [isFormValid, setIsFormValid] = useState(true);

    const checkValidation = async () => {
        try {
            await form.validateFields({ validateOnly: true });
            setIsFormValid(true);
        } catch (error) {
            setIsFormValid(false);
        }
    };

    useEffect(() => {
        if (open && profile) {
            form.setFieldsValue({
                ...profile,
                date_of_birth: profile.date_of_birth ? dayjs(profile.date_of_birth) : null,
            });
            checkValidation();
        }
    }, [open, profile, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (values.date_of_birth) {
                values.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
            }
            
            await api.patch('hr/employees/me/', values);
            message.success('Profil berhasil diperbarui!');
            onSuccess(); // Refresh data di komponen induk
            onCancel(); // Tutup modal
        } catch (error) {
            console.error(error);
            if (error.response?.data) {
                message.error('Gagal memperbarui profil: ' + JSON.stringify(error.response.data));
            } else if (!error.errorFields) { // Ignore validation errors since validateFields throws it
                message.error('Terjadi kesalahan sistem.');
            }
        }
    };

    const items = [
        {
            key: '1',
            label: 'Pribadi',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="place_of_birth" label="Tempat Lahir" rules={[{ required: true, message: 'Tempat Lahir wajib diisi' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="date_of_birth" label="Tanggal Lahir" rules={[{ required: true, message: 'Tanggal Lahir wajib diisi' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Jenis Kelamin" rules={[{ required: true, message: 'Jenis Kelamin wajib diisi' }]}>
                            <Select allowClear>
                                <Option value="L">Laki-laki</Option>
                                <Option value="P">Perempuan</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="religion" label="Agama" rules={[{ required: true, message: 'Agama wajib diisi' }]}>
                            <Select allowClear>
                                <Option value="Islam">Islam</Option>
                                <Option value="Kristen">Kristen</Option>
                                <Option value="Katolik">Katolik</Option>
                                <Option value="Hindu">Hindu</Option>
                                <Option value="Buddha">Buddha</Option>
                                <Option value="Konghucu">Konghucu</Option>
                                <Option value="Lainnya">Lainnya</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="blood_group" label="Golongan Darah" rules={[{ required: true, message: 'Golongan Darah wajib diisi' }]}>
                            <Select allowClear>
                                <Option value="A">A</Option>
                                <Option value="B">B</Option>
                                <Option value="AB">AB</Option>
                                <Option value="O">O</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="marital_status" label="Status Pernikahan" rules={[{ required: true, message: 'Status Pernikahan wajib diisi' }]}>
                            <Select allowClear>
                                <Option value="SINGLE">Belum Kawin</Option>
                                <Option value="MARRIED">Kawin</Option>
                                <Option value="WIDOWED">Cerai Mati</Option>
                                <Option value="DIVORCED">Cerai Hidup</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="address" label="Alamat Domisili" rules={[{ required: true, message: 'Alamat Domisili wajib diisi' }]}>
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
            )
        },
        {
            key: '2',
            label: 'Finansial & Legal',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="npwp" label="Nomor NPWP">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="bpjs_kesehatan" label="BPJS Kesehatan">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="bpjs_ketenagakerjaan" label="BPJS Ketenagakerjaan">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="bank_name" label="Nama Bank">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="bank_account_number" label="Nomor Rekening">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            )
        },
        {
            key: '3',
            label: 'Kontak Darurat',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="emergency_contact_name" label="Nama Kontak Darurat">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="emergency_contact_relation" label="Hubungan">
                            <Input placeholder="Contoh: Istri, Anak, Saudara" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="emergency_contact_phone" label="Nomor Telepon">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            )
        }
    ];

    return (
        <Modal
            title="Edit Profil Karyawan"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            width={700}
            okText="Simpan"
            cancelText="Batal"
            okButtonProps={{ disabled: !isFormValid }}
        >
            {!isFormValid && (
                <Alert 
                    message="Perhatian" 
                    description="Masih ada data krusial (*) yang kosong atau belum valid. Harap lengkapi terlebih dahulu untuk dapat menyimpan profil." 
                    type="warning" 
                    showIcon 
                    style={{ marginBottom: '16px' }} 
                />
            )}
            <Form form={form} layout="vertical" onFieldsChange={checkValidation}>
                <Tabs defaultActiveKey="1" items={items} />
            </Form>
        </Modal>
    );
};

export default ProfileEditModal;
