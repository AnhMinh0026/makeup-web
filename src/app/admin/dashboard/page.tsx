import { getDashboardStats } from '@/lib/dashboard';
import {
  Images,
  Eye,
  HardDrive,
  CalendarDays,
  Star,
  TrendingUp,
} from 'lucide-react';

// CSS injected via a style tag — avoids client-side event handlers on Server Component anchors
const dashboardStyles = `
  .dash-see-all {
    color: rgba(255,255,255,0.35);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .dash-see-all:hover { color: rgba(255,255,255,0.75); }
`;

export const metadata = {
  title: 'Dashboard',
};

// ─── Revalidate every 60s ──────────────────────────────────────────────────────
export const revalidate = 60;

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '1.25rem 1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        flex: 1,
        minWidth: 0,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.65rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: accent ? `${accent}15` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${accent ? `${accent}25` : 'rgba(255,255,255,0.08)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={13} color={accent ?? 'rgba(255,255,255,0.5)'} strokeWidth={1.8} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: '1.7rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            style={{
              color: 'rgba(255,255,255,0.28)',
              fontSize: '0.65rem',
              marginTop: '0.35rem',
              letterSpacing: '0.05em',
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Recent Upload Row ──────────────────────────────────────────────────────────
function RecentRow({
  index,
  title,
  category,
  imageUrl,
  featured,
  createdAt,
}: {
  index: number;
  title: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        padding: '0.7rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Index */}
      <span
        style={{
          color: 'rgba(255,255,255,0.18)',
          fontSize: '0.6rem',
          fontFamily: 'var(--font-geist-mono), monospace',
          width: '18px',
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        {String(index).padStart(2, '0')}
      </span>

      {/* Thumbnail */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '6px',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: '0.78rem',
            fontWeight: 500,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
          {featured && (
            <Star
              size={10}
              style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }}
              color="rgba(251,191,36,0.7)"
              fill="rgba(251,191,36,0.4)"
            />
          )}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          {category}
        </p>
      </div>

      {/* Date */}
      <span
        style={{
          color: 'rgba(255,255,255,0.22)',
          fontSize: '0.6rem',
          fontFamily: 'var(--font-geist-mono), monospace',
          flexShrink: 0,
        }}
      >
        {createdAt}
      </span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const stats = await getDashboardStats();

  // Simulated views count
  const simulatedViews = Math.floor(stats.totalLayouts * 347 + 1280);

  return (
    <div
      style={{
        padding: '2rem 2.25rem',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      {/* ── Page header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <TrendingUp size={14} color="rgba(255,255,255,0.3)" />
          <span
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Tổng quan
          </span>
        </div>
        <h1
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
            fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
          }}
        >
          Dashboard
        </h1>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <StatCard
          icon={Images}
          label="Tổng số ảnh"
          value={stats.totalLayouts}
          sub="layouts trong hệ thống"
          accent="#60a5fa"
        />
        <StatCard
          icon={Eye}
          label="Lượt xem"
          value={simulatedViews.toLocaleString('vi-VN')}
          sub="tổng lượt xem (giả lập)"
          accent="#a78bfa"
        />
        <StatCard
          icon={HardDrive}
          label="Tổng dung lượng"
          value={`${stats.totalFileSizeMB} MB`}
          sub="dung lượng ảnh lưu trữ"
          accent="#34d399"
        />
        <StatCard
          icon={CalendarDays}
          label="Cập nhật gần nhất"
          value={stats.latestUploadDate ?? '—'}
          sub="ngày upload mới nhất"
          accent="#fb923c"
        />
      </div>

      {/* ── Recent Uploads ── */}
      <div
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.25rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <p
              style={{
                color: 'rgba(255,255,255,0.82)',
                fontSize: '0.82rem',
                fontWeight: 600,
                margin: 0,
              }}
            >
              Recent Uploads
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: '0.6rem',
                marginTop: '2px',
                letterSpacing: '0.05em',
              }}
            >
              {stats.recentLayouts.length} ảnh tải lên gần đây nhất
            </p>
          </div>
          <a href="/admin/layouts" className="dash-see-all">
            Xem tất cả →
          </a>
        </div>

        {/* Rows */}
        {stats.recentLayouts.length === 0 ? (
          <p
            style={{
              color: 'rgba(255,255,255,0.18)',
              fontSize: '0.7rem',
              textAlign: 'center',
              padding: '2rem 0',
              letterSpacing: '0.1em',
            }}
          >
            Chưa có ảnh nào được tải lên.
          </p>
        ) : (
          <div>
            {stats.recentLayouts.map((item, i) => (
              <RecentRow
                key={item._id}
                index={i + 1}
                title={item.title}
                category={item.category}
                imageUrl={item.imageUrl}
                featured={item.featured}
                createdAt={item.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
