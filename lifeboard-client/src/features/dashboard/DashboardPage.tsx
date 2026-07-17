import React, { useState } from "react";
import { CheckCircle, Circle, ArrowRight, TrendingUp, ListTodo, CheckCheck, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTasks, useCompleteTask, useUncompleteTask } from "../tasks/hooks/useTasks";
import { Button } from "../../components/ui/Button";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { useCountdowns } from "../countdown/hooks/useCountdowns";
import { daysRemainingLabel } from "@/lib/utils";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.12)" },
  medium: { label: "Vừa", color: "var(--priority-medium)", bg: "rgba(255,179,71,0.12)" },
  low:    { label: "Thấp", color: "var(--priority-low)",   bg: "rgba(82,215,191,0.12)" },
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

export const DashboardPage: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const { data, isLoading } = useTasks({ plannedDate: today });
  const { data: countdownsData } = useCountdowns();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const tasks = data?.data || [];
  const done = tasks.filter(t => t.status === "done").length;
  const pending = tasks.filter(t => t.status !== "done").length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  const todayFmt = (() => {
    const d = new Date();
    const days = ["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"];
    return `${days[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth()+1}`;
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
              display:"flex",
              alignItems:"center",
              gap:"var(--space-4)",
              transition:"border-color 200ms ease,box-shadow 200ms ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor="var(--border-default)";
              (e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-md)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor="var(--border-subtle)";
              (e.currentTarget as HTMLDivElement).style.boxShadow="none";
            }}
          >
            <div style={{
              width:44,height:44,borderRadius:"var(--radius-md)",
              background:c.bg,color:c.color,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize:"var(--text-2xl)",fontWeight:700,color:"var(--text-primary)",lineHeight:1 }}>
                {c.value}
              </div>
              <div style={{ fontSize:"var(--text-xs)",color:"var(--text-muted)",marginTop:"var(--space-1)" }}>
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
              <TrendingUp size={16} style={{ color:"var(--accent-primary)" }} />
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
              <CheckCircle size={40} style={{ margin:"0 auto var(--space-3)",opacity:0.25 }} />
              <p style={{ margin:0,fontSize:"var(--text-sm)" }}>Không có nhiệm vụ nào</p>
              <Link to="/tasks" style={{ textDecoration:"none" }}>
                <Button variant="primary" size="sm" style={{ marginTop:"var(--space-4)" }}>
                  Thêm nhiệm vụ
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:"var(--space-2)" }}>
              {tasks.slice(0,8).map((task,idx) => {
                const pri = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    style={{
                      display:"flex",alignItems:"center",gap:"var(--space-3)",
                      padding:"var(--space-3) var(--space-4)",
                      borderRadius:"var(--radius-md)",
                      border:"1px solid var(--border-subtle)",
                      borderLeft:`3px solid ${pri.color}`,
                      background:task.status==="done"?"var(--bg-base)":"var(--bg-elevated)",
                      transition:"all 150ms ease",
                      animation:`slideInLeft 200ms ${idx*40}ms ease both`,
                    }}
                  >
                    <button
                      onClick={() => task.status==="done"?uncompleteTask.mutate(task.id):completeTask.mutate(task.id)}
                      style={{ background:"none",border:"none",cursor:"pointer",padding:0,
                        color:task.status==="done"?"var(--color-success)":"var(--text-muted)",
                        flexShrink:0,display:"flex",alignItems:"center",transition:"color 150ms ease,transform 150ms ease",
                      }}
                    >
                      {task.status==="done" ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </button>
                    <span style={{
                      flex:1,fontSize:"var(--text-sm)",fontWeight:500,
                      color:task.status==="done"?"var(--text-muted)":"var(--text-primary)",
                      textDecoration:task.status==="done"?"line-through":"none",
                    }}>
                      {task.title}
                    </span>
                    <span style={{
                      padding:"2px 8px",borderRadius:"var(--radius-full)",
                      fontSize:10,fontWeight:600,
                      color:pri.color,background:pri.bg,
                    }}>
                      {pri.label}
                    </span>
                  </div>
                );
              })}
              {tasks.length > 8 && (
                <Link to="/tasks" style={{ textDecoration:"none" }}>
                  <div style={{ textAlign:"center",padding:"var(--space-2)",color:"var(--accent-primary)",fontSize:"var(--text-sm)",cursor:"pointer" }}>
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
                  const diff = c.daysRemaining;
                  const label = daysRemainingLabel(diff);
                  return (
                    <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"var(--space-2) var(--space-3)", background:"var(--bg-overlay)", borderRadius:"var(--radius-md)", border:"1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize:"var(--text-sm)", fontWeight:500 }}>{c.icon || "⏳"} {c.title}</span>
                      <span style={{ fontSize:11, fontWeight:600, color: diff <= 3 && diff >= 0 ? "var(--color-danger)" : "var(--text-secondary)" }}>{label}</span>
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
    </div>
  );
};
