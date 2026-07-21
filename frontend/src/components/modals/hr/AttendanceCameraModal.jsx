import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Typography, Spin, Alert, Row, Col } from 'antd';
import { CameraOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AttendanceCameraModal = ({ visible, onCancel, onConfirm, loading, type }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    
    const [location, setLocation] = useState(null);
    const [locError, setLocError] = useState(null);
    
    const [cameraError, setCameraError] = useState(null);
    const [photoData, setPhotoData] = useState(null);

    // Initialize Camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setCameraError('Gagal mengakses kamera. Pastikan Anda telah memberikan izin.');
        }
    };

    // Stop Camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Get Location
    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setLocError('Browser Anda tidak mendukung Geolocation.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                console.error("Geolocation Error:", err);
                let errorMsg = 'Gagal mendapatkan lokasi.';
                if (err.code === 1) {
                    errorMsg = 'Akses lokasi ditolak. Silakan izinkan akses lokasi (GPS) di pengaturan browser Anda (ikon gembok di sebelah URL).';
                } else if (err.code === 2) {
                    errorMsg = 'Sinyal lokasi tidak tersedia (Position Unavailable). Pastikan fitur Lokasi (Location) di sistem operasi (Windows/Mac) Anda aktif.';
                } else if (err.code === 3) {
                    errorMsg = 'Pencarian lokasi terlalu lama (Timeout). Coba lagi atau gunakan jaringan internet yang berbeda.';
                }
                setLocError(errorMsg);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        if (visible) {
            setPhotoData(null);
            setLocError(null);
            setCameraError(null);
            setLocation(null);
            startCamera();
            fetchLocation();
        } else {
            stopCamera();
        }
        
        return () => stopCamera();
    }, [visible]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            // Set canvas size matching video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            
            // Convert to base64
            const imageStr = canvasRef.current.toDataURL('image/jpeg', 0.8);
            setPhotoData(imageStr);
            stopCamera();
        }
    };

    const handleRetake = () => {
        setPhotoData(null);
        startCamera();
    };

    const handleConfirm = () => {
        if (!location || !photoData) return;
        
        // Convert Base64 to Blob/File for FormData
        fetch(photoData)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `attendance_${type}_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onConfirm(location.latitude, location.longitude, file);
            });
    };

    return (
        <Modal
            title={<span><CameraOutlined /> Konfirmasi {type === 'in' ? 'Check In' : 'Check Out'}</span>}
            open={visible}
            onCancel={() => { stopCamera(); onCancel(); }}
            footer={null}
            destroyOnClose
            centered
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cameraError && <Alert type="error" message={cameraError} showIcon />}
                {locError && <Alert type="error" message={locError} showIcon />}
                
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                    {!photoData ? (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <img 
                            src={photoData} 
                            alt="Captured" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EnvironmentOutlined style={{ color: location ? '#52c41a' : '#1890ff', fontSize: '20px' }} />
                        <div>
                            <Text strong style={{ display: 'block' }}>Status Lokasi GPS</Text>
                            {location ? (
                                <Text type="success" style={{ fontSize: '12px' }}>
                                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                                </Text>
                            ) : (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {locError ? 'Gagal dilacak' : 'Mencari satelit...'} {!locError && <Spin size="small" style={{ marginLeft: 8 }}/>}
                                </Text>
                            )}
                        </div>
                    </div>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        {!photoData ? (
                            <Button 
                                type="primary" 
                                block 
                                onClick={handleCapture}
                                disabled={!!cameraError}
                            >
                                Ambil Foto
                            </Button>
                        ) : (
                            <Button block onClick={handleRetake}>
                                Ulangi Foto
                            </Button>
                        )}
                    </Col>
                    <Col span={12}>
                        <Button 
                            type="primary" 
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            block 
                            disabled={!photoData || !location || loading}
                            loading={loading}
                            onClick={handleConfirm}
                        >
                            Konfirmasi {type === 'in' ? 'Check In' : 'Check Out'}
                        </Button>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default AttendanceCameraModal;
