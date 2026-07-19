import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Row, Col, Typography } from 'antd';
import dayjs from 'dayjs';
import api from '../../../api/axiosConfig';

const { Title } = Typography;
const { Option } = Select;

const EmployeeModal = ({ open, onCancel, onSuccess, editingRecord, departments, positions }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingRecord) {
                form.setFieldsValue({
                    ...editingRecord,
                    username: editingRecord.user.username,
                    email: editingRecord.user.email,
                    role: editingRecord.user.role,
                    first_name: editingRecord.user.first_name,
                    last_name: editingRecord.user.last_name,
                    date_of_birth: editingRecord.date_of_birth ? dayjs(editingRecord.date_of_birth) : null,
                    join_date: editingRecord.join_date ? dayjs(editingRecord.join_date) : null,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingRecord, form]);

    const handleAddEdit = async (values) => {
        try {
            // Step 1: Create or Update User Account
            const userData = {
                username: values.username,
                email: values.email,
                role: values.role,
                first_name: values.first_name,
                last_name: values.last_name,
            };
            if (values.password) {
                userData.password = values.password;
            }

            let userId;
            if (editingRecord) {
                await api.put(`hr/users/${editingRecord.user.id}/`, userData);
                userId = editingRecord.user.id;
            } else {
                const userRes = await api.post('hr/users/', userData);
                userId = userRes.data.id;
            }

            // Step 2: Create or Update Employee Profile
            const empData = {
                user_id: userId,
                full_name: values.full_name,
                nik_ktp: values.nik_ktp,
                place_of_birth: values.place_of_birth,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
                gender: values.gender,
                religion: values.religion,
                marital_status: values.marital_status,
                address: values.address,
                employee_id: values.employee_id,
                join_date: values.join_date ? values.join_date.format('YYYY-MM-DD') : null,
                department: values.department,
                position: values.position,
                employment_status: values.employment_status
            };

            if (editingRecord) {
                await api.put(`hr/employees/${editingRecord.id}/`, empData);
                message.success('Employee updated successfully');
            } else {
                await api.post('hr/employees/', empData);
                message.success('Employee created successfully');
            }

            onSuccess();
        } catch (error) {
            message.error('Failed to save employee. Check username/email uniqueness.');
        }
    };

    return (
        <Modal
            title={editingRecord ? "Edit Employee" : "Add Employee"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            width={800}
            forceRender
        >
            <Form form={form} layout="vertical" onFinish={handleAddEdit}>
                <Title level={5}>1. Account Information (Login)</Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                            <Input disabled={!!editingRecord} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="password" 
                            label="Password" 
                            rules={[{ required: !editingRecord }]}
                            help={editingRecord ? "Leave blank to keep current password" : ""}
                        >
                            <Input.Password />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                            <Select>
                                <Option value="EMPLOYEE">Employee</Option>
                                <Option value="HR_ADMIN">HR Admin</Option>
                                <Option value="FINANCE_ADMIN">Finance Admin</Option>
                                <Option value="SUPERADMIN">Superadmin</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="last_name" label="Last Name">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Title level={5} style={{ marginTop: 16 }}>2. Employee Profile</Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employee_id" label="Employee ID (NIP)" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                            <Select placeholder="Select Department">
                                {departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="position" label="Position" rules={[{ required: true }]}>
                            <Select placeholder="Select Position">
                                {positions.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="nik_ktp" label="NIK (KTP)" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="place_of_birth" label="Place of Birth">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="date_of_birth" label="Date of Birth">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="gender" label="Gender">
                            <Select>
                                <Option value="L">Laki-laki</Option>
                                <Option value="P">Perempuan</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="marital_status" label="Marital Status">
                            <Select>
                                <Option value="SINGLE">Single</Option>
                                <Option value="MARRIED">Married</Option>
                                <Option value="DIVORCED">Divorced</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="employment_status" label="Employment Status">
                            <Select>
                                <Option value="PERMANENT">Permanent</Option>
                                <Option value="CONTRACT">Contract</Option>
                                <Option value="PROBATION">Probation</Option>
                                <Option value="INTERN">Intern</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="address" label="Address">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EmployeeModal;
