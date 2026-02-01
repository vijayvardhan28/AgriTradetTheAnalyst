import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DiseaseDetector = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const analyzeDisease = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('http://localhost:5000/disease-detect', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to analyze image');
            }
        } catch (err) {
            setError('Error connecting to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                AI Crop Disease Detector
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${selectedImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                            }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-lg shadow-md"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <Upload className="h-12 w-12 mb-4" />
                                <p className="font-medium">Click or drag image to upload</p>
                                <p className="text-sm mt-2">Supports JPG, PNG</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={analyzeDisease}
                        disabled={!selectedImage || loading}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${!selectedImage || loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                Analyzing...
                            </span>
                        ) : (
                            'Analyze Disease'
                        )}
                    </button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {result ? (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className={`p-4 ${result.disease === 'Healthy Plant' ? 'bg-green-100' : 'bg-red-50'}`}>
                                <h2 className={`text-2xl font-bold ${result.disease === 'Healthy Plant' ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.disease}
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                        Recommended Treatment
                                    </h3>
                                    <div className="prose prose-green max-w-none text-gray-600 leading-relaxed">
                                        <ReactMarkdown>{result.treatment}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8">
                            <div className="text-center">
                                <p className="text-lg font-medium mb-2">No Analysis Yet</p>
                                <p className="text-sm">Upload an image and click analyze to see results</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetector;
