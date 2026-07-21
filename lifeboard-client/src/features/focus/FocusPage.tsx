import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, Square, List, Calendar, Trash2, Tag } from "lucide-react";
import { useSettings } from "../settings/hooks/useSettings";
import { useCreateFocusSession, useFocusSessions, useUpdateFocusSession } from "./hooks/useFocus";
import { Button } from "../../components/ui/Button";
import { toLocalDateString } from "@/lib/utils";
import api from "@/lib/api";

interface FocusPageProps {
  defaultMode?: 'stopwatch' | 'pomodoro';
}

interface Split {
  id: number;
  interval: string;
  timestamp: string;
}

export const FocusPage: React.FC<FocusPageProps> = ({ defaultMode = 'pomodoro' }) => {
  const { data: settings } = useSettings();
  const createSession = useCreateFocusSession();
  const updateSession = useUpdateFocusSession();

  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>(defaultMode);
  const [isActive, setIsActive] = useState(false);

  // Pomodoro state (seconds)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);

  // Stopwatch state (milliseconds)
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const stopwatchIntervalRef = useRef<any>(null);

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionLabel, setSessionLabel] = useState<string>("");

  // Splits state
  const [splits, setSplits] = useState<Split[]>([]);
  const [lastSplitMs, setLastSplitMs] = useState(0);

  // Query by date history state
  const [queryDate, setQueryDate] = useState<string>(toLocalDateString(new Date()));
  const { data: historySessions, refetch: refetchHistory } = useFocusSessions(queryDate, queryDate);

  const [hasInitialized, setHasInitialized] = useState(false);

  // ─── Restore session from DB on first load ────────────────────────────────
  useEffect(() => {
    if (
      historySessions?.data &&
      !hasInitialized &&
      !isActive &&
      !startTime &&
      stopwatchMs === 0 &&
      queryDate === toLocalDateString(new Date())
    ) {
      const completedIds: number[] = JSON.parse(
        localStorage.getItem("completed_focus_sessions") || "[]"
      );
      const latest = historySessions.data
        .filter(s => s.sessionType === "stopwatch" && !completedIds.includes(s.id))[0];

      if (latest) {
        setStopwatchMs(latest.durationSeconds * 1000);
        setCurrentSessionId(latest.id);
        setStartTime(new Date(latest.startTime));
        setSessionLabel(latest.label || "");
        const parsedSplits = latest.splits ? JSON.parse(latest.splits) : [];
        setSplits(parsedSplits);
        setLastSplitMs(latest.durationSeconds * 1000);
      }
      setHasInitialized(true);
    }
  }, [historySessions, hasInitialized, isActive, startTime, stopwatchMs, queryDate]);

  // ─── Pomodoro default from settings ──────────────────────────────────────
  useEffect(() => {
    if (!isActive && settings && mode === "pomodoro") {
      setPomodoroSeconds(settings.pomodoroFocusMinutes * 60);
    }
  }, [settings, mode, isActive]);

  // ─── Pomodoro interval ────────────────────────────────────────────────────
  useEffect(() => {
    let interval: any = null;
    if (isActive && mode === "pomodoro") {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, mode]);

  // ─── Auto-stop Pomodoro ───────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "pomodoro" && isActive && pomodoroSeconds === 0) handleStop();
  }, [pomodoroSeconds, mode, isActive]);

  // ─── Stopwatch helpers ────────────────────────────────────────────────────
  const startStopwatchTimer = () => {
    const origin = Date.now() - stopwatchMs;
    stopwatchIntervalRef.current = setInterval(() => {
      setStopwatchMs(Date.now() - origin);
    }, 10);
  };

  const stopStopwatchTimer = () => {
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
  };

  useEffect(() => () => stopStopwatchTimer(), []);

  // ─── Format helpers ───────────────────────────────────────────────────────
  const fmtPomodoro = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const fmtMs = (ms: number): string => {
    const h = Math.floor(ms / 3_600_000).toString().padStart(2, "0");
    const m = Math.floor((ms % 3_600_000) / 60_000).toString().padStart(2, "0");
    const s = Math.floor((ms % 60_000) / 1_000).toString().padStart(2, "0");
    const ms3 = (ms % 1_000).toString().padStart(3, "0");
    return `${h}:${m}:${s}.${ms3}`;
  };

  const fmtTimestamp = (d: Date): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ` +
      `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:` +
      `${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
  };

  const fmtTotalTime = (totalSec: number): string => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h} giờ`);
    if (m > 0) parts.push(`${m} phút`);
    parts.push(`${s} giây`);
    return parts.join(" ");
  };

  // ─── Derived data ─────────────────────────────────────────────────────────
  const displaySessions = useMemo(() => {
    if (!historySessions?.data) return [];
    return historySessions.data.filter(s => s.id !== currentSessionId);
  }, [historySessions, currentSessionId]);

  const totalTodaySeconds = useMemo(() => {
    const completed = displaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const live = mode === "stopwatch" ? Math.floor(stopwatchMs / 1000) : 0;
    return completed + live;
  }, [displaySessions, stopwatchMs, mode]);

  // ─── Build payload ────────────────────────────────────────────────────────
  const buildPayload = (
    elapsed: number,
    updatedSplits: Split[],
    sTime: Date
  ) => ({
    sessionType: "stopwatch" as const,
    label: sessionLabel.trim() || "Stopwatch Session",
    startTime: sTime.toISOString(),
    endTime: new Date(sTime.getTime() + elapsed).toISOString(),
    sessionDate: toLocalDateString(sTime),
    splits: JSON.stringify(updatedSplits),
  });

  // ─── Toggle (start / pause) ───────────────────────────────────────────────
  const toggleTimer = () => {
    if (!isActive) {
      const t = startTime ?? new Date();
      if (!startTime) setStartTime(t);
      if (mode === "stopwatch") startStopwatchTimer();
      setIsActive(true);
    } else {
      setIsActive(false);
      if (mode === "stopwatch") {
        stopStopwatchTimer();

        const now = new Date();
        const elapsed = stopwatchMs;
        const lapMs = elapsed - lastSplitMs;
        setLastSplitMs(elapsed);

        const newSplit: Split = {
          id: splits.length + 1,
          interval: fmtMs(lapMs),
          timestamp: fmtTimestamp(now) + " (Pause)",
        };
        const updatedSplits = [...splits, newSplit];
        setSplits(updatedSplits);

        const sTime = startTime ?? now;
        const payload = buildPayload(elapsed, updatedSplits, sTime);

        if (currentSessionId) {
          updateSession.mutate({ id: currentSessionId, data: payload }, {
            onSuccess: () => refetchHistory(),
          });
        } else {
          createSession.mutate(payload, {
            onSuccess: saved => {
              setCurrentSessionId(saved.id);
              refetchHistory();
            },
          });
        }
      }
    }
  };

  // ─── Manual split ─────────────────────────────────────────────────────────
  const handleSplit = () => {
    if (mode !== "stopwatch" || !isActive) return;
    const now = new Date();
    const elapsed = stopwatchMs;
    const lapMs = elapsed - lastSplitMs;
    setLastSplitMs(elapsed);
    setSplits(prev => [
      ...prev,
      { id: prev.length + 1, interval: fmtMs(lapMs), timestamp: fmtTimestamp(now) },
    ]);
  };

  // ─── Reset (save & clear) ─────────────────────────────────────────────────
  const handleReset = () => {
    setIsActive(false);
    if (mode === "stopwatch") {
      stopStopwatchTimer();

      const finalize = (savedId?: number) => {
        const id = savedId ?? currentSessionId;
        if (id) {
          const ids: number[] = JSON.parse(localStorage.getItem("completed_focus_sessions") || "[]");
          if (!ids.includes(id)) {
            ids.push(id);
            localStorage.setItem("completed_focus_sessions", JSON.stringify(ids));
          }
        }
        setStopwatchMs(0);
        setCurrentSessionId(null);
        setSplits([]);
        setLastSplitMs(0);
        setStartTime(null);
        setSessionLabel("");
        refetchHistory();
        alert("Reset thành công! Phiên cũ đã được lưu.");
      };

      if (startTime && stopwatchMs > 0) {
        const payload = buildPayload(stopwatchMs, splits, startTime);
        if (currentSessionId) {
          updateSession.mutate({ id: currentSessionId, data: payload }, {
            onSuccess: saved => finalize(saved.id),
          });
        } else {
          createSession.mutate(payload, { onSuccess: saved => finalize(saved.id) });
        }
      } else {
        finalize();
      }
    } else {
      setPomodoroSeconds((settings?.pomodoroFocusMinutes || 25) * 60);
      setStartTime(null);
    }
  };

  // ─── Pomodoro stop ────────────────────────────────────────────────────────
  const handleStop = () => {
    setIsActive(false);
    if (startTime) {
      createSession.mutate({
        sessionType: mode,
        label: sessionLabel.trim() || undefined,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        sessionDate: toLocalDateString(startTime),
      }, {
        onSuccess: () => {
          setStartTime(null);
          setSessionLabel("");
          setPomodoroSeconds((settings?.pomodoroFocusMinutes || 25) * 60);
          refetchHistory();
          alert("Lưu phiên tập trung thành công!");
        },
      });
    }
  };

  // ─── Delete session ───────────────────────────────────────────────────────
  const handleDeleteSession = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiên tập trung này?")) return;
    try {
      await api.delete(`/focus-sessions/${id}`);
      if (id === currentSessionId) {
        setStopwatchMs(0); setCurrentSessionId(null); setSplits([]);
        setLastSplitMs(0); setStartTime(null); setSessionLabel("");
      }
      const ids: number[] = JSON.parse(localStorage.getItem("completed_focus_sessions") || "[]");
      localStorage.setItem("completed_focus_sessions", JSON.stringify(ids.filter(c => c !== id)));
      refetchHistory();
    } catch {
      alert("Lỗi khi xóa phiên tập trung.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const sessionStarted = !!startTime;
  const isStopwatch = mode === "stopwatch";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── MAIN CARD ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {/* Running accent bar */}
        {isActive && (
          <div style={{
            height: 3,
            background: "linear-gradient(90deg, var(--accent-primary), var(--color-success))",
            animation: "pulse 2s infinite",
          }} />
        )}

        <div style={{ padding: "32px 32px 28px" }}>

          {/* Mode tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
            <Button
              variant={mode === "pomodoro" ? "primary" : "ghost"}
              onClick={() => { if (!isActive) setMode("pomodoro"); }}
            >
              Pomodoro
            </Button>
            <Button
              variant={mode === "stopwatch" ? "primary" : "ghost"}
              onClick={() => { if (!isActive) setMode("stopwatch"); }}
            >
              Stopwatch
            </Button>
          </div>

          {/* Session name input — shown only when not yet started */}
          {!sessionStarted && (
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, maxWidth: 400, margin: "0 auto 20px" }}>
              <Tag size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Đặt tên cho phiên này (tuỳ chọn)..."
                value={sessionLabel}
                onChange={e => setSessionLabel(e.target.value)}
                style={{
                  flex: 1,
                  background: "var(--bg-overlay)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  padding: "8px 12px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          )}

          {/* Session name display — when session is running */}
          {sessionStarted && sessionLabel && (
            <div style={{
              textAlign: "center",
              marginBottom: 12,
              fontSize: 13,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
            }}>
              <Tag size={12} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
              {sessionLabel}
            </div>
          )}

          {/* Clock display */}
          <div
            style={{
              textAlign: "center",
              fontFamily: "monospace",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontSize: isStopwatch ? "clamp(52px, 8vw, 90px)" : "clamp(64px, 10vw, 120px)",
              color: "var(--text-primary)",
              padding: "20px 0 24px",
              textShadow: isActive ? "0 0 24px var(--accent-glow)" : "none",
              transition: "text-shadow 0.3s",
            }}
          >
            {isStopwatch ? fmtMs(stopwatchMs) : fmtPomodoro(pomodoroSeconds)}
          </div>

          {/* Buttons row */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {isStopwatch ? (
              !sessionStarted ? (
                <Button size="lg" variant="primary" onClick={toggleTimer} style={{ minWidth: 140 }}>
                  <Play size={18} style={{ marginRight: 8 }} /> Bắt đầu
                </Button>
              ) : (
                <>
                  <Button size="lg" variant={isActive ? "secondary" : "primary"} onClick={toggleTimer} style={{ minWidth: 140 }}>
                    {isActive
                      ? <><Pause size={18} style={{ marginRight: 8 }} /> Tạm dừng</>
                      : <><Play size={18} style={{ marginRight: 8 }} /> Tiếp tục</>}
                  </Button>
                  {isActive && (
                    <Button size="lg" variant="secondary" onClick={handleSplit} style={{ minWidth: 100 }}>
                      <List size={18} style={{ marginRight: 8 }} /> Split
                    </Button>
                  )}
                  <Button size="lg" variant="danger" onClick={handleReset} style={{ minWidth: 110 }}>
                    <Square size={18} style={{ marginRight: 8 }} /> Reset
                  </Button>
                </>
              )
            ) : (
              <>
                <Button size="lg" variant={isActive ? "secondary" : "primary"} onClick={toggleTimer} style={{ minWidth: 140 }}>
                  {isActive
                    ? <><Pause size={18} style={{ marginRight: 8 }} /> Tạm dừng</>
                    : <><Play size={18} style={{ marginRight: 8 }} /> Bắt đầu</>}
                </Button>
                {(isActive || sessionStarted) && (
                  <Button size="lg" variant="danger" onClick={handleStop} style={{ minWidth: 140 }}>
                    <Square size={18} style={{ marginRight: 8 }} /> Kết thúc
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Total time bar */}
          <div style={{
            marginTop: 24,
            padding: "12px 20px",
            background: "var(--bg-overlay)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
              Tổng thời gian tập trung hôm nay
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-primary)", fontFamily: "monospace" }}>
              {fmtTotalTime(totalTodaySeconds)}
            </span>
          </div>
        </div>

        {/* Splits section — full width inside the card, below the padding */}
        {isStopwatch && splits.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ padding: "14px 32px 8px", display: "flex", alignItems: "center", gap: 6 }}>
              <List size={14} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Splits ({splits.length})
              </span>
            </div>
            <div style={{ maxHeight: 210, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--bg-overlay)", position: "sticky", top: 0 }}>
                    <th style={{ padding: "6px 32px 6px 32px", textAlign: "left", fontWeight: 600, color: "var(--text-muted)", width: 36 }}>#</th>
                    <th style={{ padding: "6px 12px", textAlign: "center", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Khoảng TG</th>
                    <th style={{ padding: "6px 32px 6px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-muted)" }}>Mốc thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map((s, idx) => (
                    <tr
                      key={s.id}
                      style={{
                        borderTop: "1px solid var(--border-subtle)",
                        background: idx % 2 === 1 ? "var(--bg-overlay)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "7px 12px 7px 32px", color: "var(--text-muted)", fontWeight: 600 }}>{s.id}</td>
                      <td style={{ padding: "7px 12px", textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "var(--accent-primary)", whiteSpace: "nowrap" }}>{s.interval}</td>
                      <td style={{ padding: "7px 32px 7px 12px", color: "var(--text-secondary)" }}>{s.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ height: 4 }} />
          </div>
        )}
      </div>

      {/* ── HISTORY CARD ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          padding: "24px 28px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} style={{ color: "var(--accent-primary)" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Lịch sử tập trung
            </h3>
          </div>
          <input
            type="date"
            value={queryDate}
            onChange={e => setQueryDate(e.target.value)}
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              padding: "5px 10px",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {displaySessions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displaySessions.map(session => {
              const sessionSplits: Split[] = session.splits ? JSON.parse(session.splits) : [];
              const durH = Math.floor(session.durationSeconds / 3600);
              const durM = Math.floor((session.durationSeconds % 3600) / 60);
              const durS = session.durationSeconds % 60;
              const durStr = [
                durH > 0 ? `${durH}g` : "",
                durM > 0 ? `${durM}p` : "",
                `${durS}s`,
              ].filter(Boolean).join(" ");

              return (
                <div
                  key={session.id}
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  {/* Session header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: session.sessionType === "stopwatch" ? "rgba(61,142,240,0.15)" : "rgba(239,68,68,0.15)",
                          color: session.sessionType === "stopwatch" ? "var(--accent-primary)" : "var(--color-danger)",
                        }}
                      >
                        {session.sessionType === "stopwatch" ? "Stopwatch" : "Pomodoro"}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.label || "Không có nhãn"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(session.startTime).toLocaleTimeString("vi-VN")} → {new Date(session.endTime).toLocaleTimeString("vi-VN")}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                          ⏱ {durStr}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        title="Xóa phiên"
                        style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: 4, opacity: 0.6, lineHeight: 1 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Splits sub-table */}
                  {sessionSplits.length > 0 && (
                    <div style={{ borderTop: "1px dashed var(--border-subtle)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead>
                          <tr style={{ background: "var(--bg-base)" }}>
                            <th style={{ padding: "4px 16px", fontWeight: 600, color: "var(--text-muted)", textAlign: "left", width: 36 }}>#</th>
                            <th style={{ padding: "4px 12px", fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>Khoảng TG</th>
                            <th style={{ padding: "4px 16px", fontWeight: 600, color: "var(--text-muted)", textAlign: "left" }}>Mốc thời gian</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionSplits.map(s => (
                            <tr key={s.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                              <td style={{ padding: "4px 16px", color: "var(--text-muted)" }}>{s.id}</td>
                              <td style={{ padding: "4px 12px", textAlign: "center", fontFamily: "monospace", fontWeight: 600, color: "var(--accent-primary)" }}>{s.interval}</td>
                              <td style={{ padding: "4px 16px", color: "var(--text-secondary)" }}>{s.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text-muted)", fontSize: 14 }}>
            Không có dữ liệu phiên tập trung nào trong ngày này.
          </div>
        )}
      </div>
    </div>
  );
};
