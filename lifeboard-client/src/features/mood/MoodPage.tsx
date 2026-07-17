import React from "react";
import { useAllMoodEntries } from "./hooks/useMood";
import { EmptyState } from "../../components/ui/EmptyState";
import { Smile, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { moodEmojis } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const MoodPage: React.FC = () => {
  const { data: moods, isLoading } = useAllMoodEntries();

  const getMoodLabel = (score: number) => {
    if (score === 5) return "Rất vui vẻ";
    if (score === 4) return "Tích cực";
    if (score === 3) return "Bình thường";
    if (score === 2) return "Mệt mỏi";
    return "Tệ / Áp lực";
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return "var(--color-success)";
    if (score === 3) return "var(--accent-primary)";
    return "var(--color-danger)";
  };

  // Sort chronological for line chart
  const sortedMoods = moods 
    ? [...moods].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()) 
    : [];

  const chartData = sortedMoods.map(entry => ({
    name: new Date(entry.entryDate).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
    "Cảm xúc": entry.score,
    mood: getMoodLabel(entry.score),
  }));

  const avgMood = moods && moods.length > 0 
    ? (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1) 
    : "0.0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Header */}
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle]">
        <h2 className="text-xl font-bold text-[--text-primary] mb-2">Nhật ký tâm trạng</h2>
        <p className="text-sm text-[--text-secondary]">Xem xu hướng cảm xúc của bạn qua biểu đồ trực quan.</p>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải nhật ký tâm trạng...</div>
      ) : !moods || moods.length === 0 ? (
        <EmptyState 
          icon={<Smile size={48} />} 
          title="Chưa có ghi nhận cảm xúc" 
          description="Chọn ngày trên Lịch để đánh giá nhanh tâm trạng hàng ngày." 
        />
      ) : (
        <>
          {/* Top Panel: Chart & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart */}
            <div className="lg:col-span-2 bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle]">
              <h3 className="font-semibold text-[--text-primary] mb-4 text-sm flex items-center gap-2">
                <TrendingUp size={16} style={{ color: "var(--accent-primary)" }} />
                Xu hướng cảm xúc
              </h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      formatter={(value: any, name: any, props: any) => [`${value}/5 (${props.payload.mood})`, "Chỉ số"]}
                    />
                    <Line type="monotone" dataKey="Cảm xúc" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle] flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-[--text-primary] mb-4 text-sm">Chỉ số trung bình</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "20px 0" }}>
                  <span style={{ fontSize: "56px", fontWeight: 800, color: "var(--accent-primary)", lineHeight: 1 }}>{avgMood}</span>
                  <span style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)" }}>/ 5</span>
                </div>
                <p className="text-xs text-[--text-secondary]">
                  Dựa trên {moods.length} lượt đánh giá cảm xúc gần đây. Tâm trạng của bạn chủ yếu nằm ở mức <strong>{getMoodLabel(Math.round(parseFloat(avgMood)))}</strong>.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {Object.entries(moodEmojis).map(([score, emoji]) => {
                  const count = moods.filter(m => m.score === parseInt(score)).length;
                  return (
                    <div key={score} style={{ flex: 1, textAlign: "center", padding: "6px", background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "16px" }}>{emoji}</div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginTop: "2px" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Panel: History Logs */}
          <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle]">
            <h3 className="font-semibold text-[--text-primary] mb-4 text-sm">Lịch sử ghi nhận</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {moods.map(entry => (
                <Link to={`/calendar/${entry.entryDate.split('T')[0]}`} key={entry.id} style={{ textDecoration: "none" }}>
                  <div className="bg-[--bg-base] p-4 rounded-md border border-[--border-subtle] hover:border-[--accent-primary] text-center transition-all cursor-pointer">
                    <div className="text-3xl mb-2">{moodEmojis[entry.score] || "😐"}</div>
                    <div className="text-xs text-[--text-muted] mb-1">
                      {new Date(entry.entryDate).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: getMoodColor(entry.score) }}>
                      {getMoodLabel(entry.score)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
