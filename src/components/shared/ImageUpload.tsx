/**
 * IMAGE UPLOAD COMPONENT
 * 
 * Drag-and-drop image upload component with multiple image management:
 * - Drag and drop interface
 * - Multiple image selection
 * - Image preview with thumbnails
 * - Image reordering
 * - Image deletion
 * - File validation
 */

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Move } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizePerImage = 5
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const newImages: string[] = [];
    const maxSize = maxSizePerImage * 1024 * 1024; // Convert MB to bytes

    for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSizePerImage}MB`);
        continue;
      }

      // Convert to base64 for preview (in a real app, you'd upload to a service)
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === Math.min(files.length, maxImages - images.length)) {
            onImagesChange([...images, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  /**
   * Handle file input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  /**
   * Remove image
   */
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  /**
   * Move image position
   */
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  /**
   * Open file dialog
   */
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length < maxImages ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <div className="text-center">
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : dragActive
                ? 'Drop images here'
                : 'Drag and drop images here, or click to select'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to {maxSizePerImage}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Property Images ({images.length}/{maxImages})
            </h4>
            {images.length > 0 && (
              <p className="text-xs text-gray-500">
                First image will be used as the main photo
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={image}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Main Photo Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Main Photo
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {/* Move Left */}
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                        title="Move left"
                      >
                        <Move className="h-4 w-4 text-gray-600 transform rotate-180" />
                      </button>
                    )}

                    {/* Move Right */}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                        title="Move right"
                      >
                        <Move className="h-4 w-4 text-gray-600" />
                      </button>
                    )}

                    {/* Remove */}
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1.5 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      title="Remove image"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Image Number */}
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-black bg-opacity-60 text-white text-xs rounded-full">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}

            {/* Add More Button */}
            {images.length < maxImages && (
              <button
                onClick={openFileDialog}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Add More</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      {images.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Photo Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload high-quality images to attract more tenants</li>
            <li>• Include photos of all rooms, exterior, and amenities</li>
            <li>• The first image will be used as the main photo in listings</li>
            <li>• You can reorder images by using the move buttons</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;