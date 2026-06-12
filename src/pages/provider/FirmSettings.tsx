import { useRef, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { clsx } from 'clsx'
import { CATEGORIES } from '../../data/mock'
import type { ProviderWithServices } from '../../lib/api'
import {
  updateProvider, createService, updateService, deleteService,
  createAddon, deleteAddon, uploadProviderImage,
} from '../../lib/api'
import type { ServiceCategory, WorkingHours } from '../../lib/database.types'

const DAYS: { key: keyof WorkingHours; label: string }[] = [
  { key: 'mon', label: 'Poniedziałek' },
  { key: 'tue', label: 'Wtorek' },
  { key: 'wed', label: 'Środa' },
  { key: 'thu', label: 'Czwartek' },
  { key: 'fri', label: 'Piątek' },
  { key: 'sat', label: 'Sobota' },
  { key: 'sun', label: 'Niedziela' },
]

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800 text-sm'

export function FirmSettings({ provider, onSaved }: { provider: ProviderWithServices; onSaved: () => void }) {
  const toast = useToast()

  // ── Dane firmy ──
  const [name, setName] = useState(provider.name)
  const [category, setCategory] = useState<ServiceCategory>(provider.category)
  const [description, setDescription] = useState(provider.description ?? '')
  const [address, setAddress] = useState(provider.address)
  const [city, setCity] = useState(provider.city)
  const [tags, setTags] = useState(provider.tags.join(', '))
  const [images, setImages] = useState<string[]>(provider.images)
  const [hours, setHours] = useState<WorkingHours>(provider.working_hours)
  const [savingInfo, setSavingInfo] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const saveInfo = async () => {
    if (!name.trim() || !address.trim() || !city.trim()) {
      toast.show({ kind: 'error', title: 'Nazwa, adres i miasto są wymagane' })
      return
    }
    setSavingInfo(true)
    try {
      await updateProvider(provider.id, {
        name: name.trim(),
        category,
        description: description.trim() || null,
        address: address.trim(),
        city: city.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        images,
        working_hours: hours,
      })
      toast.show({ kind: 'success', title: 'Zapisano dane firmy' })
      onSaved()
    } catch (e) {
      toast.show({ kind: 'error', title: 'Nie udało się zapisać', body: e instanceof Error ? e.message : '' })
    } finally {
      setSavingInfo(false)
    }
  }

  const onImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      toast.show({ kind: 'error', title: 'Plik za duży', body: 'Maksymalny rozmiar zdjęcia to 4 MB.' })
      return
    }
    setUploadingImage(true)
    try {
      const url = await uploadProviderImage(file)
      setImages((prev) => [...prev, url])
      toast.show({ kind: 'success', title: 'Zdjęcie dodane', body: 'Pamiętaj o zapisaniu zmian.' })
    } catch (err) {
      toast.show({ kind: 'error', title: 'Nie udało się wgrać zdjęcia', body: err instanceof Error ? err.message : '' })
    } finally {
      setUploadingImage(false)
    }
  }

  const setDay = (key: keyof WorkingHours, value: { open: string; close: string } | null) =>
    setHours((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-6">
      {/* ── Dane firmy ── */}
      <div className="bg-white rounded-2xl p-6 card-shadow">
        <h3 className="font-bold text-lg text-gray-900 mb-5">Dane firmy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nazwa</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tagi <span className="text-gray-400 font-normal">(po przecinku)</span></label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="koloryzacja, strzyżenie" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Adres</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Miasto</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Opis</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
          </div>
        </div>

        {/* Zdjęcia */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Zdjęcia</label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative group">
                <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"
                  title="Usuń zdjęcie"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:text-brand-600 text-gray-400 flex items-center justify-center transition-colors"
              title="Dodaj zdjęcie"
            >
              {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImagePick} />
          </div>
        </div>

        {/* Godziny otwarcia */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Godziny otwarcia</label>
          <div className="space-y-2">
            {DAYS.map(({ key, label }) => {
              const day = hours[key]
              return (
                <div key={key} className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 w-36 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!day}
                      onChange={(e) => setDay(key, e.target.checked ? { open: '09:00', close: '18:00' } : null)}
                      className="w-4 h-4 accent-brand-600"
                    />
                    <span className={clsx('text-sm', day ? 'text-gray-800' : 'text-gray-400')}>{label}</span>
                  </label>
                  {day ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) => setDay(key, { ...day, open: e.target.value })}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) => setDay(key, { ...day, close: e.target.value })}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-300">Zamknięte</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={saveInfo} loading={savingInfo}>
            <Check className="w-4 h-4" /> Zapisz zmiany
          </Button>
        </div>
      </div>

      {/* ── Usługi ── */}
      <ServicesEditor provider={provider} onSaved={onSaved} />
    </div>
  )
}

// ── Usługi ──────────────────────────────────────────────────────────────────

interface ServiceDraft { name: string; description: string; durationMin: string; price: string }
const emptyDraft: ServiceDraft = { name: '', description: '', durationMin: '60', price: '' }

function ServicesEditor({ provider, onSaved }: { provider: ProviderWithServices; onSaved: () => void }) {
  const toast = useToast()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft)
  const [busy, setBusy] = useState(false)
  const [addonDrafts, setAddonDrafts] = useState<Record<string, { name: string; price: string }>>({})

  const err = (e: unknown, title: string) =>
    toast.show({ kind: 'error', title, body: e instanceof Error ? e.message : '' })

  const validDraft = () => {
    const dur = Number(draft.durationMin)
    const price = Number(draft.price)
    if (!draft.name.trim()) { toast.show({ kind: 'error', title: 'Podaj nazwę usługi' }); return null }
    if (!Number.isFinite(dur) || dur <= 0) { toast.show({ kind: 'error', title: 'Nieprawidłowy czas trwania' }); return null }
    if (!Number.isFinite(price) || price < 0) { toast.show({ kind: 'error', title: 'Nieprawidłowa cena' }); return null }
    return { name: draft.name.trim(), description: draft.description.trim(), durationMin: dur, price }
  }

  const submitAdd = async () => {
    const v = validDraft()
    if (!v) return
    setBusy(true)
    try {
      await createService({ providerId: provider.id, ...v, description: v.description || undefined })
      toast.show({ kind: 'success', title: 'Usługa dodana' })
      setAdding(false)
      setDraft(emptyDraft)
      onSaved()
    } catch (e) { err(e, 'Nie udało się dodać usługi') } finally { setBusy(false) }
  }

  const submitEdit = async (id: string) => {
    const v = validDraft()
    if (!v) return
    setBusy(true)
    try {
      await updateService(id, { name: v.name, description: v.description || null, duration_min: v.durationMin, price: v.price })
      toast.show({ kind: 'success', title: 'Usługa zaktualizowana' })
      setEditingId(null)
      onSaved()
    } catch (e) { err(e, 'Nie udało się zapisać usługi') } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Usunąć tę usługę?')) return
    try {
      await deleteService(id)
      toast.show({ kind: 'success', title: 'Usługa usunięta' })
      onSaved()
    } catch (e) { err(e, 'Nie udało się usunąć usługi') }
  }

  const addAddon = async (serviceId: string) => {
    const d = addonDrafts[serviceId]
    const price = Number(d?.price)
    if (!d?.name.trim() || !Number.isFinite(price) || price < 0) {
      toast.show({ kind: 'error', title: 'Podaj nazwę i cenę dodatku' })
      return
    }
    try {
      await createAddon({ serviceId, name: d.name.trim(), price })
      setAddonDrafts((prev) => ({ ...prev, [serviceId]: { name: '', price: '' } }))
      onSaved()
    } catch (e) { err(e, 'Nie udało się dodać dodatku') }
  }

  const removeAddon = async (id: string) => {
    try { await deleteAddon(id); onSaved() }
    catch (e) { err(e, 'Nie udało się usunąć dodatku') }
  }

  const draftForm = (onSubmit: () => void, onCancel: () => void) => (
    <div className="space-y-3 p-4 bg-brand-50/50 rounded-xl border border-brand-100">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text" placeholder="Nazwa usługi" value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className={clsx(inputCls, 'sm:col-span-3')}
        />
        <input
          type="number" min={5} step={5} placeholder="Czas (min)" value={draft.durationMin}
          onChange={(e) => setDraft({ ...draft, durationMin: e.target.value })}
          className={inputCls}
        />
        <input
          type="number" min={0} placeholder="Cena (zł)" value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          className={inputCls}
        />
        <input
          type="text" placeholder="Opis (opcjonalnie)" value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>Anuluj</Button>
        <Button size="sm" onClick={onSubmit} loading={busy}><Check className="w-3.5 h-3.5" /> Zapisz</Button>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-gray-900">Usługi ({provider.services.length})</h3>
        {!adding && (
          <Button size="sm" onClick={() => { setAdding(true); setEditingId(null); setDraft(emptyDraft) }}>
            <Plus className="w-4 h-4" /> Dodaj usługę
          </Button>
        )}
      </div>

      {adding && <div className="mb-4">{draftForm(submitAdd, () => setAdding(false))}</div>}

      <div className="divide-y divide-gray-100">
        {provider.services.length === 0 && !adding && (
          <p className="text-center text-sm text-gray-400 py-8">Brak usług — dodaj pierwszą, aby klienci mogli rezerwować.</p>
        )}
        {provider.services.map((s) => (
          <div key={s.id} className="py-4">
            {editingId === s.id ? (
              draftForm(() => submitEdit(s.id), () => setEditingId(null))
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[160px]">
                    <div className="font-medium text-gray-900 text-sm">{s.name}</div>
                    {s.description && <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>}
                  </div>
                  <span className="text-sm text-gray-500">{s.duration_min} min</span>
                  <span className="font-bold text-sm text-gray-900">{Number(s.price)} zł</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(s.id); setAdding(false)
                        setDraft({ name: s.name, description: s.description ?? '', durationMin: String(s.duration_min), price: String(s.price) })
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edytuj"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dodatki */}
                <div className="mt-2 pl-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.addons.map((a) => (
                      <span key={a.id} className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                        {a.name} · +{Number(a.price)} zł
                        <button onClick={() => removeAddon(a.id)} className="text-gray-300 hover:text-red-500" title="Usuń dodatek">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="text" placeholder="Dodatek"
                        value={addonDrafts[s.id]?.name ?? ''}
                        onChange={(e) => setAddonDrafts((p) => ({ ...p, [s.id]: { name: e.target.value, price: p[s.id]?.price ?? '' } }))}
                        className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
                      />
                      <input
                        type="number" min={0} placeholder="zł"
                        value={addonDrafts[s.id]?.price ?? ''}
                        onChange={(e) => setAddonDrafts((p) => ({ ...p, [s.id]: { name: p[s.id]?.name ?? '', price: e.target.value } }))}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
                      />
                      <button onClick={() => addAddon(s.id)} className="p-1 rounded-lg text-brand-600 hover:bg-brand-50" title="Dodaj dodatek">
                        <Plus className="w-4 h-4" />
                      </button>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
