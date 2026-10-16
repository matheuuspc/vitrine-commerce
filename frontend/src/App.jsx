import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronDown, CreditCard, Headphones, Heart, LockKeyhole, Menu, PackageCheck, Search, ShieldCheck, ShoppingCart, Sparkles, Star, Truck, UserRound, X, Minus, Plus, Trash2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const demoProducts = [
  { id: 1, name: 'Fone de Ouvido Bluetooth com Cancelamento de Ruído', category: 'Áudio', price: 299.90, stock: 12, rating: 4.8, reviews: 342, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', badge: 'Mais vendido' },
  { id: 2, name: 'Smartwatch Esportivo com GPS e Monitor de Saúde', category: 'Wearables', price: 499.90, stock: 8, rating: 4.7, reviews: 287, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85', badge: 'Novo' },
  { id: 3, name: 'Teclado Mecânico Gamer RGB Switch Azul', category: 'Acessórios', price: 349.90, stock: 5, rating: 4.9, reviews: 421, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85', badge: '' },
  { id: 4, name: 'Caixa de Som Portátil Bluetooth 30W', category: 'Áudio', price: 269.90, stock: 12, rating: 4.6, reviews: 208, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85', badge: '' },
  { id: 5, name: 'Câmera Instantânea com Impressão Colorida', category: 'Fotografia', price: 589.90, stock: 7, rating: 4.8, reviews: 156, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85', badge: 'Destaque' },
  { id: 6, name: 'Mouse Sem Fio Ergonômico de Alta Precisão', category: 'Acessórios', price: 189.90, stock: 18, rating: 4.5, reviews: 193, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85', badge: '' },
  { id: 7, name: 'Fone Bluetooth Compacto com Estojo', category: 'Áudio', price: 229.90, stock: 0, rating: 4.6, reviews: 124, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85', badge: 'Esgotado' },
  { id: 8, name: 'Relógio Inteligente Minimalista', category: 'Wearables', price: 399.90, stock: 9, rating: 4.7, reviews: 176, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=900&q=85', badge: '' },
]
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function App() {
  const [products, setProducts] = useState(demoProducts)
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { fetch(`${API}/products`).then(r => r.ok ? r.json() : Promise.reject()).then(setProducts).catch(() => {}) }, [])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2800); return () => clearTimeout(timer) }, [notice])
  const categories = ['Todos', ...new Set(products.map(p => p.category))]
  const shown = useMemo(() => products.filter(p => (category === 'Todos' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [products, category, query])
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  function add(product) {
    if (product.stock < 1) return
    setCart(current => {
      const found = current.find(item => item.product.id === product.id)
      if (found) {
        if (found.quantity >= product.stock) { setNotice('Você já adicionou todo o estoque disponível.'); return current }
        return current.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...current, { product, quantity: 1 }]
    })
    setNotice('Produto adicionado ao carrinho')
  }
  function setQuantity(id, next) {
    const item = cart.find(line => line.product.id === id)
    if (!item) return
    if (next < 1) { setCart(cart.filter(line => line.product.id !== id)); return }
    if (next > item.product.stock) { setNotice(`Temos apenas ${item.product.stock} unidade(s) deste produto.`); return }
    setCart(cart.map(line => line.product.id === id ? { ...line, quantity: next } : line))
  }
  async function placeOrder(event) {
    event.preventDefault()
    if (!cart.length) return
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const payload = { customerName: form.get('name'), customerEmail: form.get('email'), items: cart.map(line => ({ productId: line.product.id, quantity: line.quantity })) }
    try {
      const response = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || 'Não foi possível concluir o pedido. Tente novamente.') }
      const created = await response.json()
      setOrder({ ...created, customerName: payload.customerName, total: created.total ?? subtotal, status: created.status ?? 'CONFIRMED' })
    } catch (error) {
      if (error instanceof TypeError) {
        setOrder({ id: `DEMO-${Date.now().toString().slice(-6)}`, customerName: payload.customerName, total: subtotal, status: 'CONFIRMED', demo: true })
      } else setNotice(error.message)
    } finally { setLoading(false) }
  }
  function finishOrder() {
    setCart([]); setCheckoutOpen(false); setCartOpen(false); setOrder(null)
    fetch(`${API}/products`).then(r => r.ok ? r.json() : null).then(data => data && setProducts(data)).catch(() => {})
  }

  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner">
      <button className="icon-btn mobile-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22}/></button>
      <a className="brand" href="#inicio" aria-label="Vitrine início">VITRINE<span>.</span></a>
      <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'}><a className="active" href="#inicio" onClick={() => setMenuOpen(false)}>Início</a><a href="#produtos" onClick={() => setMenuOpen(false)}>Produtos</a><a href="#ofertas" onClick={() => setMenuOpen(false)}>Ofertas</a></nav>
      <label className="search-box"><Search size={19}/><input placeholder="O que você procura?" value={query} onChange={e => { setQuery(e.target.value); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }) }}/><kbd>⌘ K</kbd></label>
      <div className="header-actions"><button className="icon-btn account" aria-label="Minha conta"><UserRound size={21}/></button><button className="cart-trigger" aria-label="Abrir carrinho" onClick={() => setCartOpen(true)}><ShoppingCart size={21}/><span>Carrinho</span><b>{count}</b></button></div>
    </div></header>
    <main>
      <section className="hero" id="inicio"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> MAIS TECNOLOGIA PARA O SEU DIA</div><h1>Tecnologia que<br/> acompanha você<span>.</span></h1><p>Qualidade, desempenho e estilo em um só lugar. Descubra os melhores produtos para facilitar a sua rotina.</p><a className="primary-btn hero-cta" href="#produtos">Explorar produtos <ArrowRight size={19}/></a><div className="benefits"><div><Truck/><span>Entrega para<br/><b>todo o Brasil</b></span></div><div><ShieldCheck/><span>Compra segura<br/><b>e garantida</b></span></div><div><CreditCard/><span>Até 12x<br/><b>sem juros</b></span></div></div></div><div className="hero-visual"><div className="hero-glow"/><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1300&q=90" alt="Fone de ouvido premium"/><div className="hero-float"><div className="float-icon"><Headphones size={19}/></div><div><b>Som que inspira</b><small>Seu próximo favorito está aqui</small></div><ArrowRight size={17}/></div><div className="hero-index">01 <span>/ 03</span></div></div></section>
      <section className="trust-strip"><div><PackageCheck/><span><b>Envio rápido</b><small>para todo o Brasil</small></span></div><div><ShieldCheck/><span><b>Compra protegida</b><small>seus dados seguros</small></span></div><div><CreditCard/><span><b>Parcele em até 12x</b><small>com tranquilidade</small></span></div><div><Headphones/><span><b>Estamos por perto</b><small>suporte de verdade</small></span></div></section>
      <section className="catalog-section" id="produtos"><div className="section-heading"><div><div className="eyebrow">ESCOLHAS PARA VOCÊ</div><h2>Destaques da semana<span>.</span></h2><p>Peças que combinam tecnologia, design e praticidade.</p></div><a className="text-link" href="#produtos">Ver todos <ArrowRight size={17}/></a></div>
        <div className="category-row">{categories.map(item => <button key={item} className={category === item ? 'category-chip selected' : 'category-chip'} onClick={() => setCategory(item)}>{item}</button>)}<button className="sort-button">Mais populares <ChevronDown size={16}/></button></div>
        <div className="product-grid">{shown.map((product, index) => <article className="product-card" key={product.id}><div className="product-photo"><img src={product.image} alt={product.name} loading={index > 3 ? 'lazy' : 'eager'}/>{product.badge && <span className={product.stock === 0 ? 'product-badge sold-out' : 'product-badge'}>{product.badge}</span>}<button className="favorite-btn" aria-label="Adicionar aos favoritos"><Heart size={18}/></button></div><div className="product-info"><span className="product-category">{product.category}</span><h3>{product.name}</h3><div className="rating"><span className="stars">★★★★★</span><span>{product.rating?.toFixed(1)} <i>({product.reviews})</i></span></div><div className="price">{money(product.price)}</div><div className={product.stock === 0 ? 'stock out' : product.stock < 5 ? 'stock low' : 'stock'}><span/>{product.stock === 0 ? 'Avise-me quando voltar' : product.stock < 5 ? `Últimas ${product.stock} unidades` : `Em estoque · ${product.stock} unidades`}</div><button className="add-btn" disabled={product.stock === 0} onClick={() => add(product)}><ShoppingCart size={17}/>{product.stock === 0 ? 'Indisponível' : 'Adicionar ao carrinho'}</button></div></article>)}</div>
        {!shown.length && <div className="empty-results"><Search size={30}/><h3>Nenhum produto encontrado</h3><p>Tente buscar outro termo ou escolha uma categoria diferente.</p><button onClick={() => {setQuery(''); setCategory('Todos')}}>Limpar busca</button></div>}
      </section>
      <section className="newsletter" id="ofertas"><div className="newsletter-icon"><Sparkles/></div><div><span className="eyebrow">BOAS NOVIDADES, SEM SPAM</span><h2>Seu próximo favorito<br/>pode estar a um e-mail.</h2><p>Receba lançamentos e ofertas especiais em primeira mão.</p></div><form onSubmit={e => {e.preventDefault(); setNotice('Pronto! Você entrou para a lista de novidades.') }}><input type="email" placeholder="Seu melhor e-mail" required/><button className="primary-btn">Quero receber <ArrowRight size={17}/></button><small>Ao se cadastrar, você concorda com nossa política de privacidade.</small></form></section>
    </main>
    <footer><a className="brand" href="#inicio">VITRINE<span>.</span></a><p>Tecnologia para acompanhar você.</p><span>© 2026 Vitrine. Feito com cuidado.</span></footer>
    {notice && <div className="toast"><Check size={17}/>{notice}</div>}
    {cartOpen && <><button className="scrim" aria-label="Fechar carrinho" onClick={() => setCartOpen(false)}/><aside className="cart-drawer"><div className="drawer-head"><div><h2>Seu carrinho</h2><p>{count} {count === 1 ? 'produto' : 'produtos'}</p></div><button className="icon-btn" aria-label="Fechar" onClick={() => setCartOpen(false)}><X/></button></div>{cart.length ? <><div className="cart-lines">{cart.map(line => <div className="cart-line" key={line.product.id}><img src={line.product.image} alt=""/><div className="line-details"><h3>{line.product.name}</h3><b>{money(line.product.price)}</b><div className="quantity"><button aria-label="Diminuir" onClick={() => setQuantity(line.product.id, line.quantity - 1)}><Minus size={14}/></button><span>{line.quantity}</span><button aria-label="Aumentar" onClick={() => setQuantity(line.product.id, line.quantity + 1)}><Plus size={14}/></button></div></div><button className="remove-btn" aria-label="Remover produto" onClick={() => setQuantity(line.product.id, 0)}><Trash2 size={17}/></button></div>)}</div><div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><b>{money(subtotal)}</b></div><p>Frete e impostos calculados na finalização.</p><button className="primary-btn checkout-btn" onClick={() => {setCartOpen(false); setCheckoutOpen(true)}}><LockKeyhole size={17}/> Finalizar pedido <ArrowRight size={18}/></button><div className="drawer-perks"><div><Truck/><span><b>Entrega para todo o Brasil</b><small>Receba no conforto da sua casa</small></span></div><div><ShieldCheck/><span><b>Compra segura</b><small>Seus dados protegidos</small></span></div><div><CreditCard/><span><b>Até 12x sem juros</b><small>Parcele suas compras com tranquilidade</small></span></div></div></div></> : <div className="empty-cart"><div className="empty-cart-icon"><ShoppingCart/></div><h3>Seu carrinho está vazio</h3><p>Tem tanta coisa boa esperando por você.</p><button className="primary-btn" onClick={() => setCartOpen(false)}>Explorar produtos <ArrowRight size={17}/></button></div>}</aside></>}
    {checkoutOpen && <><button className="scrim" aria-label="Fechar finalização" onClick={() => setCheckoutOpen(false)}/><div className="checkout-modal"><button className="icon-btn modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Fechar"><X/></button>{order ? <div className="success-state"><div className="success-icon"><Check/></div><span className="eyebrow">PEDIDO CONFIRMADO</span><h2>Obrigado, {order.customerName.split(' ')[0]}!</h2><p>Seu pedido <b>#{order.id}</b> foi recebido. Você receberá atualizações por e-mail.</p><div className="order-summary"><span>Total do pedido</span><b>{money(order.total)}</b></div>{order.demo && <small className="demo-note">Modo demonstração: conecte a API para registrar o pedido.</small>}<button className="primary-btn" onClick={finishOrder}>Continuar comprando <ArrowRight size={17}/></button></div> : <><div className="checkout-title"><span className="eyebrow">SÓ MAIS UM PASSO</span><h2>Finalizar pedido</h2><p>Preencha seus dados para confirmar a compra.</p></div><form className="checkout-form" onSubmit={placeOrder}><label>Nome completo<input name="name" autoComplete="name" placeholder="Como podemos te chamar?" required minLength="2"/></label><label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@email.com" required/></label><div className="checkout-total"><span>{count} {count === 1 ? 'produto' : 'produtos'}</span><b>{money(subtotal)}</b></div><button className="primary-btn checkout-submit" disabled={loading}>{loading ? 'Confirmando…' : <><LockKeyhole size={17}/> Confirmar pedido <ArrowRight size={17}/></>}</button><small className="secure-note"><ShieldCheck size={14}/> Seus dados são tratados com segurança.</small></form></>}</div></>}
  </div>
}
