import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import api from '../../../api/axiosConfig';

const DepartmentModal = ({ open, onCancel, onSuccess, editingData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingData) {
                form.setFieldsValue(editingData);
            } else {
                form.resetFields();
            }
        }
    }, [open, editingData, form]);

    const handleAddEdit = async (values) => {
        try {
            if (editingData) {
                await api.put(`hr/departments/${editingData.id}/`, values);
                message.success('Department updated successfully');
            } else {
                await api.post('hr/departments/', values);
                message.success('Department created successfully');
            }
            onSuccess();
        } catch (error) {
            message.error('Failed to save department');
        }
    };

    return (
        <Modal
            title={editingData ? "Edit Department" : "Add Department"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            styles={{ body: { overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' } }}
        >
            <Form form={form} layout="vertical" onFinish={handleAddEdit}>
                <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DepartmentModal;
