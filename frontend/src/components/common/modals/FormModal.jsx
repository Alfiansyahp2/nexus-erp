import React from 'react';
import { Modal, Form } from 'antd';

/**
 * Reusable FormModal component.
 * Combines Ant Design's Modal and Form into a single standard component.
 * 
 * Usage:
 * <FormModal
 *    title="Edit Data"
 *    visible={modalVisible}
 *    onCancel={() => setModalVisible(false)}
 *    onSubmit={handleFinish}
 *    form={form}
 * >
 *    <Form.Item name="name" label="Name">
 *        <Input />
 *    </Form.Item>
 * </FormModal>
 */
const FormModal = ({
    title,
    visible,
    onCancel,
    onSubmit,
    form,
    loading = false,
    width = 600,
    okText = "Simpan",
    cancelText = "Batal",
    layout = "vertical",
    children,
    ...props
}) => {
    return (
        <Modal
            title={title}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            width={width}
            okText={okText}
            cancelText={cancelText}
            confirmLoading={loading}
            destroyOnHidden={true}
            mask={{ closable: false }}
            centered
            styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' } }}
            {...props}
        >
            <Form 
                form={form} 
                layout={layout} 
                onFinish={onSubmit}
            >
                {children}
            </Form>
        </Modal>
    );
};

export default FormModal;
