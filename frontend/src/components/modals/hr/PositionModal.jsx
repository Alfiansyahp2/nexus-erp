import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const PositionModal = ({ open, onCancel, onSuccess, editingData, departments }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingData) {
                form.setFieldsValue({
                    ...editingData,
                    department: editingData.department
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingData, form]);

    const handleAddEdit = async (values) => {
        try {
            if (editingData) {
                await api.put(`hr/positions/${editingData.id}/`, values);
                message.success('Position updated successfully');
            } else {
                await api.post('hr/positions/', values);
                message.success('Position created successfully');
            }
            onSuccess();
        } catch (error) {
            message.error('Failed to save position');
        }
    };

    return (
        <Modal
            title={editingData ? "Edit Position" : "Add Position"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={handleAddEdit}>
                <Form.Item name="name" label="Position Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                    <Select placeholder="Select a department">
                        {departments.map(dept => (
                            <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PositionModal;
