import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Menu,
  Package,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";

type Product = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  category: string;
  image: string;
  accent: string;
  label?: string;
  tags: string[];
};

const image = {
  hero: "/manus-storage/liyu-hero_fa203cab.jpg",
  tea: "/manus-storage/liyu-tea_f1ebb23b.jpg",
  aroma: "/manus-storage/liyu-aroma_6f244e1b.jpg",
  dessert: "/manus-storage/liyu-dessert_b6a694fa.jpg",
};

const products: Product[] = [
  {
    id: "tea",
    title: "山岚 · 白瓷茶礼",
    subtitle: "一盏清茶，留住从容时刻",
    price: "¥ 329",
    category: "雅致生活",
    image: image.tea,
    accent: "#e6eef7",
    label: "编辑推荐",
    tags: ["新中式", "日常心意"],
  },
  {
    id: "aroma",
    title: "静室 · 香氛礼盒",
    subtitle: "让空间，先替你说声谢谢",
    price: "¥ 268",
    category: "悦己香氛",
    image: image.aroma,
    accent: "#f2ece6",
    label: "人气之选",
    tags: ["留香 8h", "可刻字"],
  },
  {
    id: "dessert",
    title: "初见 · 可可礼盒",
    subtitle: "分享一点甜，关系就近一点",
    price: "¥ 198",
    category: "甜蜜时分",
    image: image.dessert,
    accent: "#e9edf2",
    label: "限量礼序",
    tags: ["手工制作", "低糖配方"],
  },
];

const categories = ["全部礼物", "雅致生活", "悦己香氛", "甜蜜时分"];

function AppMark() {
  return (
    <div className="brand-mark" aria-label="礼遇 LIYU">
      <div className="brand-symbol">礼</div>
      <div>
        <div className="brand-name">LIYU</div>
        <div className="brand-caption">礼遇 · PRESENTS</div>
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <button className="product-card" onClick={() => onOpen(product)} aria-label={`查看${product.title}`}>
      <div className="product-image-wrap" style={{ background: product.accent }}>
        <img src={product.image} alt={product.title} className="product-image" />
        {product.label && <span className="product-label">{product.label}</span>}
        <button
          className={`like-button ${liked ? "is-liked" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            setLiked(!liked);
          }}
          aria-label={liked ? "取消收藏" : "收藏"}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>
        <span className="image-arrow"><ArrowUpRight size={16} /></span>
      </div>
      <div className="product-copy">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="product-price">{product.price}</span>
        </div>
        <h3>{product.title}</h3>
        <p>{product.subtitle}</p>
        <div className="tag-row">
          {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </button>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("全部礼物");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "全部礼物" || product.category === activeCategory;
      const searchMatch = !search || `${product.title}${product.subtitle}${product.category}`.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  const goToGifts = () => {
    setActiveTab("gifts");
    window.setTimeout(() => document.getElementById("gift-library")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  const notifySoon = (message: string) => toast(message, { description: "在正式小程序中将进入对应流程" });

  return (
    <div className="app-shell">
      <header className={`topbar ${hasScrolled ? "is-scrolled" : ""}`}>
        <div className="topbar-inner">
          <button className="brand-button" onClick={() => setActiveTab("home")}><AppMark /></button>
          <nav className="topnav" aria-label="主导航">
            {[{ id: "home", label: "选礼" }, { id: "gifts", label: "礼物库" }, { id: "mine", label: "我的" }].map((item) => (
              <button key={item.id} className={`topnav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>{item.label}</button>
            ))}
          </nav>
          <div className="top-actions">
            <button className="icon-button search-trigger" onClick={() => setShowSearch(!showSearch)} aria-label="搜索"><Search size={18} /></button>
            <button className="desktop-user" onClick={() => setActiveTab("mine")}><span className="avatar">L</span><span>LIYU 会员</span><ChevronDown size={15} /></button>
            <button className="menu-button" onClick={() => notifySoon("菜单面板已预留")} aria-label="打开菜单"><Menu size={20} /></button>
          </div>
        </div>
        {showSearch && <div className="search-panel"><Search size={17} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索礼物、场景或心意" /><button onClick={() => { setSearch(""); setShowSearch(false); }}><X size={16} /></button></div>}
      </header>

      {activeTab === "home" && (
        <main>
          <section className="hero-section section-wrap">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" />THE ART OF GIVING · 2026</span>
              <h1>把想说的话，<br /><em>交给一份好礼。</em></h1>
              <p>礼遇挑选每一件物品的触感、气味与分寸。让表达不止于到达，而是被好好记住。</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={goToGifts}>开始选礼 <ArrowRight size={17} /></button>
                <button className="text-button" onClick={() => document.getElementById("giving-guide")?.scrollIntoView({ behavior: "smooth" })}>了解礼遇 <ArrowDownIcon /></button>
              </div>
              <div className="hero-proof"><div className="proof-avatars"><span>安</span><span>林</span><span>陈</span></div><div><strong>12,800+</strong><small>份心意，正在被送达</small></div></div>
            </div>
            <div className="hero-visual">
              <img src={image.hero} alt="白色丝带礼盒" />
              <div className="hero-note"><Sparkles size={15} /><span>今日编辑推荐</span><strong>一份温柔的开场</strong><small>轻触礼盒，开始选礼</small></div>
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
            </div>
          </section>

          <section className="value-strip section-wrap" id="giving-guide">
            <div className="section-kicker"><span>01</span><span>WHY LIYU</span></div>
            <div className="value-grid">
              <div className="value-intro"><h2>让送礼<br /><span>成为一件轻松的事。</span></h2><p>从挑选，到写下那句祝福，再到收礼人的惊喜，我们把每一步都做得恰到好处。</p></div>
              {[{ icon: Package, title: "精心选物", text: "只留下值得被长期使用的好东西。" }, { icon: Send, title: "一键送达", text: "选择场景，礼物和祝福一起抵达。" }, { icon: Leaf, title: "可持续心意", text: "克制包装，也不克制你的表达。" }].map((item) => { const Icon = item.icon; return <div className="value-item" key={item.title}><div className="value-icon"><Icon size={18} /></div><h3>{item.title}</h3><p>{item.text}</p><ArrowUpRight size={15} className="value-arrow" /></div>; })}
            </div>
          </section>

          <section className="featured-section section-wrap">
            <div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>今天，送什么？</h2></div><button className="outline-button" onClick={goToGifts}>浏览全部 <ArrowRight size={16} /></button></div>
            <div className="featured-grid">
              <button className="feature-story" onClick={() => setSelectedProduct(products[0])}><div className="feature-story-image"><img src={image.tea} alt="白瓷茶礼" /></div><div className="feature-story-copy"><span>编辑精选 · 01</span><h3>一盏清茶，<br />留住从容时刻。</h3><p>送给喜欢把日子过得有滋有味的人。</p><span className="story-link">查看这份心意 <ArrowUpRight size={15} /></span></div></button>
              <div className="mini-products">{products.slice(1).map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />)}</div>
            </div>
          </section>

          <section className="occasion-section section-wrap">
            <div className="occasion-backdrop" />
            <div className="section-kicker light"><span>02</span><span>THE OCCASION</span></div>
            <div className="occasion-content"><div><span className="eyebrow light-eyebrow">SEND A LITTLE MORE</span><h2>礼物不只是一件东西，<br /><em>是你对关系的注解。</em></h2></div><div className="occasion-list">{["送给重要的人", "给自己一点奖励", "一份刚刚好的感谢"].map((label, index) => <button key={label} onClick={() => notifySoon(label)}><span>0{index + 1}</span><strong>{label}</strong><ArrowUpRight size={17} /></button>)}</div></div>
          </section>
        </main>
      )}

      {activeTab === "gifts" && (
        <main className="library-page section-wrap" id="gift-library">
          <div className="library-heading"><div><span className="eyebrow">THE GIFT LIBRARY</span><h1>为每一种关系，<br /><em>找到合适的分寸。</em></h1></div><p>不急着决定。先从对方的生活开始想起，我们替你把心意整理成一份份可被打开的答案。</p></div>
          <div className="category-row">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
          <div className="library-toolbar"><span>{visibleProducts.length} 件礼物</span><button onClick={() => notifySoon("筛选功能即将开放")}>推荐排序 <ChevronDown size={15} /></button></div>
          <div className="library-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />)}</div>
          {visibleProducts.length === 0 && <div className="empty-state"><Search size={22} /><h3>还没有找到这份心意</h3><p>试试换一个关键词，或看看全部礼物。</p><button className="outline-button" onClick={() => { setSearch(""); setActiveCategory("全部礼物"); }}>重置筛选</button></div>}
        </main>
      )}

      {activeTab === "mine" && (
        <main className="mine-page section-wrap"><div className="mine-card"><div className="mine-head"><div className="mine-avatar">L</div><div><span className="eyebrow">LIYU MEMBER</span><h1>你好，<em>林小姐。</em></h1><p>愿每一份礼物，都替你把话说得更好。</p></div><button className="icon-button" onClick={() => notifySoon("会员设置已预留")}><ChevronRight size={18} /></button></div><div className="mine-stats"><div><strong>06</strong><span>送出的礼物</span></div><div><strong>03</strong><span>收藏的心意</span></div><div><strong>02</strong><span>收到的礼物</span></div></div><div className="mine-links">{[{ icon: Package, title: "礼物记录", text: "查看送出与收到的每一份心意" }, { icon: Heart, title: "我的收藏", text: "把喜欢留给下一次恰到好处" }, { icon: Star, title: "专属礼单", text: "根据你的偏好，持续为你挑选" }].map((item) => { const Icon = item.icon; return <button key={item.title} onClick={() => notifySoon(item.title)}><span className="mine-link-icon"><Icon size={18} /></span><span><strong>{item.title}</strong><small>{item.text}</small></span><ChevronRight size={16} /></button>; })}</div></div></main>
      )}

      <footer className="bottom-nav"><button className={activeTab === "home" ? "active" : ""} onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><span className="bottom-nav-icon"><Sparkles size={18} /></span><span>选礼</span></button><button className={activeTab === "gifts" ? "active" : ""} onClick={goToGifts}><span className="bottom-nav-icon"><Plus size={18} /></span><span>礼物库</span></button><button className={activeTab === "mine" ? "active" : ""} onClick={() => setActiveTab("mine")}><span className="bottom-nav-icon"><UserRound size={18} /></span><span>我的</span></button></footer>

      {selectedProduct && <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}><div className="product-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" onClick={() => setSelectedProduct(null)}><X size={18} /></button><div className="sheet-image"><img src={selectedProduct.image} alt={selectedProduct.title} /></div><div className="sheet-copy"><span className="eyebrow">{selectedProduct.category} · {selectedProduct.label}</span><h2>{selectedProduct.title}</h2><p className="sheet-subtitle">{selectedProduct.subtitle}</p><div className="sheet-divider" /><p className="sheet-description">一份经过认真挑选的礼物，适合被放进每一种不必隆重、但值得被记住的时刻。支持附上 80 字以内手写感祝福卡。</p><div className="sheet-info"><span>预计 2–3 日送达</span><span>精美礼盒包装</span></div><div className="sheet-bottom"><strong>{selectedProduct.price}</strong><button className="primary-button" onClick={() => { toast.success("已加入礼物清单", { description: "下一步可以为它写下祝福" }); setSelectedProduct(null); }}>选这份礼物 <ArrowRight size={16} /></button></div></div></div></div>}
    </div>
  );
}

function ArrowDownIcon() {
  return <ChevronRight size={16} className="rotate-90" />;
}

export default Home;
