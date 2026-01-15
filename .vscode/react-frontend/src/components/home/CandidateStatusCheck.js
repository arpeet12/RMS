import React, { useState, useEffect, useRef } from 'react';
import { publicAPI } from '../../services/api';
import { FaPlane, FaPassport, FaCheckCircle, FaTimesCircle, FaClock, FaQrcode, FaKeyboard } from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';

const CandidateStatusCheck = () => {
  const [mode, setMode] = useState('manual'); // 'manual' or 'qr'
  const [passportNumber, setPassportNumber] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);

  const fetchCandidateStatus = async (passportNum, dateOfBirth) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await publicAPI.checkCandidateStatus({
        passportNumber: passportNum,
        dateOfBirth: dateOfBirth
      });
      setResult(response.data);
      // Stop scanning if QR mode
      if (mode === 'qr' && qrCodeScannerRef.current) {
        stopScanning();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch status. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchCandidateStatus(passportNumber, dob);
  };

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

  const startScanning = async () => {
    if (scanning) return;
    
    setScanning(true);
    setError('');
    setResult(null);

    try {
      const scannerElementId = 'qr-reader';
      
      // First, request camera permissions explicitly by getting camera list
      // This will trigger the browser permission prompt
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
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const onScanSuccess = async (decodedText, decodedResult) => {
        try {
          // Try to parse as JSON
          const qrData = JSON.parse(decodedText);
          if (qrData.passportNumber && qrData.dateOfBirth) {
            await stopScanning();
            fetchCandidateStatus(qrData.passportNumber, qrData.dateOfBirth);
          } else {
            setError('Invalid QR code format. QR code should contain passportNumber and dateOfBirth.');
            await stopScanning();
          }
        } catch (parseError) {
          // If not JSON, try to parse as simple format (passportNumber|dateOfBirth)
          const parts = decodedText.split('|');
          if (parts.length === 2) {
            await stopScanning();
            fetchCandidateStatus(parts[0].trim(), parts[1].trim());
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
    // Cleanup scanner when component unmounts or mode changes
    return () => {
      stopScanning();
    };
  }, [mode]);

  const handleModeChange = (newMode) => {
    if (scanning) {
      stopScanning();
    }
    setMode(newMode);
    setError('');
    setResult(null);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Check Your Application Status</h2>
        <p className="mt-2 text-gray-600">Enter your passport number and date of birth, or scan a QR code to track your process.</p>
      </div>

      {/* Mode Tabs */}
      <div className="max-w-xl mx-auto mb-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleModeChange('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              mode === 'manual'
                ? 'bg-white text-blue-800 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaKeyboard /> Manual Entry
          </button>
          <button
            onClick={() => handleModeChange('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              mode === 'qr'
                ? 'bg-white text-blue-800 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaQrcode /> QR Scan
          </button>
        </div>
      </div>

      {/* Manual Entry Mode */}
      {mode === 'manual' && (
        <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Passport Number</label>
              <input
                type="text"
                required
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Enter Passport Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* QR Scan Mode */}
      {mode === 'qr' && (
        <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          {!scanning ? (
            <div className="text-center">
              <div className="mb-4">
                <FaQrcode className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Click the button below to start scanning. Make sure to grant camera permissions when prompted.
                </p>
              </div>
              <button
                onClick={startScanning}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
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
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
              <p className="mt-2 text-sm text-gray-600">Fetching candidate details...</p>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="mt-8 max-w-4xl mx-auto space-y-6">
          {/* Candidate Info */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FaPassport className="mr-2 text-brand-blue" /> Candidate Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{result.candidate.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passport Number</p>
                <p className="font-medium">{result.candidate.passportNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passport Status</p>
                <StatusBadge status={result.candidate.passportStatus} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Medical Status</p>
                <StatusBadge status={result.candidate.medicalStatus} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Visa Status</p>
                <StatusBadge status={result.candidate.visaStatus} />
              </div>
            </div>
          </div>

          {/* Applications/Demands */}
          {result.applications && result.applications.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-green-600" /> Applied Demands
              </h3>
              <div className="space-y-4">
                {result.applications.map((app) => (
                  <div key={app.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{app.job?.title || 'Unknown Job'}</p>
                        <p className="text-sm text-gray-600">{app.country}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {app.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      {app.interviewDate && <p><span className="text-gray-500">Interview:</span> {app.interviewDate}</p>}
                      {app.visaNumber && <p><span className="text-gray-500">Visa No:</span> {app.visaNumber}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flight Tickets */}
          {result.tickets && result.tickets.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FaPlane className="mr-2 text-brand-blue" /> Flight Details
              </h3>
              <div className="space-y-4">
                {result.tickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-100 rounded p-4 bg-blue-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-brand-blue">{ticket.airline}</span>
                      <span className="text-sm font-medium px-2 py-0.5 rounded bg-white border">{ticket.status}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p className="font-medium">{ticket.departureFrom}</p>
                        <p>{ticket.departureDate} {ticket.departureTime}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <FaPlane className="text-gray-400 transform rotate-90" />
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Arrival</p>
                        <p className="font-medium">{ticket.destination}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!result.applications || result.applications.length === 0) && (!result.tickets || result.tickets.length === 0) && (
            <div className="text-center text-gray-500 py-4">
              No application or flight details found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-800';
  if (status === 'APPROVED' || status === 'PASSED') color = 'bg-green-100 text-green-800';
  if (status === 'REJECTED' || status === 'FAILED') color = 'bg-red-100 text-red-800';
  if (status === 'PENDING' || status === 'IN_PROGRESS') color = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default CandidateStatusCheck;
