import { useState, useEffect, useMemo } from 'react'
import './Dashboard.css'

// Backend API adresimiz
const API_URL = 'http://localhost:5000/api/settings'

const TYPES = ['string', 'int', 'double', 'bool']
const emptyForm = { name: '', type: 'string', value: '', applicationName: 'SERVICE-A', isActive: true }

export default function Dashboard() {
  const [settings, setSettings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('ALL')
  const [formData, setFormData] = useState(emptyForm)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState(null)
  
  // EKLENEN KISIM: Sekme Yönetimi State'i
  const [activeTab, setActiveTab] = useState('config') // 'config', 'services', 'history'

  useEffect(() => { fetchSettings() }, [])

  const flash = (message, bad = false) => {
    setToast({ message, bad })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchSettings = async () => {
    try {
      setError(null)
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('İstek başarısız')
      const data = await res.json()
      setSettings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("API'ye bağlanılamadı", err)
      setError("Storage'a bağlanılamadı. Backend (localhost:5000) çalışıyor mu kontrol edin.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Kayıt eklenemedi')
      setFormData(emptyForm)
      setShowAdd(false)
      await fetchSettings()
      flash(`"${formData.name}" eklendi`)
    } catch (err) {
      console.error(err)
      flash('Kayıt eklenemedi', true)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (setting) => {
    const updated = { ...setting, isActive: !setting.isActive }
    // iyimser güncelleme — anında geri bildirim
    setSettings(prev => prev.map(s => (s.id === setting.id ? updated : s)))
    try {
      const res = await fetch(`${API_URL}/${setting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (!res.ok) throw new Error()
    } catch {
      // hata olursa eski haline döndür
      setSettings(prev => prev.map(s => (s.id === setting.id ? setting : s)))
      flash('Durum güncellenemedi', true)
    }
  }

  const services = useMemo(
    () => [...new Set(settings.map(s => s.applicationName).filter(Boolean))],
    [settings]
  )

  const filteredSettings = useMemo(() => settings.filter(s => {
    const byName = s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const bySvc = serviceFilter === 'ALL' || s.applicationName === serviceFilter
    return byName && bySvc
  }), [settings, searchTerm, serviceFilter])

  const activeCount = settings.filter(s => s.isActive).length

  // bool tipinde değer girişini akıllı hale getir
  const onTypeChange = (type) => {
    setFormData(f => ({ ...f, type, value: type === 'bool' ? '1' : '' }))
  }

  return (
    <div className="scl-config">
      {/* ---------- Sidebar ---------- */}
      <aside className="scl-side">
        <div className="scl-brand">
          <span className="scl-mark">Seçil</span>
          <span className="scl-coin">soty</span>
        </div>

        <nav className="scl-nav">
          <div className="scl-eyebrow">Yönetim</div>
          <a 
            href="#" 
            className={activeTab === 'config' ? 'is-active' : ''} 
            onClick={(e) => { e.preventDefault(); setActiveTab('config'); }}
          >
            <span className="scl-dot" />Konfigürasyonlar
          </a>
          <a 
            href="#" 
            className={activeTab === 'services' ? 'is-active' : ''} 
            onClick={(e) => { e.preventDefault(); setActiveTab('services'); }}
          >
            <span className="scl-dot" />Servisler
          </a>
          <a 
            href="#" 
            className={activeTab === 'history' ? 'is-active' : ''} 
            onClick={(e) => { e.preventDefault(); setActiveTab('history'); }}
          >
            <span className="scl-dot" />Geçmiş
          </a>
        </nav>

        <div className="scl-side-foot">
          <div className="scl-svc-card">
            <div className="sub">{services.length} servis · {settings.length} kayıt</div>
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="scl-main">
        <header className="scl-head">
          <div>
            <div className="scl-kicker">Dinamik Konfigürasyon</div>
            <h1>Konfigürasyon <b>Konsolu</b></h1>
          </div>
          <span className="scl-live"><span className="pulse" />LIVE </span>
        </header>

        {/* SEKME 1: KONFİGÜRASYON (ANA İŞLEV) */}
        {activeTab === 'config' && (
          <>
            <section className="scl-stats">
              <div className="scl-stat">
                <div className="num">{settings.length}</div>
                <div className="cap">Toplam kayıt</div>
              </div>
              <div className="scl-stat ok">
                <div className="num">{activeCount}</div>
                <div className="cap">Aktif</div>
              </div>
              <div className="scl-stat">
                <div className="num">{settings.length - activeCount}</div>
                <div className="cap">Pasif</div>
              </div>
              <div className="scl-stat ruby">
                <div className="num">{services.length}</div>
                <div className="cap">Servis</div>
              </div>
            </section>

            <div className="scl-toolbar">
              <div className="scl-search">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="İsme göre filtrele…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select className="scl-select" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
                <option value="ALL">Tüm servisler</option>
                {services.map(svc => <option key={svc} value={svc}>{svc}</option>)}
              </select>

              <button className="scl-btn" onClick={() => setShowAdd(v => !v)}>
                <span className="plus">+</span> Yeni konfigürasyon
              </button>
            </div>

            {showAdd && (
              <form className="scl-add" onSubmit={handleAdd}>
                <h3>Yeni konfigürasyon ekle</h3>
                <p className="hint">Eklenen kayıt, ilgili servisin bir sonraki yenileme döngüsünde otomatik okunur.</p>
                <div className="scl-fields">
                  <div className="scl-field">
                    <label>Name</label>
                    <input type="text" placeholder="örn: SiteName" value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="scl-field">
                    <label>Type</label>
                    <select value={formData.type} onChange={e => onTypeChange(e.target.value)}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="scl-field">
                    <label>Value</label>
                    {formData.type === 'bool' ? (
                      <select value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}>
                        <option value="1">true (1)</option>
                        <option value="0">false (0)</option>
                      </select>
                    ) : (
                      <input type="text" placeholder="örn: soty.io" value={formData.value}
                        onChange={e => setFormData({ ...formData, value: e.target.value })} required />
                    )}
                  </div>
                  <div className="scl-field">
                    <label>App Name</label>
                    <input type="text" placeholder="örn: SERVICE-A" value={formData.applicationName}
                      onChange={e => setFormData({ ...formData, applicationName: e.target.value })} required />
                  </div>
                </div>
                <div className="scl-add-actions">
                  <button type="button" className="scl-btn ghost" onClick={() => setShowAdd(false)}>Vazgeç</button>
                  <button type="submit" className="scl-btn" disabled={submitting}>
                    {submitting ? 'Ekleniyor…' : 'Kaydet'}
                  </button>
                </div>
              </form>
            )}

            <div className="scl-card">
              <div className="scl-card-top">
                <span className="title">Konfigürasyon kayıtları</span>
                <span className="count">{filteredSettings.length} / {settings.length} gösteriliyor</span>
              </div>

              {loading ? (
                <div className="scl-state"><div className="scl-spinner" /><h4>Yükleniyor</h4><p>Storage'dan kayıtlar getiriliyor…</p></div>
              ) : error ? (
                <div className="scl-state err">
                  <div className="ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
                  </div>
                  <h4>Bağlantı kurulamadı</h4>
                  <p>{error}</p>
                </div>
              ) : filteredSettings.length === 0 ? (
                <div className="scl-state">
                  <div className="ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </div>
                  <h4>{settings.length === 0 ? 'Henüz kayıt yok' : 'Eşleşen kayıt yok'}</h4>
                  <p>{settings.length === 0 ? 'İlk konfigürasyonu eklemek için “Yeni konfigürasyon”a dokunun.' : 'Arama veya servis filtresini değiştirmeyi deneyin.'}</p>
                </div>
              ) : (
                <table className="scl-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Type</th><th>Value</th><th>App Name</th><th>Durum</th><th style={{ textAlign: 'right' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettings.map(s => (
                      <tr key={s.id}>
                        <td data-label="Name"><span className="scl-name">{s.name}</span></td>
                        <td data-label="Type">
                          <span className={`scl-type t-${(s.type || '').toLowerCase()}`}><span className="tdot" />{s.type}</span>
                        </td>
                        <td data-label="Value"><span className="scl-val">{String(s.value)}</span></td>
                        <td data-label="App Name"><span className="scl-app">{s.applicationName}</span></td>
                        <td data-label="Durum">
                          <span className={`scl-pill ${s.isActive ? 'on' : 'off'}`}>
                            <span className="sd" />{s.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td data-label="İşlem" style={{ textAlign: 'right' }}>
                          <button
                            className={`scl-switch ${s.isActive ? 'on' : ''}`}
                            onClick={() => toggleActive(s)}
                            role="switch"
                            aria-checked={s.isActive}
                            aria-label={`${s.name} durumunu değiştir`}
                          >
                            <span className="knob" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* SEKME 2: SERVİSLER (YAPIM AŞAMASINDA) */}
        {activeTab === 'services' && (
          <div className="scl-card" style={{ marginTop: '20px' }}>
             <div className="scl-state">
                <div className="ico">🚀</div>
                <h4>Servis Yönetimi</h4>
                <p>Bu modül, mikroservislerin durumunu ve sağlık kontrollerini (Health Check) izlemek için <strong>Faz-2</strong> kapsamında devreye alınacaktır.</p>
             </div>
          </div>
        )}

        {/* SEKME 3: GEÇMİŞ (YAPIM AŞAMASINDA) */}
        {activeTab === 'history' && (
          <div className="scl-card" style={{ marginTop: '20px' }}>
             <div className="scl-state">
                <div className="ico">⏳</div>
                <h4>İşlem Geçmişi ve Loglar</h4>
                <p>Konfigürasyonlarda yapılan değişikliklerin detaylı log kayıtları <strong>Faz-2</strong> kapsamında buraya eklenecektir.</p>
             </div>
          </div>
        )}

      </main>

      {toast && (
        <div className={`scl-toast ${toast.bad ? 'bad' : ''}`}>
          <span className="tk" />{toast.message}
        </div>
      )}
    </div>
  )
}