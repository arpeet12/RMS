import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { publicAPI } from '../../services/api';
import { Html5Qrcode } from 'html5-qrcode';
import { FaQrcode, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const QRScanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const qrCodeScannerRef = useRef(null);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OFFICER';
  // Both admin and agent navigate to admin candidate details since agents can view them
  const basePath = '/admin/candidates';

  const stopScanning = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        await qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleScanSuccess = async (passportNum, dateOfBirth) => {
    setLoading(true);
    setError('');

    try {
      const response = await publicAPI.checkCandidateStatus({
        passportNumber: passportNum,
        dateOfBirth: dateOfBirth
      });

      if (response.data && response.data.candidate && response.data.candidate.id) {
        await stopScanning();
        navigate(`${basePath}/${response.data.candidate.id}`);
      } else {
        setError('Candidate ID not found in response.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch candidate. Please check the QR code.');
      setLoading(false);
      await stopScanning();
    }
  };

  const startScanning = async () => {
    if (scanning) return;
    
    setScanning(true);
    setError('');
    setLoading(false);

    try {
      const scannerElementId = 'qr-reader';
      
      // Request camera permissions explicitly
      let cameras = [];
      try {
        cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setError('No cameras found on this device.');
          setScanning(false);
          return;
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission')) {
          setError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application. Please close other apps using the camera and try again.');
        } else {
          setError('Failed to access camera. Please ensure camera permissions are granted and try again.');
        }
        setScanning(false);
        return;
      }

      const html5QrCode = new Html5Qrcode(scannerElementId);
      
      const config = {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
      };

      const onScanSuccess = async (decodedText, decodedResult) => {
        try {
          // Try to parse as JSON
          const qrData = JSON.parse(decodedText);
          if (qrData.passportNumber && qrData.dateOfBirth) {
            await handleScanSuccess(qrData.passportNumber, qrData.dateOfBirth);
          } else {
            setError('Invalid QR code format. QR code should contain passportNumber and dateOfBirth.');
            await stopScanning();
          }
        } catch (parseError) {
          // If not JSON, try to parse as simple format (passportNumber|dateOfBirth)
          const parts = decodedText.split('|');
          if (parts.length === 2) {
            await handleScanSuccess(parts[0].trim(), parts[1].trim());
          } else {
            setError('Invalid QR code format. Please ensure the QR code contains valid candidate information.');
            await stopScanning();
          }
        }
      };

      // Use the first available camera (prefer back camera if available)
      const backCamera = cameras.find(cam => cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('rear'));
      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      // Start scanning with camera
      await html5QrCode.start(
        cameraId,
        config,
        onScanSuccess,
        (errorMessage) => {
          // Ignore scan failures - they're normal during scanning
        }
      ).catch((err) => {
        console.error('Error starting camera:', err);
        const errorStr = err.toString();
        if (errorStr.includes('Permission') || errorStr.includes('NotAllowedError') || errorStr.includes('PermissionDeniedError')) {
          setError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
        } else if (errorStr.includes('NotFoundError') || errorStr.includes('DevicesNotFoundError')) {
          setError('No camera found on this device.');
        } else if (errorStr.includes('NotReadableError') || errorStr.includes('TrackStartError')) {
          setError('Camera is already in use. Please close other applications using the camera and try again.');
        } else if (errorStr.includes('NotSupportedError') || errorStr.includes('getUserMedia')) {
          setError('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
        } else {
          setError('Failed to start camera: ' + errorStr);
        }
        setScanning(false);
      });

      qrCodeScannerRef.current = html5QrCode;
    } catch (err) {
      console.error('Error starting scanner:', err);
      const errorStr = err.toString();
      if (errorStr.includes('Permission') || err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
      } else {
        setError('Failed to start camera. Error: ' + errorStr);
      }
      setScanning(false);
    }
  };

  useEffect(() => {
    // Auto-start scanning when component mounts
    startScanning();

    // Cleanup scanner when component unmounts
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <DashboardLayout role={isAdmin ? "admin" : "agent"}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <FaQrcode className="text-blue-600" /> QR Code Scanner
            </h1>
            <p className="text-gray-600">
              Scan a candidate QR code to view their complete profile
            </p>
          </div>

          {!scanning ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <FaQrcode className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Click the button below to start scanning. Make sure to grant camera permissions when prompted.
                </p>
              </div>
              <button
                onClick={startScanning}
                className="w-full max-w-md flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
              >
                Start Camera Scan
              </button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="mb-4"></div>
              <button
                onClick={stopScanning}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Stop Scanning
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              <div className="flex items-start">
                <FaTimes className="mr-2 mt-0.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-4 text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
              <p className="mt-2 text-sm text-gray-600">Loading candidate profile...</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRScanPage;

