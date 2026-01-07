import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  File,
  Image as ImageIcon,
  Calendar,
  User,
  Search,
} from 'lucide-react';
import { Input } from './Input';



export default function DocumentsView({ clientName = 'חברת ABC בע"מ' }) {
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: '1',
      name: 'חוזה שירות 2024.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '15/12/2024',
      uploadedBy: 'שרה לוי',
      category: 'חוזים',
    },
    {
      id: '2',
      name: 'אישור ניהול ספרים.pdf',
      type: 'pdf',
      size: '856 KB',
      uploadDate: '10/12/2024',
      uploadedBy: 'יוסי כהן',
      category: 'מסמכים משפטיים',
    },
    {
      id: '3',
      name: 'תעודת עוסק מורשה.jpg',
      type: 'image',
      size: '1.2 MB',
      uploadDate: '05/12/2024',
      uploadedBy: 'שרה לוי',
      category: 'רישיונות',
    },
    {
      id: '4',
      name: 'דוח רווח והפסד Q4.xlsx',
      type: 'excel',
      size: '456 KB',
      uploadDate: '01/12/2024',
      uploadedBy: 'מיכל גרין',
      category: 'דוחות כספיים',
    },
    {
      id: '5',
      name: 'מצגת חברה.pptx',
      type: 'powerpoint',
      size: '5.8 MB',
      uploadDate: '28/11/2024',
      uploadedBy: 'יוסי כהן',
      category: 'שיווק',
    },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.name.includes(searchTerm) ||
    doc.category.includes(searchTerm) ||
    doc.uploadedBy.includes(searchTerm)
  );

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

  const getCategoryBadge = (category) => {
    const categoryColors = {
      'חוזים': 'primary',
      'מסמכים משפטיים': 'danger',
      'רישיונות': 'success',
      'דוחות כספיים': 'secondary',
      'שיווק': 'warning',
    };
    return (
      <Badge variant={categoryColors[category] || 'primary'} size="sm">
        {category}
      </Badge>
    );
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length > 0 ? (
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
                      {getCategoryBadge(doc.category)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        {doc.size}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {doc.uploadDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {doc.uploadedBy}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="צפה במסמך">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="הורד מסמך">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="מחק מסמך">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">לא נמצאו מסמכים</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
