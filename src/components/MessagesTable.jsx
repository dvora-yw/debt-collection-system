import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Pagination } from './Pagination';

export function MessagesTable() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/messages/messages');
        if (!mounted) return;
        setMessages(res.data);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError(e?.message ?? String(e));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען הודעות...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">שגיאה בטעינת הודעות: {String(error)}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">נסה שנית</button>
      </div>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(messages.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedMessages = messages.slice(startIdx, endIdx);

  return (
    <div dir="rtl" className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">הודעות</h1>

      <Card>
        <CardHeader>
          <CardTitle>כל ההודעות</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            {paginatedMessages.map((msg) => (
              <div key={msg.id} className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {msg.senderName}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString('he-IL')}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {msg.content}
                </p>
              </div>
            ))}

            {messages.length === 0 && (
              <p className="py-4 text-muted-foreground">אין הודעות להצגה</p>
            )}
          </div>

          {messages.length > ITEMS_PER_PAGE && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
