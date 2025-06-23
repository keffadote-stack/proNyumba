/**
 * IMAGE UPLOAD COMPONENT - REAL FILE UPLOAD
 * 
 * Component for uploading real images from user devices.
 * Supports drag & drop, file selection, and image preview.
 * 
 * KEY FEATURES:
 * - Real file upload from device
 * - Drag and drop interface
 * - Image preview with thumbnails
 * - File validation (type, size)
 * - Multiple image support
 * - Mobile-friendly interface
 * - Progress indication
 * 
 * MVP FOCUS:
 * - Simple, clean interface
 * - Essential functionality only
 * - Good user experience
 * - Error handling
 */

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select only image files (JPG, PNG, GIF, etc.)';
    }

    // Check file size
    if (file.size > maxSizePerImage * 1024 * 1024) {
      return `Image size should be less than ${maxSizePerImage}MB`;
    }

    // Check total images limit
    if (images.length >= maxImages) {
      return `Maximum ${maxImages} images allowed`;
    }

    return null;
  };

  // Convert file to base64 data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    const newErrors: string[] = [];
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
        continue;
      }

      try {
        // Simulate upload progress
        const fileId = `${file.name}-${Date.now()}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Convert to data URL
        const dataURL = await fileToDataURL(file);
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        newImages.push(dataURL);
        
        // Remove progress indicator
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });

      } catch (error) {
        newErrors.push(`${file.name}: Failed to upload`);
      }
    }

    // Update images and errors
    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
    
    setErrors(newErrors);
    
    // Clear errors after 5 seconds
    if (newErrors.length > 0) {
      setTimeout(() => setErrors([]), 5000);
    }
  }, [images, onImagesChange, maxImages, maxSizePerImage]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  // Open file selector
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {isDragging ? (
              <Upload className="h-8 w-8 text-blue-600" />
            ) : (
              <Camera className="h-8 w-8 text-gray-600" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragging ? 'Drop images here' : 'Upload Property Images'}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports JPG, PNG, GIF • Max {maxSizePerImage}MB per image • Up to {maxImages} images
            </p>
          </div>
          
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Choose Images</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading...</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">Upload Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* Primary image indicator */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
            
            {/* Add more button */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={openFileSelector}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <div className="text-center">
                  <Camera className="h-6 w-6 text-gray-400 group-hover:text-blue-600 mx-auto mb-1" />
                  <span className="text-xs text-gray-500 group-hover:text-blue-600">Add More</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📸 Photo Tips for Better Listings:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Take photos in good lighting (natural light is best)</li>
          <li>• Show different rooms and angles</li>
          <li>• Include exterior and interior shots</li>
          <li>• Make sure rooms are clean and tidy</li>
          <li>• The first image will be used as the main photo</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;