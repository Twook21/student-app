"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";

interface PhotoUploadProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  currentPhoto?: string;
}

export function PhotoUpload({ onPhotoCapture, currentPhoto }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onPhotoCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL("image/jpeg");
        setPreview(photoDataUrl);
        onPhotoCapture(photoDataUrl);
        stopCamera();
      }
    }
  };

  const removePhoto = () => {
    setPreview(null);
    onPhotoCapture("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {!showCamera && !preview && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Ambil Foto
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showCamera && (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={capturePhoto}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Ambil Foto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removePhoto}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}