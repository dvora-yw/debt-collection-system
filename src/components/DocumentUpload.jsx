import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';





export function DocumentUpload({ onUpload }) {
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newDocuments = files.map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      uploadDate: new Date().toLocaleDateString('he-IL'),
      status: 'uploading' ,
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);

    // Simulate upload
    newDocuments.forEach((doc) => {
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: 'completed' } : d
          )
        );
      }, 1500);
    });

    onUpload?.(newDocuments);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes)  => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) return 'image';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'pdf':
      case 'word':
      case 'excel':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg mb-1">העלה מסמכים</h3>
            <p className="text-sm text-muted-foreground mb-4">
              גרור ושחרר קבצים כאן או לחץ לבחירה
            </p>
            <label>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
              <Button as="span" variant="primary" size="md">
                <Upload className="w-5 h-5" />
                בחר קבצים
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            תומך ב: PDF, Word, Excel, תמונות (עד 10MB לקובץ)
          </p>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">קבצים שהועלו ({documents.length})</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} padding="sm">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.status === 'completed'
                        ? 'bg-[#10b981]/10 text-[#10b981]'
                        : doc.status === 'error'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {doc.status === 'completed' && (
                      <div className="w-8 h-8 bg-[#10b981]/10 text-[#10b981] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    {doc.status === 'error' && (
                      <div className="w-8 h-8 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="w-8 h-8 hover:bg-muted rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
