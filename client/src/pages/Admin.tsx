import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Download,
  Gift,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";

type AdminView = "overview" | "orders" | "gifts" | "fulfillment" | "members";

type Order = {
  id: string;
  recipient: string;
  gift: string;
  amount: string;
  status: "待处理" | "配送中" | "已完成";
  channel: string;
  time: string;
};

const orders: Order[] = [
  { id: "LY-260917-0184", recipient: "周女士", gift: "山岚 · 白瓷茶礼", amount: "¥329", status: "待处理", channel: "微信送礼", time: "09:18" },
  { id: "LY-260917-0183", recipient: "顾先生", gift: "静室 · 香氛礼盒", amount: "¥268", status: "配送中", channel: "礼物卡片", time: "08:52" },
  { id: "LY-260917-0182", recipient: "林小姐", gift: "初见 · 可可礼盒", amount: "¥198", status: "已完成", channel: "好友转赠", time: "昨天" },
  { id: "LY-260916-0177", recipient: "陈先生", gift: "山岚 · 白瓷茶礼", amount: "¥329", status: "已完成", channel: "微信送礼", time: "昨天" },
];

const gifts = [
  { name: "山岚 · 白瓷茶礼", category: "雅致生活", price: "¥329", stock: 128, sales: "1,284", status: "在售", image: "/manus-storage/liyu-tea_f1ebb23b.jpg" },
  { name: "静室 · 香氛礼盒", category: "悦己香氛", price: "¥268", stock: 86, sales: "936", status: "在售", image: "/manus-storage/liyu-aroma_6f244e1b.jpg" },
  { name: "初见 · 可可礼盒", category: "甜蜜时分", price: "¥198", stock: 42, sales: "714", status: "库存偏低", image: "/manus-storage/liyu-dessert_b6a694fa.jpg" },
];

function Brand() {
  return <div className="admin-brand"><div className="admin-brand-symbol">礼</div><div><strong>LIYU</strong><small>礼遇 · ADMIN</small></div></div>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "已完成" || status === "在售" ? "success" : status === "配送中" ? "blue" : status === "库存偏低" ? "warning" : "neutral";
  return <span className={`status-badge ${tone}`}><i />{status}</span>;
}

function MetricCard({ icon: Icon, label, value, trend, trendDown, note, color }: { icon: typeof Gift; label: string; value: string; trend: string; trendDown?: boolean; note: string; color: string }) {
  return <div className="metric-card"><div className="metric-top"><span className={`metric-icon ${color}`}><Icon size={17} /></span><span className="metric-note">{note}</span></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className={`metric-trend ${trendDown ? "down" : ""}`}>{trendDown ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {trend} <span>较上月</span></div></div>;
}

function Admin() {
  const [view, setView] = useState<AdminView>("overview");
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => orders.filter((order) => `${order.id}${order.recipient}${order.gift}${order.status}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const title = view === "overview" ? "早上好，林小姐" : view === "orders" ? "订单管理" : view === "gifts" ? "礼物管理" : view === "fulfillment" ? "履约中心" : "会员管理";
  const subtitle = view === "overview" ? "这是礼遇今天的经营摘要。" : view === "orders" ? "查看每一份礼物的流转状态与送达节点。" : view === "gifts" ? "管理礼物、SKU 与库存状态。" : view === "fulfillment" ? "让每一份心意，都按时抵达。" : "管理会员关系与礼赠偏好。";

  const navigate = (next: AdminView) => { setView(next); setShowMobileNav(false); };

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${showMobileNav ? "is-open" : ""}`}>
      <div className="admin-sidebar-top"><Brand /><button className="admin-close" onClick={() => setShowMobileNav(false)}><X size={18} /></button></div>
      <div className="admin-workspace"><div className="workspace-avatar">L</div><div><strong>LIYU 礼遇</strong><span>主工作区</span></div><ChevronDown size={15} /></div>
      <div className="admin-nav-label">工作台</div>
      <nav className="admin-nav">{[
        ["overview", "总览", LayoutDashboard], ["orders", "订单", ClipboardList], ["gifts", "礼物", Gift], ["fulfillment", "履约", PackageCheck], ["members", "会员", Users],
      ].map(([id, label, Icon]) => <button key={id as string} className={view === id ? "active" : ""} onClick={() => navigate(id as AdminView)}><Icon size={17} /><span>{label as string}</span>{id === "orders" && <b>8</b>}{id === "fulfillment" && <b>3</b>}</button>)} </nav>
      <div className="admin-nav-label admin-nav-label-bottom">管理</div>
      <nav className="admin-nav"><button onClick={() => toast("门店管理已预留", { description: "下一步可接入门店与自提核销" })}><Store size={17} /><span>门店</span></button><button onClick={() => toast("财务报表已预留", { description: "可接入对账与结算数据" })}><CircleDollarSign size={17} /><span>财务</span></button><button onClick={() => toast("系统设置已预留")}><Settings size={17} /><span>设置</span></button></nav>
      <div className="admin-sidebar-bottom"><div className="support-card"><ShieldCheck size={18} /><div><strong>隐私保护正常</strong><span>最近审计：今天 09:00</span></div></div><div className="admin-profile"><div className="profile-avatar">林</div><div><strong>林小姐</strong><span>超级管理员</span></div><MoreHorizontal size={17} /></div></div>
    </aside>

    <div className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-trigger" onClick={() => setShowMobileNav(true)}><Menu size={20} /></button><div className="admin-breadcrumb"><span>礼遇后台</span><ChevronRight size={14} /><strong>{view === "overview" ? "总览" : title}</strong></div><div className="admin-top-actions"><div className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索订单、礼物或会员" /></div><button className="admin-icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)}><Bell size={18} /><i /></button><button className="admin-top-avatar" onClick={() => navigate("members")}>林</button>{showNotifications && <div className="notification-popover"><strong>通知中心</strong><p><span className="notification-dot" />有 3 笔订单等待履约</p><p><span className="notification-dot blue-dot" />本周礼赠转化率上涨 12%</p><button onClick={() => setShowNotifications(false)}>全部标记为已读</button></div>}</div></header>
      <main className="admin-content">
        <div className="admin-page-heading"><div><span className="admin-eyebrow">{view === "overview" ? "THURSDAY · SEPTEMBER 17, 2026" : `LIYU ADMIN · ${view.toUpperCase()}`}</span><h1>{title}</h1><p>{subtitle}</p></div><div className="heading-actions"><button className="admin-secondary-button" onClick={() => toast("报表已准备下载", { description: "演示版本已生成本月经营摘要" })}><Download size={15} />导出报表</button>{view === "gifts" && <button className="admin-primary-button" onClick={() => toast.success("新建礼物流程已开启")}> <Gift size={15} />新建礼物</button>}{view === "orders" && <button className="admin-primary-button" onClick={() => toast.success("批量履约已开启")}> <PackageCheck size={15} />批量履约</button>}</div></div>
        {view === "overview" && <Overview onNavigate={navigate} onSelectOrder={setSelectedOrder} />}
        {view === "orders" && <OrdersView orders={filteredOrders} onSelect={setSelectedOrder} />}
        {view === "gifts" && <GiftsView />}
        {view === "fulfillment" && <FulfillmentView onSelect={setSelectedOrder} />}
        {view === "members" && <MembersView />}
      </main>
    </div>
    {selectedOrder && <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}><div className="order-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedOrder(null)}><X size={18} /></button><span className="admin-eyebrow">ORDER DETAIL · {selectedOrder.id}</span><h2>{selectedOrder.gift}</h2><div className="order-modal-meta"><StatusBadge status={selectedOrder.status} /><span>{selectedOrder.time} 创建</span></div><div className="order-detail-grid"><div><span>收礼人</span><strong>{selectedOrder.recipient}</strong></div><div><span>送礼渠道</span><strong>{selectedOrder.channel}</strong></div><div><span>订单金额</span><strong>{selectedOrder.amount}</strong></div><div><span>履约方式</span><strong>配送到家</strong></div></div><div className="order-timeline"><div className="timeline-done"><Check size={13} /><span>订单已创建</span><small>今天 09:18</small></div><div className={selectedOrder.status === "待处理" ? "timeline-current" : "timeline-done"}><PackageCheck size={13} /><span>仓库备货</span><small>{selectedOrder.status === "待处理" ? "等待处理" : "今天 09:22"}</small></div><div><Store size={13} /><span>配送签收</span><small>待完成</small></div></div><button className="admin-primary-button modal-action" onClick={() => { toast.success("订单状态已更新"); setSelectedOrder(null); }}>{selectedOrder.status === "待处理" ? "开始履约" : "查看物流详情"} <ArrowUpRight size={15} /></button></div></div>}
  </div>;
}

function Overview({ onNavigate, onSelectOrder }: { onNavigate: (view: AdminView) => void; onSelectOrder: (order: Order) => void }) {
  return <>
    <section className="metric-grid"><MetricCard icon={CircleDollarSign} label="本月成交额" value="¥ 286,420" trend="18.6%" note="SEP 2026" color="blue" /><MetricCard icon={Gift} label="礼物订单" value="1,284" trend="12.4%" note="累计" color="purple" /><MetricCard icon={Users} label="新增会员" value="568" trend="8.9%" note="本月" color="green" /><MetricCard icon={PackageCheck} label="待履约" value="23" trend="4.2%" trendDown note="实时" color="orange" /></section>
    <section className="dashboard-grid"><div className="dashboard-card revenue-card"><div className="card-heading"><div><span className="card-kicker">REVENUE OVERVIEW</span><h2>经营趋势</h2></div><button className="select-button">最近 30 天 <ChevronDown size={14} /></button></div><div className="revenue-total"><strong>¥ 86,240</strong><span><ArrowUpRight size={13} /> 15.8%</span></div><div className="chart-wrap"><div className="chart-y"><span>30万</span><span>20万</span><span>10万</span><span>0</span></div><svg className="revenue-chart" viewBox="0 0 660 220" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1474db" stopOpacity=".22" /><stop offset="1" stopColor="#1474db" stopOpacity="0" /></linearGradient></defs><path d="M0 190 C48 176 60 150 104 162 S170 142 210 150 S268 106 313 128 S364 98 402 110 S455 62 496 85 S548 50 590 72 S630 42 660 58 L660 220 L0 220 Z" fill="url(#area)" /><path d="M0 190 C48 176 60 150 104 162 S170 142 210 150 S268 106 313 128 S364 98 402 110 S455 62 496 85 S548 50 590 72 S630 42 660 58" fill="none" stroke="#1474db" strokeWidth="3" strokeLinecap="round" /><circle cx="590" cy="72" r="5" fill="#fff" stroke="#1474db" strokeWidth="3" /></svg><div className="chart-x"><span>8/19</span><span>8/26</span><span>9/02</span><span>9/09</span><span>9/16</span></div></div></div><div className="dashboard-card channel-card"><div className="card-heading"><div><span className="card-kicker">GIFTING CHANNELS</span><h2>送礼渠道</h2></div><button className="more-button"><MoreHorizontal size={18} /></button></div><div className="donut-wrap"><div className="donut"><div><strong>1,284</strong><span>总订单</span></div></div><div className="legend"><div><i className="legend-blue" /><span>微信送礼</span><strong>48%</strong></div><div><i className="legend-purple" /><span>礼物卡片</span><strong>31%</strong></div><div><i className="legend-gray" /><span>好友转赠</span><strong>21%</strong></div></div></div></div></section>
    <section className="dashboard-card orders-card"><div className="card-heading"><div><span className="card-kicker">RECENT ORDERS</span><h2>最近订单</h2></div><button className="card-link" onClick={() => onNavigate("orders")}>查看全部 <ArrowUpRight size={14} /></button></div><OrderTable orders={orders.slice(0, 4)} onSelect={onSelectOrder} /></section>
  </>;
}

function OrderTable({ orders, onSelect }: { orders: Order[]; onSelect: (order: Order) => void }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>订单编号</th><th>收礼人</th><th>礼物</th><th>渠道</th><th>金额</th><th>状态</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} onClick={() => onSelect(order)}><td><strong className="order-id">{order.id}</strong><small>{order.time}</small></td><td><div className="recipient-cell"><span>{order.recipient.slice(0, 1)}</span>{order.recipient}</div></td><td>{order.gift}</td><td className="muted-cell">{order.channel}</td><td className="amount-cell">{order.amount}</td><td><StatusBadge status={order.status} /></td><td><ChevronRight size={16} className="row-chevron" /></td></tr>)}</tbody></table></div>;
}

function OrdersView({ orders, onSelect }: { orders: Order[]; onSelect: (order: Order) => void }) {
  return <div className="admin-card-stack"><div className="filter-bar"><div className="filter-tabs"><button className="active">全部订单 <b>1284</b></button><button>待处理 <b>8</b></button><button>配送中 <b>15</b></button><button>已完成</button></div><button className="admin-secondary-button"><Download size={15} />导出 CSV</button></div><div className="dashboard-card orders-card full-card"><OrderTable orders={orders} onSelect={onSelect} /></div></div>;
}

function GiftsView() {
  return <div className="admin-card-stack"><div className="filter-bar"><div className="filter-tabs"><button className="active">全部礼物 <b>24</b></button><button>在售 <b>18</b></button><button>库存偏低 <b>3</b></button><button>已下架</button></div><button className="select-button">分类：全部 <ChevronDown size={14} /></button></div><div className="dashboard-card gifts-card full-card"><div className="admin-table-wrap"><table className="admin-table gifts-table"><thead><tr><th>礼物</th><th>分类</th><th>售价</th><th>库存</th><th>累计售出</th><th>状态</th><th></th></tr></thead><tbody>{gifts.map((gift) => <tr key={gift.name}><td><div className="gift-cell"><img src={gift.image} alt="" /><strong>{gift.name}</strong></div></td><td className="muted-cell">{gift.category}</td><td className="amount-cell">{gift.price}</td><td className={gift.stock < 50 ? "low-stock" : ""}>{gift.stock}</td><td>{gift.sales}</td><td><StatusBadge status={gift.status} /></td><td><button className="table-more" onClick={() => toast("礼物编辑菜单已打开")}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div></div></div>;
}

function FulfillmentView({ onSelect }: { onSelect: (order: Order) => void }) {
  const stages = [{ icon: ClipboardList, title: "待备货", count: "8", tone: "blue" }, { icon: Box, title: "备货中", count: "6", tone: "purple" }, { icon: PackageCheck, title: "配送中", count: "9", tone: "green" }];
  return <div className="admin-card-stack"><div className="fulfillment-stages">{stages.map((stage) => { const Icon = stage.icon; return <div className="stage-card" key={stage.title}><span className={`stage-icon ${stage.tone}`}><Icon size={18} /></span><div><span>{stage.title}</span><strong>{stage.count}</strong></div><ArrowUpRight size={15} /></div>; })}</div><div className="dashboard-card orders-card full-card"><div className="card-heading"><div><span className="card-kicker">TODAY'S FULFILLMENT</span><h2>履约任务</h2></div><span className="live-label"><i />实时更新</span></div><OrderTable orders={orders.filter((order) => order.status !== "已完成")} onSelect={onSelect} /></div></div>;
}

function MembersView() {
  return <div className="admin-card-stack"><div className="member-highlight"><div><span className="card-kicker">MEMBER INSIGHT</span><h2>礼物，让关系持续发生。</h2><p>本月有 72% 的会员完成了第二次送礼，较上月增长 8.6%。</p><button className="admin-primary-button" onClick={() => toast("会员分层报告已准备")} >查看会员分层 <ArrowUpRight size={15} /></button></div><div className="member-orbit"><Users size={25} /><strong>8,492</strong><span>活跃会员</span></div></div><div className="dashboard-card member-table-card full-card"><div className="card-heading"><div><span className="card-kicker">RECENT MEMBERS</span><h2>会员动态</h2></div><button className="card-link" onClick={() => toast("会员列表已打开")}>查看全部 <ArrowUpRight size={14} /></button></div><div className="member-rows">{["林小姐", "周女士", "顾先生", "陈先生"].map((name, i) => <div className="member-row" key={name}><div className={`member-row-avatar tone-${i}`}>{name.slice(0, 1)}</div><div><strong>{name}</strong><span>{i === 0 ? "刚刚完成一次送礼" : `${i + 1} 天前加入礼遇`}</span></div><b>{["¥ 1,284", "¥ 862", "¥ 568", "¥ 329"][i]}</b><ChevronRight size={16} /></div>)}</div></div></div>;
}

export default Admin;
