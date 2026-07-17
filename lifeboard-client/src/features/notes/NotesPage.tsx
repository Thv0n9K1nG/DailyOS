import React from "react";
import { useAllDailyNotes } from "./hooks/useNotes";
import { EmptyState } from "../../components/ui/EmptyState";
import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

export const NotesPage: React.FC = () => {
  const { data: notes, isLoading } = useAllDailyNotes();

  return (
    <div>
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] mb-5">
        <h2 className="text-xl font-bold text-[--text-primary] mb-2">Nhật ký & Ghi chú</h2>
        <p className="text-sm text-[--text-secondary]">Xem lại tất cả ghi chú hàng ngày của bạn.</p>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải ghi chú...</div>
      ) : !notes || notes.length === 0 ? (
        <EmptyState 
          icon={<FileText size={48} />} 
          title="Chưa có ghi chú nào" 
          description="Bạn có thể thêm ghi chú trực tiếp khi click chọn một ngày trên Lịch." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map(note => (
            <Link to={`/calendar/${note.noteDate.split('T')[0]}`} key={note.id} style={{ textDecoration: "none" }}>
              <div className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle] hover:border-[--accent-primary] transition-all cursor-pointer h-60 flex flex-col justify-between">
                <div>
                  <div className="text-sm font-semibold text-[--accent-primary] mb-3">
                    {new Date(note.noteDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-[--text-secondary] overflow-hidden text-ellipsis line-clamp-5">
                    <ReactMarkdown>{note.content || ""}</ReactMarkdown>
                  </div>
                </div>
                <div className="text-xs text-[--text-muted] mt-3">
                  Cập nhật: {new Date(note.updatedAt).toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
