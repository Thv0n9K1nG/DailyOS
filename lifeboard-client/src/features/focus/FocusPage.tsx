import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, Square, Clock, List, Calendar, Trash2 } from "lucide-react";
import { useSettings } from "../settings/hooks/useSettings";
import { useCreateFocusSession, useFocusSessions } from "./hooks/useFocus";
import { Button } from "../../components/ui/Button";
import { toLocalDateString, daysRemainingLabel } from "@/lib/utils";
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
  
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>(defaultMode);
  const [isActive, setIsActive] = useState(false);
  
  // Pomodoro state (in seconds)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);

  // Stopwatch state (in milliseconds)
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const stopwatchStartRef = useRef<number>(0);
  const stopwatchIntervalRef = useRef<any>(null);

  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Splits state
  const [splits, setSplits] = useState<Split[]>([]);
  const [lastSplitMs, setLastSplitMs] = useState(0);

  // Query by date history state
  const [queryDate, setQueryDate] = useState<string>(toLocalDateString(new Date()));
  const { data: historySessions, refetch: refetchHistory } = useFocusSessions(queryDate, queryDate);

  // Pomodoro default settings
  useEffect(() => {
    if (!isActive && settings && mode === 'pomodoro') {
      setPomodoroSeconds(settings.pomodoroFocusMinutes * 60);
    }
  }, [settings, mode, isActive]);

  // Pomodoro timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && mode === 'pomodoro') {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode]);

  // Auto stop Pomodoro
  useEffect(() => {
    if (mode === 'pomodoro' && isActive && pomodoroSeconds === 0) {
      handleStop();
    }
  }, [pomodoroSeconds, mode, isActive]);

  // Precise Stopwatch loop
  const startStopwatchTimer = () => {
    const startTimeStamp = Date.now() - stopwatchMs;
    stopwatchIntervalRef.current = setInterval(() => {
      setStopwatchMs(Date.now() - startTimeStamp);
    }, 10); // tick every 10ms for millisecond updates
  };

  const stopStopwatchTimer = () => {
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopStopwatchTimer();
  }, []);

  const toggleTimer = () => {
    if (!isActive) {
      if (!startTime) setStartTime(new Date());
      if (mode === 'stopwatch') {
        startStopwatchTimer();
      }
    } else {
      if (mode === 'stopwatch') {
        stopStopwatchTimer();
        // Record split on pause
        const now = new Date();
        const currentElapsed = stopwatchMs;
        const lapMs = currentElapsed - lastSplitMs;
        setLastSplitMs(currentElapsed);

        const formattedInterval = formatStopwatchTime(lapMs);
        const formattedTimestamp = formatSplitTimestamp(now);

        setSplits(prev => [
          ...prev,
          {
            id: prev.length + 1,
            interval: formattedInterval,
            timestamp: formattedTimestamp + " (Pause)"
          }
        ]);
      }
    }
    setIsActive(!isActive);
  };

  const handleSplit = () => {
    if (mode !== 'stopwatch' || !isActive) return;
    
    const now = new Date();
    const currentElapsed = stopwatchMs;
    const lapMs = currentElapsed - lastSplitMs;
    setLastSplitMs(currentElapsed);

    const formattedInterval = formatStopwatchTime(lapMs);
    const formattedTimestamp = formatSplitTimestamp(now);

    setSplits(prev => [
      ...prev,
      {
        id: prev.length + 1,
        interval: formattedInterval,
        timestamp: formattedTimestamp
      }
    ]);
  };

  const handleStop = () => {
    setIsActive(false);
    if (mode === 'stopwatch') {
      stopStopwatchTimer();
    }
    if (startTime) {
      const endTime = new Date();
      createSession.mutate({
        sessionType: mode,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        splits: mode === 'stopwatch' && splits.length > 0 ? JSON.stringify(splits) : undefined
      }, {
        onSuccess: () => {
          setStartTime(null);
          setSplits([]);
          setLastSplitMs(0);
          if (mode === 'pomodoro') {
            setPomodoroSeconds((settings?.pomodoroFocusMinutes || 25) * 60);
          } else {
            setStopwatchMs(0);
          }
          refetchHistory();
          alert("Lưu phiên tập trung thành công!");
        }
      });
    }
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'stopwatch') {
      stopStopwatchTimer();
      setStopwatchMs(0);
      setSplits([]);
      setLastSplitMs(0);
    } else {
      setPomodoroSeconds((settings?.pomodoroFocusMinutes || 25) * 60);
    }
    setStartTime(null);
  };

  const handleDeleteSession = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiên tập trung này?")) {
      try {
        await api.delete(`/focus-sessions/${id}`);
        refetchHistory();
      } catch (err) {
        alert("Lỗi khi xóa phiên tập trung.");
      }
    }
  };

  const formatPomodoroTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatStopwatchTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = (ms % 1000).toString().padStart(3, '0'); // show exact 3 digits
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const formatSplitTimestamp = (date: Date): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const dayName = days[date.getDay()];
    const mDay = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    
    return `${dayName}, ${mDay} ${monthName} ${year}, ${hours}:${minutes}:${seconds}.${ms}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-[--bg-surface] p-8 rounded-[--radius-lg] border border-[--border-subtle] shadow-sm text-center relative overflow-hidden">
        
        {/* Glowing running indicator effect */}
        {isActive && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: "linear-gradient(90deg, var(--accent-primary), var(--color-success))",
            animation: "pulse 2s infinite"
          }} />
        )}

        <div className="flex justify-center gap-4 mb-8">
          <Button variant={mode === 'pomodoro' ? 'primary' : 'ghost'} onClick={() => { if(!isActive) setMode('pomodoro') }}>
            Pomodoro
          </Button>
          <Button variant={mode === 'stopwatch' ? 'primary' : 'ghost'} onClick={() => { if(!isActive) setMode('stopwatch') }}>
            Stopwatch
          </Button>
        </div>

        {/* Dynamic Display Size for visibility */}
        <div 
          className="font-mono leading-none tracking-tight font-bold text-[--text-primary]"
          style={{ 
            fontSize: mode === 'stopwatch' ? "min(10.5vw, 100px)" : "min(13.5vw, 130px)",
            padding: "var(--space-8) 0",
            textShadow: isActive ? "0 0 20px var(--accent-glow)" : "none",
            transition: "all 0.3s ease",
            animation: isActive && mode === 'stopwatch' ? "pulse 2.5s infinite" : "none"
          }}
        >
          {mode === 'stopwatch' ? formatStopwatchTime(stopwatchMs) : formatPomodoroTime(pomodoroSeconds)}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <Button size="lg" variant={isActive ? "secondary" : "primary"} onClick={toggleTimer} className="w-40 text-lg">
            {isActive ? <><Pause size={20} className="mr-2"/> Tạm dừng</> : <><Play size={20} className="mr-2"/> Bắt đầu</>}
          </Button>

          {mode === 'stopwatch' && isActive && (
            <Button size="lg" variant="secondary" onClick={handleSplit} className="w-32 text-lg">
              Split
            </Button>
          )}
          
          {(isActive || startTime) && (
            <Button size="lg" variant="danger" onClick={handleStop} className="w-40 text-lg">
              <Square size={20} className="mr-2"/> Kết thúc
            </Button>
          )}

          {!isActive && (stopwatchMs > 0 || (mode === 'pomodoro' && pomodoroSeconds !== (settings?.pomodoroFocusMinutes || 25) * 60)) && (
            <Button size="lg" variant="ghost" onClick={handleReset} className="w-32 text-lg">
              Reset
            </Button>
          )}
        </div>

        {/* Split Table */}
        {mode === 'stopwatch' && splits.length > 0 && (
          <div style={{ marginTop: "40px", borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
            <h4 style={{ textAlign: "left", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>
              Danh sách chia khoảng thời gian (Splits)
            </h4>
            <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <th style={{ padding: "10px", textAlign: "center", fontWeight: 600 }}>STT</th>
                    <th style={{ padding: "10px", textAlign: "center", fontWeight: 600 }}>Khoảng thời gian</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: 600 }}>Mốc thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map((s, idx) => (
                    <tr key={s.id} style={{ borderBottom: idx === splits.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px", textAlign: "center", color: "var(--text-muted)", fontWeight: 500 }}>{s.id}</td>
                      <td style={{ padding: "10px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent-primary)" }}>{s.interval}</td>
                      <td style={{ padding: "10px", textAlign: "left", color: "var(--text-secondary)" }}>{s.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Date History Panel */}
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] shadow-sm">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} style={{ color: "var(--accent-primary)" }} />
            Lịch sử tập trung theo ngày
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Chọn ngày:</span>
            <input 
              type="date" 
              value={queryDate} 
              onChange={e => setQueryDate(e.target.value)} 
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                padding: "4px 8px",
                fontSize: "var(--text-xs)",
                outline: "none"
              }}
            />
          </div>
        </div>

        {historySessions?.data && historySessions.data.length > 0 ? (
          <div className="space-y-4">
            {historySessions.data.map(session => {
              const sessionSplits: Split[] = session.splits ? JSON.parse(session.splits) : [];
              return (
                <div key={session.id} style={{ background: "var(--bg-overlay)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: session.sessionType === 'stopwatch' ? "rgba(61,142,240,0.15)" : "rgba(239,68,68,0.15)",
                          color: session.sessionType === 'stopwatch' ? "var(--accent-primary)" : "var(--color-danger)"
                        }}>
                        {session.sessionType === 'stopwatch' ? 'Stopwatch' : 'Pomodoro'}
                      </span>
                      <span style={{ marginLeft: "12px", fontSize: "var(--text-sm)", color: "var(--text-primary)", fontWeight: 600 }}>
                        {session.label || "Không có nhãn"}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "4px" }}
                      title="Xóa phiên tập trung"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 text-xs text-[--text-secondary]" style={{ gap: "10px" }}>
                    <div>⏱ Bắt đầu: {new Date(session.startTime).toLocaleTimeString('vi-VN')}</div>
                    <div>⏱ Kết thúc: {new Date(session.endTime).toLocaleTimeString('vi-VN')}</div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      ⏳ Tổng cộng: {Math.floor(session.durationSeconds / 60)} phút {session.durationSeconds % 60} giây
                    </div>
                  </div>

                  {/* splits inside historical view */}
                  {sessionSplits.length > 0 && (
                    <div style={{ marginTop: "12px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>
                        Bảng Splits đã ghi nhận:
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                        <thead>
                          <tr style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)" }}>
                            <th style={{ padding: "4px", textAlign: "center" }}>STT</th>
                            <th style={{ padding: "4px", textAlign: "center" }}>Khoảng thời gian</th>
                            <th style={{ padding: "4px", textAlign: "left" }}>Mốc thời gian khi split</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionSplits.map(s => (
                            <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                              <td style={{ padding: "4px", textAlign: "center" }}>{s.id}</td>
                              <td style={{ padding: "4px", textAlign: "center", color: "var(--accent-primary)", fontWeight: 600 }}>{s.interval}</td>
                              <td style={{ padding: "4px", textAlign: "left", color: "var(--text-muted)" }}>{s.timestamp}</td>
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
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Không có dữ liệu phiên tập trung nào trong ngày này.
          </div>
        )}
      </div>
    </div>
  );
};

