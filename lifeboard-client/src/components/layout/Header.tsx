import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

interface HeaderProps { title: string; }

const formatDate = () => {
  const now = new Date();
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return `${day}, ${date} tháng ${month}, ${year}`;
};

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: "var(--header-height)",
        position: "fixed",
        left: "var(--sidebar-width)",
        right: 0,
        top: 0,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-6)",
        zIndex: 40,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Title + Date */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
        <h1
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          {title}
        </h1>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          {formatDate()}
        </span>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {/* Search bar */}
        <button
          onClick={() => navigate("/search")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "0 var(--space-3)",
            height: 36,
            borderRadius: "var(--radius-md)",
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            cursor: "pointer",
            minWidth: 200,
            transition: "border-color 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
          }}
        >
          <Search size={13} />
          <span>Tìm kiếm...</span>
          <kbd
            style={{
              marginLeft: "auto",
              padding: "2px 6px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-sm)",
              fontSize: 10,
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            Ctrl K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title="Đổi giao diện"
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-overlay)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-primary)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
