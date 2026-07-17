import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Plus, FileText, Clock, Smile } from "lucide-react";
import { useTasks, useCompleteTask, useUncompleteTask, useCreateTask } from "../tasks/hooks/useTasks";
import { Button } from "../../components/ui/Button";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { TaskFormModal } from "../tasks/TaskFormModal";
import { useDailyNote, useUpsertDailyNote } from "../notes/hooks/useNotes";
import { useMoodEntry, useUpsertMoodEntry } from "../mood/hooks/useMood";
import ReactMarkdown from "react-markdown";

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return `${days[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: "Cao",     color: "var(--priority-high)" },
  medium: { label: "Vừa",     color: "var(--priority-medium)" },
  low:    { label: "Thấp",    color: "var(--priority-low)" },
};

const MOOD_EMOJIS = [
  { score: 1, emoji: "😞", label: "Rất tệ" },
  { score: 2, emoji: "😕", label: "Tệ" },
  { score: 3, emoji: "😐", label: "Bình thường" },
  { score: 4, emoji: "🙂", label: "Tốt" },
  { score: 5, emoji: "😄", label: "Tuyệt vời" },
];

export const DailyDetailPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteTab, setNoteTab] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState("Đã lưu");

  const { data, isLoading } = useTasks({ plannedDate: date });
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const createTask = useCreateTask();

  // Stage 3 Notes & Mood Queries
  const { data: dbNote, isLoading: isLoadingNote } = useDailyNote(date || "");
  const upsertNote = useUpsertDailyNote();

  const { data: dbMood, isLoading: isLoadingMood } = useMoodEntry(date || "");
  const upsertMood = useUpsertMoodEntry();

  useEffect(() => {
    if (dbNote) {
      setNoteContent(dbNote.content || "");
    } else {
      setNoteContent("");
    }
  }, [dbNote]);

  const tasks = data?.data || [];
  const done = tasks.filter(t => t.status === "done").length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  if (!date) return null;

  const handleCreateTask = (payload: any) => {
    createTask.mutate(
      { ...payload, plannedDate: new Date(date).toISOString() },
      { onSuccess: () => setIsModalOpen(false) }
    );
  };

  const handleMoodSelect = (score: number) => {
    upsertMood.mutate({ entryDate: date, score });
  };

  const handleNoteBlur = () => {
    setSaveStatus("Đang lưu...");
    upsertNote.mutate({ noteDate: date, content: noteContent }, {
      onSuccess: () => setSaveStatus("Đã lưu"),
      onError: () => setSaveStatus("Lỗi lưu!")
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Back + Date Header */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-5) var(--space-6)",
        }}
      >
        <button
          onClick={() => navigate("/calendar")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "var(--space-4)",
            padding: 0,
            transition: "color 150ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={14} />
          Quay lại lịch
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {formatDateDisplay(date)}
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "var(--space-1)", margin: 0 }}>
              {tasks.length === 0
                ? "Không có nhiệm vụ nào"
                : `${done}/${tasks.length} nhiệm vụ đã hoàn thành`}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={14} />}
          >
            Thêm Task
          </Button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <div
              style={{
                height: 6,
                background: "var(--bg-overlay)",
                borderRadius: "var(--radius-full)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: progress === 100
                    ? "var(--color-success)"
                    : "linear-gradient(90deg, var(--accent-primary), var(--color-info))",
                  borderRadius: "var(--radius-full)",
                  transition: "width 600ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-5)" }}>
        {/* Tasks */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-5)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "var(--space-4)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              margin: "0 0 var(--space-4)"
            }}
          >
            <Clock size={16} style={{ color: "var(--accent-primary)" }} />
            Nhiệm vụ trong ngày
          </h3>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : tasks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-10) var(--space-6)",
                color: "var(--text-muted)",
                fontSize: "var(--text-sm)",
              }}
            >
              <CheckCircle size={40} style={{ margin: "0 auto var(--space-3)", opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Không có nhiệm vụ nào</p>
              <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)" }}>
                Thêm task để bắt đầu lên kế hoạch
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {tasks.map(task => {
                const pri = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      borderLeft: `3px solid ${pri.color}`,
                      background: task.status === "done" ? "var(--bg-base)" : "var(--bg-elevated)",
                      transition: "all 150ms ease",
                      animation: "slideInLeft 200ms ease both",
                    }}
                  >
                    <button
                      onClick={() =>
                        task.status === "done"
                          ? uncompleteTask.mutate(task.id)
                          : completeTask.mutate(task.id)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: task.status === "done" ? "var(--color-success)" : "var(--text-muted)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        transition: "color 150ms ease, transform 150ms ease",
                      }}
                    >
                      {task.status === "done" ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: 500,
                          color: task.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: task.status === "done" ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                          {task.description}
                        </div>
                      )}
                    </div>

                    {/* Priority badge */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        color: pri.color,
                        background: `${pri.color}22`,
                      }}
                    >
                      {pri.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes & Mood panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          
          {/* Mood Panel */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-5)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--text-md)",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "var(--space-4)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                margin: "0 0 var(--space-4)"
              }}
            >
              <Smile size={16} style={{ color: "var(--accent-primary)" }} />
              Tâm trạng hôm nay
            </h3>
            {isLoadingMood ? (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Đang tải...</div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-1)" }}>
                {MOOD_EMOJIS.map(m => {
                  const isSelected = dbMood?.score === m.score;
                  return (
                    <button
                      key={m.score}
                      onClick={() => handleMoodSelect(m.score)}
                      title={m.label}
                      style={{
                        flex: 1,
                        background: isSelected ? "var(--accent-subtle)" : "transparent",
                        border: isSelected ? "1px solid var(--accent-primary)" : "1px solid transparent",
                        borderRadius: "var(--radius-md)",
                        padding: "6px 0",
                        fontSize: "24px",
                        cursor: "pointer",
                        transition: "all 150ms ease",
                      }}
                      onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = "var(--bg-overlay)"; }}
                      onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      {m.emoji}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes Panel */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3
                style={{
                  fontSize: "var(--text-md)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  margin: 0
                }}
              >
                <FileText size={16} style={{ color: "var(--color-warning)" }} />
                Ghi chú ngày
              </h3>
              <div style={{ display: "flex", gap: "2px", background: "var(--bg-overlay)", borderRadius: "6px", padding: "2px" }}>
                <button
                  onClick={() => setNoteTab('edit')}
                  style={{
                    border: "none", background: noteTab === 'edit' ? "var(--bg-surface)" : "none",
                    color: noteTab === 'edit' ? "var(--text-primary)" : "var(--text-muted)",
                    padding: "3px 8px", fontSize: "10px", fontWeight: 600, borderRadius: "4px", cursor: "pointer"
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => setNoteTab('preview')}
                  style={{
                    border: "none", background: noteTab === 'preview' ? "var(--bg-surface)" : "none",
                    color: noteTab === 'preview' ? "var(--text-primary)" : "var(--text-muted)",
                    padding: "3px 8px", fontSize: "10px", fontWeight: 600, borderRadius: "4px", cursor: "pointer"
                  }}
                >
                  Xem
                </button>
              </div>
            </div>

            {isLoadingNote ? (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Đang tải...</div>
            ) : noteTab === 'edit' ? (
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Viết ghi chú ngày hôm nay... (Click ra ngoài để tự động lưu)"
                style={{
                  flex: 1,
                  minHeight: 220,
                  background: "var(--bg-overlay)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-sm)",
                  padding: "var(--space-3)",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.6,
                  transition: "border-color 150ms ease",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  handleNoteBlur();
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: 220,
                  background: "var(--bg-overlay)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-primary)",
                  overflowY: "auto"
                }}
              >
                {noteContent ? (
                  <ReactMarkdown>{noteContent}</ReactMarkdown>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa có nội dung ghi chú.</span>
                )}
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                💡 Hỗ trợ Markdown
              </span>
              <span style={{ fontSize: "var(--text-xs)", color: saveStatus === "Đang lưu..." ? "var(--accent-primary)" : "var(--text-muted)", fontWeight: 500 }}>
                {saveStatus}
              </span>
            </div>
          </div>

        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        initialData={null}
        isLoading={createTask.isPending}
      />
    </div>
  );
};
