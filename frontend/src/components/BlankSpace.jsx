import React from 'react';
import { Result, Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';

const BlankSpace = ({ type = '404', title, description, showButton = true }) => {
    const navigate = useNavigate();

    const getStatus = () => {
        if (['403', '404', '500', 'info', 'success', 'error', 'warning'].includes(type)) {
            return type;
        }
        return 'info';
    };

    const renderContent = () => {
        if (type === 'empty') {
            return (
                <Empty 
                    description={description || "Tidak ada data di sini."} 
                    style={{ marginTop: '100px' }}
                />
            );
        }

        return (
            <Result
                status={getStatus()}
                title={title || "Halaman Kosong"}
                subTitle={description || "Maaf, halaman atau fitur ini belum tersedia."}
                extra={
                    showButton ? (
                        <Button type="primary" onClick={() => navigate('/dashboard')}>
                            Kembali ke Dashboard
                        </Button>
                    ) : null
                }
            />
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '24px' }}>
            {renderContent()}
        </div>
    );
};

export default BlankSpace;
