import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type ChangeEvent,
} from 'react';
import {
    getWasteCategories,
    getWasteSources,
    createB3TransactionApi,
    type CategoryItem as Category,
    type WasteSourceItem as WasteSource,
    type CreateB3TransactionPayload as B3TransactionPayload,
} from '../api';
import { useApp } from '../context';
import {
    compressImage,
    type CompressionResult,
} from '../utils/imageCompressor';
import AddSourceModal from './common/AddSourceModal';

import {
    Field,
    FormActions,
    FormCard,
    FormPage,
    Grid,
    Message,
    useInputStyle,
} from './formUI';

type TransactionType = 'IN' | 'OUT';

type MessageType = 'success' | 'error' | 'info';

type FormState = {
    date: string;
    waste_category_id: string;
    waste_code: string;
    waste_name: string;
    source: string;
    destination: string;
    transporter: string;
    manifest_number: string;
    weight_kg: string;
    storage_deadline_at: string;
    status: string;
    notes: string;
    scale_photo: File | null;
};

const initialState = (): FormState => ({
    date: new Date().toISOString().slice(0, 10),
    waste_category_id: '',
    waste_code: '',
    waste_name: '',
    source: '',
    destination: '',
    transporter: '',
    manifest_number: '',
    weight_kg: '',
    storage_deadline_at: '',
    status: 'PENDING',
    notes: '',
    scale_photo: null,
});

export default function B3TransactionForm({
    type,
}: {
    type: TransactionType;
}) {
    const { tokens } = useApp();
    const inputStyle = useInputStyle();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState<FormState>(initialState);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [sources, setSources] = useState<WasteSource[]>([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // State untuk kompresi gambar
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] =
        useState<CompressionResult | null>(null);
    const [showFullPreview, setShowFullPreview] = useState(false);

    const [message, setMessage] = useState<{
        type: MessageType;
        text: string;
    } | null>(null);

    const incoming = type === 'IN';

    useEffect(() => {
        let active = true;

        async function loadMasterData(): Promise<void> {
            try {
                setLoadingCategories(true);
                setLoadingSources(true);

                const [catRows, srcRows] = await Promise.all([
                    getWasteCategories(),
                    getWasteSources({ active: true }),
                ]);

                if (active) {
                    setCategories(catRows);
                    setSources(srcRows);
                }
            } catch (error) {
                if (active) {
                    setMessage({
                        type: 'error',
                        text:
                            error instanceof Error
                                ? error.message
                                : 'Data master gagal dimuat. Pastikan API dan database aktif.',
                    });
                }
            } finally {
                if (active) {
                    setLoadingCategories(false);
                    setLoadingSources(false);
                }
            }
        }

        void loadMasterData();

        return () => {
            active = false;
        };
    }, []);

    // Grouping sources by entity
    const utSources = useMemo(
        () => sources.filter((s) => s.entity === 'UT'),
        [sources],
    );
    const utpeSources = useMemo(
        () => sources.filter((s) => s.entity === 'UTPE'),
        [sources],
    );
    const otherSources = useMemo(
        () => sources.filter((s) => s.entity !== 'UT' && s.entity !== 'UTPE'),
        [sources],
    );

    // Cleanup object URL saat unmount
    useEffect(() => {
        return () => {
            if (compressionInfo?.previewUrl) {
                URL.revokeObjectURL(compressionInfo.previewUrl);
            }
        };
    }, [compressionInfo]);

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) =>
                    String(category.id) === form.waste_category_id,
            ),
        [categories, form.waste_category_id],
    );

    function update<K extends keyof FormState>(
        key: K,
        value: FormState[K],
    ): void {
        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    }

    function chooseCategory(id: string): void {
        const category = categories.find(
            (item) => String(item.id) === id,
        );

        setForm((previous) => ({
            ...previous,
            waste_category_id: id,
            waste_code: category?.code ?? '',
            waste_name: category?.name ?? '',
        }));
    }

    async function handlePhotoSelect(
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> {
        const selectedFile = event.target.files?.[0];

        // Jika user membatalkan dialog pemilihan file, jangan hapus foto yang sudah ada sebelumnya
        if (!selectedFile) {
            return;
        }

        try {
            setIsCompressing(true);

            // Kompresi otomatis di sisi browser
            const result = await compressImage(selectedFile, {
                maxWidth: 1600,
                maxHeight: 1600,
                quality: 0.75,
                mimeType: 'image/webp',
            });

            // Bersihkan URL preview sebelumnya jika ada
            if (compressionInfo?.previewUrl) {
                URL.revokeObjectURL(compressionInfo.previewUrl);
            }

            setCompressionInfo(result);
            setForm((previous) => ({
                ...previous,
                scale_photo: result.file,
            }));
        } catch (error) {
            setMessage({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'Gagal mengompresi foto.',
            });
        } finally {
            setIsCompressing(false);
        }
    }

    function clearPhoto(): void {
        if (compressionInfo?.previewUrl) {
            URL.revokeObjectURL(compressionInfo.previewUrl);
        }
        setCompressionInfo(null);
        setShowFullPreview(false);
        setForm((previous) => ({
            ...previous,
            scale_photo: null,
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function reset(): void {
        clearPhoto();
        setForm(initialState());
        setMessage(null);
    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setMessage(null);

        const weight = Number(form.weight_kg);

        if (
            !form.date ||
            !form.waste_category_id ||
            !Number.isFinite(weight) ||
            weight <= 0
        ) {
            setMessage({
                type: 'error',
                text: 'Lengkapi tanggal, kategori, dan jumlah limbah yang valid.',
            });

            return;
        }

        if (incoming && !form.source.trim()) {
            setMessage({
                type: 'error',
                text: 'Sumber limbah wajib diisi untuk B3 Masuk.',
            });

            return;
        }

        if (!incoming && !form.destination.trim()) {
            setMessage({
                type: 'error',
                text: 'Tujuan penyerahan wajib diisi untuk B3 Keluar.',
            });

            return;
        }

        const payload: B3TransactionPayload = {
            transaction_type: type,
            waste_category_id: Number(form.waste_category_id),
            waste_code: form.waste_code,
            waste_name: form.waste_name,
            date: form.date,
            source: incoming ? form.source.trim() : null,
            destination: incoming ? null : form.destination.trim(),
            transporter: form.transporter.trim() || null,
            manifest_number: form.manifest_number.trim() || null,
            weight_kg: weight,
            status: form.status,
            storage_deadline_at:
                incoming && form.storage_deadline_at
                    ? form.storage_deadline_at
                    : null,
            notes: form.notes.trim() || null,
        };

        try {
            setSubmitting(true);

            await createB3TransactionApi(payload, form.scale_photo);

            setMessage({
                type: 'success',
                text: `Data B3 ${incoming ? 'Masuk' : 'Keluar'} berhasil disimpan.`,
            });

            clearPhoto();
            setForm(initialState());
        } catch (error) {
            setMessage({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'Data gagal disimpan.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <FormPage
            title={`Input B3 ${incoming ? 'Masuk' : 'Keluar'}`}
            subtitle={
                incoming
                    ? 'Catat limbah B3 yang masuk ke tempat penyimpanan.'
                    : 'Catat penyerahan atau pengeluaran limbah B3.'
            }
        >
            {message && (
                <Message type={message.type}>{message.text}</Message>
            )}

            <form onSubmit={submit}>
                <FormCard title="Informasi transaksi">
                    <Grid>
                        <Field label="Tanggal transaksi" required>
                            <input
                                style={inputStyle}
                                type="date"
                                max={new Date()
                                    .toISOString()
                                    .slice(0, 10)}
                                value={form.date}
                                onChange={(event) =>
                                    update('date', event.target.value)
                                }
                                required
                            />
                        </Field>

                        <Field label="Kategori limbah B3" required>
                            <select
                                style={inputStyle}
                                value={form.waste_category_id}
                                onChange={(event) =>
                                    chooseCategory(event.target.value)
                                }
                                disabled={loadingCategories}
                                required
                            >
                                <option value="">
                                    {loadingCategories
                                        ? 'Memuat kategori...'
                                        : 'Pilih kategori'}
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.code} — {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Kode limbah">
                            <input
                                style={inputStyle}
                                value={form.waste_code}
                                readOnly
                            />
                        </Field>

                        <Field label="Nama limbah">
                            <input
                                style={inputStyle}
                                value={form.waste_name}
                                readOnly
                                placeholder={
                                    selectedCategory?.name ?? ''
                                }
                            />
                        </Field>

                        <Field label="Jumlah (kg)" required>
                            <input
                                style={inputStyle}
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.weight_kg}
                                onChange={(event) =>
                                    update(
                                        'weight_kg',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                        </Field>

                        <Field label="Status">
                            <select
                                style={inputStyle}
                                value={form.status}
                                onChange={(event) =>
                                    update('status', event.target.value)
                                }
                            >
                                <option value="PENDING">Pending</option>
                                <option value="RECEIVED">Received</option>
                                <option value="PROCESSED">
                                    Processed
                                </option>
                                <option value="COMPLETED">
                                    Completed
                                </option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </Field>
                    </Grid>
                </FormCard>

                <FormCard
                    title={
                        incoming
                            ? 'Asal dan penyimpanan'
                            : 'Penyerahan'
                    }
                >
                    <Grid>
                        {incoming ? (
                            <Field label="Sumber limbah" required>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center',
                                        flexWrap: 'nowrap',
                                    }}
                                >
                                    <select
                                        style={{
                                            ...inputStyle,
                                            flex: 1,
                                            minWidth: 0,
                                            cursor: 'pointer',
                                        }}
                                        value={form.source}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === '__ADD_NEW__') {
                                                setIsAddSourceOpen(true);
                                            } else {
                                                update('source', val);
                                            }
                                        }}
                                        required
                                        disabled={loadingSources}
                                    >
                                        <option value="">
                                            {loadingSources
                                                ? 'Memuat daftar lokasi...'
                                                : '-- Pilih Lokasi Sumber Limbah --'}
                                        </option>
                                        {form.source &&
                                            !sources.some(
                                                (s) => s.name === form.source,
                                            ) && (
                                                <option value={form.source}>
                                                    📍 {form.source} (Khusus)
                                                </option>
                                            )}
                                        {utSources.length > 0 && (
                                            <optgroup label="🏭 United Tractors (UT)">
                                                {utSources.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.name}
                                                    >
                                                        {s.name}{' '}
                                                        {s.code
                                                            ? `(${s.code})`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}
                                        {utpeSources.length > 0 && (
                                            <optgroup label="🏗️ UTPE">
                                                {utpeSources.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.name}
                                                    >
                                                        {s.name}{' '}
                                                        {s.code
                                                            ? `(${s.code})`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}
                                        {otherSources.length > 0 && (
                                            <optgroup label="🏢 Lokasi Lainnya">
                                                {otherSources.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.name}
                                                    >
                                                        {s.name}{' '}
                                                        {s.code
                                                            ? `(${s.code})`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}
                                        <optgroup label="➕ Opsi">
                                            <option value="__ADD_NEW__">
                                                ➕ + Tambah Lokasi Baru...
                                            </option>
                                        </optgroup>
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAddSourceOpen(true)
                                        }
                                        title="Tambah lokasi sumber baru"
                                        style={{
                                            background: `${tokens.primary}18`,
                                            border: `1px solid ${tokens.primary}50`,
                                            borderRadius: tokens.radius,
                                            color: tokens.primary,
                                            padding: '8px 12px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        ➕ Lokasi Baru
                                    </button>
                                </div>
                            </Field>
                        ) : (
                            <Field label="Tujuan penyerahan" required>
                                <input
                                    style={inputStyle}
                                    value={form.destination}
                                    onChange={(event) =>
                                        update(
                                            'destination',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nama pengelola atau penerima"
                                    required
                                />
                            </Field>
                        )}

                        {!incoming && (
                            <Field label="Pengangkut">
                                <input
                                    style={inputStyle}
                                    value={form.transporter}
                                    onChange={(event) =>
                                        update(
                                            'transporter',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        )}

                        <Field label="Nomor dokumen/manifest">
                            <input
                                style={inputStyle}
                                value={form.manifest_number}
                                onChange={(event) =>
                                    update(
                                        'manifest_number',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        {incoming && (
                            <Field label="Batas maksimal penyimpanan">
                                <input
                                    style={inputStyle}
                                    type="date"
                                    min={form.date || undefined}
                                    value={form.storage_deadline_at}
                                    onChange={(event) =>
                                        update(
                                            'storage_deadline_at',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        )}

                        <Field
                            label="Foto timbangan"
                            hint="Foto bukti timbangan fisik (otomatis dioptimalkan ke WebP)."
                        >
                            <input
                                ref={fileInputRef}
                                style={inputStyle}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                disabled={isCompressing}
                            />
                        </Field>
                    </Grid>

                    {/* Status Indikator Proses Kompresi */}
                    {isCompressing && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: '10px 14px',
                                background: tokens.bgSecondary,
                                border: `1px solid ${tokens.border}`,
                                borderRadius: tokens.radius,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontSize: 13,
                                color: tokens.text,
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={tokens.primary}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    animation: 'spin 0.8s linear infinite',
                                }}
                            >
                                <line x1="12" y1="2" x2="12" y2="6" />
                                <line x1="12" y1="18" x2="12" y2="22" />
                                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                                <line x1="2" y1="12" x2="6" y2="12" />
                                <line x1="18" y1="12" x2="22" y2="12" />
                                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                            </svg>
                            <span>Mengompresi dan mengoptimalkan gambar...</span>
                        </div>
                    )}

                    {/* Preview dan Statistik Kompresi Gambar */}
                    {compressionInfo && !isCompressing && (
                        <div
                            style={{
                                marginTop: 14,
                                padding: 12,
                                background: tokens.bgSecondary,
                                border: `1px solid ${tokens.border}`,
                                borderRadius: tokens.radius,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    minWidth: 0,
                                }}
                            >
                                <img
                                    src={compressionInfo.previewUrl}
                                    alt="Pratinjau Timbangan"
                                    onClick={() => setShowFullPreview(true)}
                                    title="Klik untuk melihat pratinjau penuh"
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 6,
                                        objectFit: 'cover',
                                        border: `1px solid ${tokens.cardBorder}`,
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: tokens.text,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 240,
                                        }}
                                    >
                                        {compressionInfo.file.name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginTop: 4,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: tokens.textMuted,
                                            }}
                                        >
                                            {compressionInfo.width}×
                                            {compressionInfo.height}px
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                background:
                                                    'rgba(16, 185, 129, 0.15)',
                                                color: tokens.success,
                                                fontWeight: 700,
                                            }}
                                        >
                                            ⚡ {compressionInfo.originalSizeFormatted} ➔{' '}
                                            {compressionInfo.compressedSizeFormatted} (-
                                            {compressionInfo.savedPercentage}%)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowFullPreview(true)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: tokens.primary,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                padding: 0,
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            Lihat Foto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={clearPhoto}
                                style={{
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: `1px solid ${tokens.danger}`,
                                    color: tokens.danger,
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                Hapus Foto
                            </button>
                        </div>
                    )}
                </FormCard>

                {/* Modal Pratinjau Foto Penuh */}
                {showFullPreview && compressionInfo && (
                    <div
                        onClick={() => setShowFullPreview(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.75)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: tokens.card,
                                border: `1px solid ${tokens.cardBorder}`,
                                borderRadius: tokens.radius,
                                padding: 16,
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 12,
                                boxShadow: tokens.shadow,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: tokens.text,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span>Pratinjau Bukti Timbangan (Terkompresi)</span>
                                <span style={{ fontSize: 12, color: tokens.textMuted }}>
                                    {compressionInfo.width} × {compressionInfo.height} px (
                                    {compressionInfo.compressedSizeFormatted})
                                </span>
                            </div>
                            <img
                                src={compressionInfo.previewUrl}
                                alt="Foto Timbangan Penuh"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    borderRadius: 6,
                                    objectFit: 'contain',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowFullPreview(false)}
                                style={{
                                    padding: '8px 18px',
                                    background: tokens.primary,
                                    color: tokens.textInverse,
                                    border: 'none',
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                }}
                            >
                                Tutup Pratinjau
                            </button>
                        </div>
                    </div>
                )}

                <FormCard title="Keterangan">
                    <Field label="Catatan">
                        <textarea
                            style={{
                                ...inputStyle,
                                minHeight: 95,
                                resize: 'vertical',
                            }}
                            maxLength={1000}
                            value={form.notes}
                            onChange={(event) =>
                                update('notes', event.target.value)
                            }
                        />
                    </Field>
                </FormCard>

                <FormActions
                    submitting={submitting || isCompressing}
                    onReset={reset}
                />
            </form>

            <AddSourceModal
                isOpen={isAddSourceOpen}
                onClose={() => setIsAddSourceOpen(false)}
                onSuccess={(newSource) => {
                    setSources((prev) => {
                        const exists = prev.some((s) => s.id === newSource.id);
                        return exists ? prev : [...prev, newSource];
                    });
                    update('source', newSource.name);
                    setMessage({
                        type: 'info',
                        text: `Lokasi sumber "${newSource.name}" berhasil ditambahkan dan dipilih.`,
                    });
                }}
            />
        </FormPage>
    );
}