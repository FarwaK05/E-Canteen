import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Image as ImageIcon, CheckCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderController } from '../../controllers/OrderController';

const EASYPAISA_NUMBER = '0300-1234567';
const BANK_ACCOUNT = 'HBL — 0001-0987654321';

export default function PaymentUploadPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !orderId) return;
    setUploading(true);
    try {
      await OrderController.uploadScreenshot(orderId, file);
      setUploaded(true);
      toast.success('Screenshot uploaded! Awaiting verification.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  if (uploaded) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-4 text-emerald-500" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Screenshot Submitted!</h2>
        <p className="text-gray-500 mb-6">
          Our staff will verify your payment shortly. You'll be notified once confirmed.
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Track My Order
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        <p className="text-gray-500 text-sm mt-1">Send payment and upload your screenshot</p>
      </div>

      {/* Payment info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Send Payment To</h2>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">EasyPaisa</p>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 text-lg">{EASYPAISA_NUMBER}</p>
            <button
              onClick={() => copyToClipboard(EASYPAISA_NUMBER)}
              className="text-emerald-600 hover:text-emerald-700 p-1"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Account Name: University Canteen</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Bank Transfer</p>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 text-sm">{BANK_ACCOUNT}</p>
            <button
              onClick={() => copyToClipboard(BANK_ACCOUNT)}
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Include your order ID in remarks</p>
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
          After sending payment, take a clear screenshot of the transaction confirmation and upload it below.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Upload Screenshot</h2>

        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">Click or drag to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Payment screenshot" className="w-full max-h-64 object-contain bg-gray-50" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-white/90 text-gray-600 hover:text-red-500 p-1.5 rounded-lg shadow"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {uploading ? 'Uploading...' : 'Submit Screenshot'}
        </button>
      </div>
    </div>
  );
}
