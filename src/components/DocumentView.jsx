import React, { useEffect, useState, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { FileText, Download, Eye, Trash2, File, Image as ImageIcon, Calendar, Search, Upload, X } from 'lucide-react';
import { listByClient as listDocsByClient, deleteDocument, uploadDocument } from '../services/clientDocumentService';
import api from '../services/api';

export default function DocumentsView({ clientId, clientName = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const uploadInputRef = useRef(null);
  const docxContainerRef = useRef(null);
  const [isDocxPreview, setIsDocxPreview] = useState(false);
  const [docxError, setDocxError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!clientId) { setLoading(false); return; }
        const res = await listDocsByClient(clientId);
        if (!mounted) return;
        const docs = (res.data || []).map((d) => ({
          id: d.id,
          name: d.fileName,
          filePath: d.filePath,
          uploadedAt: d.uploadedAt,
          type: inferType(d.fileName),
        }));
        setDocuments(docs);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'שגיאה בטעינת מסמכים');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [clientId]);

  const refreshDocs = async () => {
    try {
      const res = await listDocsByClient(clientId);
      const docs = (res.data || []).map((d) => ({
        id: d.id,
        name: d.fileName,
        filePath: d.filePath,
        uploadedAt: d.uploadedAt,
        type: inferType(d.fileName),
      }));
      setDocuments(docs);
    } catch (e) {
      setError(e?.message || 'שגיאה ברענון מסמכים');
    }
  };

  const filteredDocuments = documents.filter((doc) => (doc.name || '').includes(searchTerm));

  const inferType = (name) => {
    if (!name) return 'file';
    const ext = name.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['doc', 'docx'].includes(ext)) return 'word';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'pdf':
      case 'word':
      case 'excel':
      case 'powerpoint':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getFileColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-destructive/10 text-destructive';
      case 'word':
        return 'bg-[#2b579a]/10 text-[#2b579a]';
      case 'excel':
        return 'bg-[#217346]/10 text-[#217346]';
      case 'powerpoint':
        return 'bg-[#d24726]/10 text-[#d24726]';
      case 'image':
        return 'bg-[#f59e0b]/10 text-[#f59e0b]';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const resolveCandidates = (doc) => {
    const base = api.defaults.baseURL || '';
    const id = doc?.id;
    const candidates = [];

    const addIfUrl = (u) => {
      if (!u) return;
      const s = String(u);
      // Only allow absolute http(s) or relative server paths; ignore local file paths like C:\...
      if (/^https?:\/\//i.test(s) || s.startsWith('/')) {
        candidates.push(s);
      }
    };

    addIfUrl(doc?.url);
    addIfUrl(doc?.fileUrl);
    // Do NOT use doc.filePath if it's a local path; rely on API endpoints
    if (id) {
      candidates.push(`${base}/client-documents/${id}/file`);
      candidates.push(`${base}/client-documents/${id}/download`);
      candidates.push(`${base}/client-documents/${id}`);
    }
    return candidates;
  };

  const fetchDocBlob = async (doc) => {
    const candidates = resolveCandidates(doc);
    let lastErr;
    for (const url of candidates) {
      try {
        const res = await api.get(url, { responseType: 'blob' });
        return res;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        if (![404, 400, 405].includes(status)) break;
      }
    }
    throw lastErr || new Error('לא ניתן לפתוח את המסמך');
  };

  const onPreview = async (doc) => {
    try {
      const res = await fetchDocBlob(doc);
      const blob = res.data;
      const mime = res.headers['content-type'] || blob.type || 'application/octet-stream';
      setPreviewMime(mime);
      setPreviewDoc(doc);

      const name = doc?.name?.toLowerCase() || '';
      const isDocx = mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || name.endsWith('.docx');
      if (isDocx) {
        setIsDocxPreview(true);
        setDocxError(null);
        if (docxContainerRef.current) {
          docxContainerRef.current.innerHTML = '';
        }
        await renderAsync(blob, docxContainerRef.current, undefined, { className: 'docx-preview', inWrapper: true })
          .catch((e) => setDocxError(e?.message || 'שגיאה בתצוגת DOCX'));
        setPreviewUrl(null);
      } else {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setIsDocxPreview(false);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'שגיאה בפתיחת המסמך');
    }
  };

  const onDownload = async (doc) => {
    try {
      const res = await fetchDocBlob(doc);
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc?.name || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'שגיאה בהורדת המסמך');
    }
  };

  const onClickUpload = () => {
    setUploadError(null);
    uploadInputRef.current?.click();
  };

  const onUploadFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !clientId) return;
    try {
      for (const file of files) {
        try {
          await uploadDocument(clientId, file);
        } catch (err) {
          setUploadError(err?.response?.data?.message || err?.message || 'שגיאה בהעלאה');
        }
      }
      await refreshDocs();
    } finally {
      e.target.value = '';
    }
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>מסמכים</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {clientName} • {filteredDocuments.length} מסמכים
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="חיפוש מסמך..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div>
              <input ref={uploadInputRef} type="file" multiple onChange={onUploadFiles} className="hidden" />
              <Button type="button" variant="outline" onClick={onClickUpload}>
                <Upload className="w-4 h-4" />
                העלה מסמך
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6">טוען מסמכים...</div>
        ) : error ? (
          <div className="py-6 text-destructive">{error}</div>
        ) : filteredDocuments.length > 0 ? (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-background rounded-xl hover:bg-muted/30 transition-colors border border-border"
              >
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFileColor(doc.type)}`}>
                    {getFileIcon(doc.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{doc.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('he-IL') : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="תצוגה מקדימה"
                      onClick={() => onPreview(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="הורד מסמך"
                      onClick={() => onDownload(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="מחק מסמך"
                      onClick={async () => {
                        if (!window.confirm('למחוק את המסמך? אי אפשר לשחזר.')) return;
                        try {
                          await deleteDocument(doc.id);
                          await refreshDocs();
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {uploadError && (
              <div className="text-sm text-destructive">{uploadError}</div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">לא נמצאו מסמכים</p>
          </div>
        )}
        {previewDoc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
            <div className="bg-background rounded-xl shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="font-medium truncate">תצוגה מקדימה • {previewDoc?.name}</div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3">
                {previewUrl && previewMime?.startsWith('image/') && (
                  <img src={previewUrl} alt="preview" className="max-h-[70vh] w-full object-contain" />
                )}
                {previewUrl && previewMime === 'application/pdf' && (
                  <object data={previewUrl} type="application/pdf" className="w-full h-[70vh]">
                    <iframe src={previewUrl} className="w-full h-[70vh]" title="PDF Preview" />
                  </object>
                )}
                {isDocxPreview && (
                  <div className="w-full h-[70vh] overflow-auto">
                    {docxError ? (
                      <div className="text-sm text-destructive">{docxError}</div>
                    ) : (
                      <div ref={docxContainerRef} className="prose max-w-none"></div>
                    )}
                  </div>
                )}
                {(!previewUrl && !isDocxPreview) && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="text-sm text-muted-foreground">
                      לא ניתן להציג בתצוגה מקדימה קובץ מסוג זה. ניתן להוריד ולצפות מקומית.
                    </div>
                    <Button variant="outline" onClick={() => onDownload(previewDoc)}>הורד קובץ</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
