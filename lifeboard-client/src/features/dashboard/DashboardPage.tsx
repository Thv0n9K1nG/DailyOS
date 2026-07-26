import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ArrowRight, ListTodo, CheckCheck, Clock, FileText, AlertCircle, Flame, Zap, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTasks, useCompleteTask, useUncompleteTask } from "../tasks/hooks/useTasks";
import { Button } from "../../components/ui/Button";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { useCountdowns } from "../countdown/hooks/useCountdowns";
import { calcDaysRemaining, fmtDays } from "../countdown/CountdownPage";
import { useDailyNote, useUpsertDailyNote } from "../notes/hooks/useNotes";
import ReactMarkdown from "react-markdown";
import { getTodayInTz, getStoredTimezone, getDeadlineInfo } from "../../stores/timezoneStore";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; glow: string; icon: React.ReactNode }> = {
  high:   { label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.14)", glow: "rgba(248,113,113,0.3)", icon: <Flame size={10} /> },
  medium: { label: "Vừa", color: "var(--priority-medium)", bg: "rgba(255,179,71,0.14)",  glow: "rgba(255,179,71,0.3)",  icon: <Zap size={10} /> },
  low:    { label: "Thấp", color: "var(--priority-low)",   bg: "rgba(82,215,191,0.14)",  glow: "rgba(82,215,191,0.3)",  icon: <ShieldCheck size={10} /> },
};

// Mini calendar widget (current month, read-only)
const MiniCalendar: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [curr, setCurr] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const daysInMonth = new Date(curr.y, curr.m + 1, 0).getDate();
  const startOffset = ((new Date(curr.y, curr.m, 1).getDay() + 6) % 7); // Mon=0
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const MONTHS = ["Th.1","Th.2","Th.3","Th.4","Th.5","Th.6","Th.7","Th.8","Th.9","Th.10","Th.11","Th.12"];

  return (
    <div>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
        <button onClick={() => setCurr(c => ({ y: c.m===0?c.y-1:c.y, m: c.m===0?11:c.m-1 }))}
          style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:"2px 6px",borderRadius:4 }}>‹</button>
        <span style={{ fontSize:"var(--text-xs)",fontWeight:600,color:"var(--text-secondary)" }}>
          {MONTHS[curr.m]} {curr.y}
        </span>
        <button onClick={() => setCurr(c => ({ y: c.m===11?c.y+1:c.y, m: c.m===11?0:c.m+1 }))}
          style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:"2px 6px",borderRadius:4 }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4 }}>
        {["T2","T3","T4","T5","T6","T7","CN"].map(d => (
          <div key={d} style={{ textAlign:"center",fontSize:9,color:"var(--text-muted)",fontWeight:600 }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
        {Array.from({length: startOffset}).map((_,i) => <div key={`e-${i}`} />)}
        {Array.from({length: daysInMonth}).map((_,i) => {
          const day = i + 1;
          const dateStr = `${curr.y}-${String(curr.m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday = dateStr === todayStr;
          return (
            <div
              key={day}
              onClick={() => navigate(`/calendar/${dateStr}`)}
              style={{
                width:"100%",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
                borderRadius:"50%",fontSize:10,fontWeight:isToday?700:400,cursor:"pointer",
                background:isToday?"var(--accent-primary)":"transparent",
                color:isToday?"white":"var(--text-secondary)",
                transition:"background 150ms ease",
              }}
              onMouseEnter={e => { if(!isToday)(e.currentTarget as HTMLDivElement).style.background="var(--bg-overlay)"; }}
              onMouseLeave={e => { if(!isToday)(e.currentTarget as HTMLDivElement).style.background="transparent"; }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── DashTaskItem ────────────────────────────────────────────────────────────
const DashTaskItem: React.FC<{
  task: { id: number; title: string; description?: string; status: string; priority: string; deadline?: string };
  pri: { label: string; color: string; bg: string; glow: string; icon: React.ReactNode };
  idx: number;
  isDone: boolean;
  onToggle: () => void;
}> = ({ task, pri, idx, isDone, onToggle }) => {
  const [hover, setHover] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const handleToggle = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 350);
    onToggle();
  };

  const deadlineInfo = getDeadlineInfo(task.deadline, isDone);
  const isOverdue = deadlineInfo.status === "overdue";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 14px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${hover && !isDone ? "var(--border-default)" : "var(--border-subtle)"}`,
        borderLeft: `3.5px solid ${isDone ? "var(--border-subtle)" : isOverdue ? "var(--color-danger)" : pri.color}`,
        background: isDone ? "transparent" : hover ? "var(--bg-elevated)" : "var(--bg-surface)",
        transition: "all 160ms ease",
        boxShadow: hover && !isDone ? `0 4px 14px rgba(0,0,0,0.18)` : "none",
        opacity: isDone ? 0.55 : 1,
        animation: `slideInLeft 200ms ${idx * 40}ms ease both`,
        cursor: "default",
      }}
    >
      {/* Priority dot */}
      <div style={{
        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
        background: isDone ? "var(--border-default)" : isOverdue ? "var(--color-danger)" : pri.color,
        boxShadow: !isDone && hover ? `0 0 6px ${pri.glow}` : "none",
        transition: "box-shadow 200ms ease",
      }} />

      {/* Toggle */}
      <button
        onClick={handleToggle}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          color: isDone ? "var(--color-success)" : isOverdue ? "var(--color-danger)" : hover ? "var(--color-success)" : "var(--text-muted)",
          flexShrink: 0, display: "flex", alignItems: "center",
          transition: "color 150ms ease, transform 150ms ease",
          transform: bouncing ? "scale(1.3)" : "scale(1)",
        }}
      >
        {isDone ? <CheckCircle2 size={19} /> : <Circle size={19} />}
      </button>

      {/* Title & Description Note preview */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 13, fontWeight: 600,
          color: isDone ? "var(--text-muted)" : isOverdue ? "var(--color-danger)" : "var(--text-primary)",
          textDecoration: isDone ? "line-through" : "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          letterSpacing: "0.01em",
        }}>
          {task.title}
        </span>
        {task.description && !isDone && (
          <span style={{
            display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            📝 {task.description}
          </span>
        )}
      </div>

      {/* Deadline badge */}
      {!isDone && deadlineInfo.status === "overdue" && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: "#f87171",
          background: "rgba(248,113,113,0.14)", padding: "2px 7px",
          borderRadius: "var(--radius-full)", border: "1px solid rgba(248,113,113,0.3)",
          flexShrink: 0, display: "flex", alignItems: "center", gap: 3,
        }}>
          <AlertCircle size={9} /> Quá hạn
        </span>
      )}

      {!isDone && deadlineInfo.status === "due_soon" && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: "var(--color-warning)",
          background: "rgba(255,179,71,0.14)", padding: "2px 7px",
          borderRadius: "var(--radius-full)", border: "1px solid rgba(255,179,71,0.3)",
          flexShrink: 0, display: "flex", alignItems: "center", gap: 3,
          animation: "pulse 1.8s infinite",
        }}>
          <Clock size={9} /> ⚡ {deadlineInfo.timeStr}
        </span>
      )}

      {!isDone && deadlineInfo.status === "normal" && (
        <span style={{
          fontSize: 10, fontWeight: 600, color: "var(--color-info)",
          background: "rgba(96,165,250,0.12)", padding: "2px 7px",
          borderRadius: "var(--radius-full)", border: "1px solid rgba(96,165,250,0.25)",
          flexShrink: 0, display: "flex", alignItems: "center", gap: 3,
        }}>
          <Clock size={9} /> {deadlineInfo.timeStr}
        </span>
      )}

      {/* Priority badge */}
      <span style={{
        padding: "2px 8px", borderRadius: "var(--radius-full)",
        fontSize: 10, fontWeight: 700,
        color: isDone ? "var(--text-muted)" : pri.color,
        background: isDone ? "var(--bg-overlay)" : pri.bg,
        border: `1px solid ${isDone ? "transparent" : pri.color}30`,
        flexShrink: 0, display: "flex", alignItems: "center", gap: 3,
      }}>
        {pri.icon} {pri.label}
      </span>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  // Use timezone-aware date for today — fixes UTC vs local date mismatch
  const today = getTodayInTz();
  const { data, isLoading } = useTasks({ plannedDate: today });
  const { data: countdownsData } = useCountdowns();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  // Daily Note editor state for today
  const [noteContent, setNoteContent] = useState("");
  const [noteTab, setNoteTab] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState("Đã lưu");

  const { data: dbNote, isLoading: isLoadingNote } = useDailyNote(today);
  const upsertNote = useUpsertDailyNote();

  useEffect(() => {
    if (dbNote) {
      setNoteContent(dbNote.content || "");
    } else {
      setNoteContent("");
    }
  }, [dbNote]);

  const handleNoteBlur = () => {
    setSaveStatus("Đang lưu...");
    upsertNote.mutate({ noteDate: today, content: noteContent }, {
      onSuccess: () => setSaveStatus("Đã lưu"),
      onError: () => setSaveStatus("Lỗi lưu!")
    });
  };

  const tasks = data?.data || [];
  const done = tasks.filter(t => t.status === "done").length;
  const pending = tasks.filter(t => t.status !== "done").length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  // Format today's label using user's timezone (not browser OS timezone)
  const todayFmt = (() => {
    const tz = getStoredTimezone();
    const now = new Date();
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now);
  })();

  const statCards = [
    {
      label: "Tổng nhiệm vụ",
      value: tasks.length,
      icon: <ListTodo size={20} />,
      color: "var(--accent-primary)",
      bg: "var(--accent-subtle)",
    },
    {
      label: "Đã hoàn thành",
      value: done,
      icon: <CheckCheck size={20} />,
      color: "var(--color-success)",
      bg: "rgba(82,215,191,0.12)",
    },
    {
      label: "Còn lại",
      value: pending,
      icon: <Clock size={20} />,
      color: "var(--color-warning)",
      bg: "rgba(255,179,71,0.12)",
    },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"var(--space-5)" }}>

      {/* Hero greeting */}
      <div
        style={{
          padding: "var(--space-6) var(--space-6)",
          background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blob */}
        <div style={{
          position:"absolute",top:-40,right:-40,width:200,height:200,
          background:"var(--accent-glow)",borderRadius:"50%",filter:"blur(60px)",
          pointerEvents:"none",
        }} />

        <div style={{ position:"relative",zIndex:1 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:"var(--text-xl)",fontWeight:700,color:"var(--text-primary)",margin:0 }}>
                Chào buổi sáng! ☀️
              </h2>
              <p style={{ color:"var(--text-secondary)",fontSize:"var(--text-sm)",marginTop:"var(--space-1)",margin:"var(--space-1) 0 0" }}>
                {todayFmt} — {tasks.length === 0
                  ? "Không có nhiệm vụ nào hôm nay."
                  : `Hôm nay bạn có ${tasks.length} nhiệm vụ cần hoàn thành.`}
              </p>
            </div>
            {progress === 100 && tasks.length > 0 && (
              <div style={{
                padding:"var(--space-2) var(--space-4)",
                background:"rgba(82,215,191,0.15)",
                borderRadius:"var(--radius-full)",
                color:"var(--color-success)",
                fontSize:"var(--text-sm)",
                fontWeight:600,
                border:"1px solid rgba(82,215,191,0.3)",
              }}>
                🎉 Hoàn thành tất cả!
              </div>
            )}
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div style={{ marginTop:"var(--space-5)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"var(--space-2)" }}>
                <span style={{ fontSize:"var(--text-xs)",color:"var(--text-secondary)",fontWeight:500 }}>
                  Tiến độ hôm nay
                </span>
                <span style={{ fontSize:"var(--text-xs)",color:"var(--text-muted)",fontWeight:600 }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div style={{ height:8,background:"var(--bg-overlay)",borderRadius:"var(--radius-full)",overflow:"hidden" }}>
                <div style={{
                  height:"100%",
                  width:`${progress}%`,
                  background:progress===100
                    ?"var(--color-success)"
                    :"linear-gradient(90deg, var(--accent-primary), var(--color-info))",
                  borderRadius:"var(--radius-full)",
                  transition:"width 600ms cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow:progress>0?"0 0 8px var(--accent-glow)":"none",
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"var(--space-4)" }}>
        {statCards.map(c => (
          <div
            key={c.label}
            style={{
              padding:"var(--space-5)",
              background:"var(--bg-surface)",
              borderRadius:"var(--radius-lg)",
              border:"1px solid var(--border-subtle)",
              borderTop:`2px solid ${c.color}`,
              display:"flex",
              alignItems:"center",
              gap:"var(--space-4)",
              transition:"border-color 200ms ease,box-shadow 200ms ease,transform 200ms ease",
              cursor:"default",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow=`0 6px 20px rgba(0,0,0,0.2), 0 0 0 1px ${c.color}33`;
              (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow="none";
              (e.currentTarget as HTMLDivElement).style.transform="translateY(0)";
            }}
          >
            <div style={{
              width:46,height:46,borderRadius:"var(--radius-md)",
              background:c.bg,color:c.color,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              boxShadow:`0 0 0 1px ${c.color}25`,
            }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize:"var(--text-2xl)",fontWeight:800,color:"var(--text-primary)",lineHeight:1,letterSpacing:"-0.02em" }}>
                {c.value}
              </div>
              <div style={{ fontSize:"var(--text-xs)",color:"var(--text-muted)",marginTop:"var(--space-1)",fontWeight:500 }}>
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-col */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:"var(--space-5)" }}>

        {/* Task list */}
        <div style={{
          background:"var(--bg-surface)",
          borderRadius:"var(--radius-lg)",
          border:"1px solid var(--border-subtle)",
          padding:"var(--space-5)",
        }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"var(--space-4)" }}>
            <h3 style={{ fontSize:"var(--text-md)",fontWeight:600,color:"var(--text-primary)",margin:0,display:"flex",alignItems:"center",gap:"var(--space-2)" }}>
              <ListTodo size={16} style={{ color:"var(--accent-primary)" }} />
              Nhiệm vụ hôm nay
            </h3>
            <Link to="/tasks" style={{ textDecoration:"none" }}>
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight size={14} style={{ marginLeft:4 }} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <SkeletonList count={4} />
          ) : tasks.length === 0 ? (
            <div style={{ textAlign:"center",padding:"var(--space-10)",color:"var(--text-muted)" }}>
              <CheckCircle2 size={40} style={{ margin:"0 auto var(--space-3)",opacity:0.25 }} />
              <p style={{ margin:0,fontSize:"var(--text-sm)" }}>Không có nhiệm vụ nào</p>
              <Link to="/tasks" style={{ textDecoration:"none" }}>
                <Button variant="primary" size="sm" style={{ marginTop:"var(--space-4)" }}>
                  Thêm nhiệm vụ
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {tasks.slice(0,8).map((task,idx) => {
                const pri = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
                const isDone = task.status === "done";
                return (
                  <DashTaskItem
                    key={task.id}
                    task={task}
                    pri={pri}
                    idx={idx}
                    isDone={isDone}
                    onToggle={() => isDone ? uncompleteTask.mutate(task.id) : completeTask.mutate(task.id)}
                  />
                );
              })}
              {tasks.length > 8 && (
                <Link to="/tasks" style={{ textDecoration:"none" }}>
                  <div style={{
                    textAlign:"center",padding:"var(--space-2)",
                    color:"var(--accent-primary)",fontSize:"var(--text-sm)",cursor:"pointer",
                    borderRadius:"var(--radius-md)",
                    border:"1px dashed var(--border-default)",
                    transition:"background 150ms",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background="var(--bg-elevated)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background="transparent"}
                  >
                    +{tasks.length - 8} nhiệm vụ khác →
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display:"flex",flexDirection:"column",gap:"var(--space-4)" }}>
          {/* Mini calendar */}
          <div style={{
            background:"var(--bg-surface)",
            borderRadius:"var(--radius-lg)",
            border:"1px solid var(--border-subtle)",
            padding:"var(--space-4)",
          }}>
            <h4 style={{ fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text-secondary)",marginBottom:"var(--space-3)",margin:"0 0 var(--space-3)" }}>
              Lịch tháng
            </h4>
            <MiniCalendar />
          </div>

          {/* Countdowns widget */}
          {countdownsData && countdownsData.length > 0 && (
            <div style={{
              background:"var(--bg-surface)",
              borderRadius:"var(--radius-lg)",
              border:"1px solid var(--border-subtle)",
              padding:"var(--space-4)",
            }}>
              <h4 style={{ fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text-secondary)",marginBottom:"var(--space-3)",margin:"0 0 var(--space-3)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>Sự kiện đếm ngược</span>
                <Link to="/countdown" style={{ fontSize:"var(--text-xs)", color:"var(--accent-primary)", textDecoration:"none", fontWeight: 600 }}>Xem tất cả</Link>
              </h4>
              <div style={{ display:"flex", flexDirection:"column", gap:"var(--space-2)" }}>
                {countdownsData.slice(0, 3).map(c => {
                  const diff = calcDaysRemaining(c.targetDate);
                  const label = fmtDays(diff);
                  return (
                    <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"var(--space-2) var(--space-3)", background:"var(--bg-overlay)", borderRadius:"var(--radius-md)", border:"1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize:"var(--text-sm)", fontWeight:500 }}>{c.icon || "⏳"} {c.title}</span>
                      <span style={{ fontSize:11, fontWeight:600, color: diff <= 7 && diff >= 0 ? "var(--color-danger)" : "var(--text-secondary)" }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div style={{
            background:"var(--bg-surface)",
            borderRadius:"var(--radius-lg)",
            border:"1px solid var(--border-subtle)",
            padding:"var(--space-4)",
          }}>
            <h4 style={{ fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text-secondary)",marginBottom:"var(--space-3)",margin:"0 0 var(--space-3)" }}>
              Truy cập nhanh
            </h4>
            <div style={{ display:"flex",flexDirection:"column",gap:"var(--space-2)" }}>
              {[
                { to:"/tomorrow",  label:"📅 Lên kế hoạch ngày mai" },
                { to:"/tasks",     label:"✅ Quản lý nhiệm vụ" },
                { to:"/calendar",  label:"🗓️ Xem lịch đầy đủ" },
              ].map(link => (
                <Link key={link.to} to={link.to} style={{ textDecoration:"none" }}>
                  <div style={{
                    padding:"var(--space-2) var(--space-3)",
                    borderRadius:"var(--radius-md)",
                    fontSize:"var(--text-sm)",
                    color:"var(--text-secondary)",
                    cursor:"pointer",
                    transition:"background 150ms ease,color 150ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background="var(--bg-elevated)";
                    (e.currentTarget as HTMLDivElement).style.color="var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background="transparent";
                    (e.currentTarget as HTMLDivElement).style.color="var(--text-secondary)";
                  }}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily note editor - full width bottom panel */}
      <div style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        padding: "var(--space-5)",
        marginTop: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h3 style={{
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            margin: 0
          }}>
            <FileText size={18} style={{ color: "var(--color-warning)" }} />
            Ghi chú hôm nay
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
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", padding: "10px 0" }}>Đang tải ghi chú...</div>
        ) : noteTab === 'edit' ? (
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Viết ghi chú nhanh hôm nay... (Tự động lưu khi click ra ngoài)"
            style={{
              width: "100%",
              minHeight: 140,
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
          <div style={{
            minHeight: 140,
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
            fontSize: "var(--text-sm)",
            color: "var(--text-primary)",
            overflowY: "auto"
          }}>
            {noteContent ? (
              <ReactMarkdown>{noteContent}</ReactMarkdown>
            ) : (
              <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa có ghi chú cho ngày hôm nay.</span>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            💡 Hỗ trợ định dạng Markdown
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: saveStatus === "Đang lưu..." ? "var(--accent-primary)" : "var(--text-muted)", fontWeight: 500 }}>
            {saveStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
