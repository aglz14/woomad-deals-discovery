
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (file: File | null) => void;
  value?: File | null;
  label?: string;
  acceptedFileTypes?: string;
  maxSize?: number; // in MB
  previewUrl?: string;
}

export function Upload({
  onChange,
  value,
  label = "Upload file",
  acceptedFileTypes = "image/*",
  maxSize = 5, // 5MB default
  previewUrl,
  className,
  ...props
}: UploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      onChange?.(null);
      setPreview(null);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      onChange?.(null);
      return;
    }

    // Create preview
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreview(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);

    setError(null);
    onChange?.(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check file type
      if (!file.type.match(acceptedFileTypes.replace('*', ''))) {
        setError(`Only ${acceptedFileTypes} files are allowed`);
        return;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit`);
        return;
      }
      
      // Create preview
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
      
      setError(null);
      onChange?.(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors",
          error && "border-destructive"
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          {...props}
        />
        
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-32 max-w-full object-contain rounded-md" 
            />
            <Button 
              variant="outline" 
              size="sm" 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onChange?.(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-xs text-muted-foreground">
              Drag & drop or click to browse
            </p>
          </div>
        )}
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
