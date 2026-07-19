import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Result
                status="404"
                title="404 - Halaman Kosong"
                subTitle="Maaf, halaman atau fitur yang Anda tuju belum tersedia atau tidak ditemukan."
                extra={
                    <Button type="primary" onClick={() => navigate('/dashboard')}>
                        Kembali ke Dashboard
                    </Button>
                }
            />
        </div>
    );
};

export default NotFound;
