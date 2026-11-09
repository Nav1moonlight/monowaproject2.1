import { useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../context';
import { createDomesticTransaction, type CreateDomesticTransactionPayload } from '../api';

import {
    Field,
    FormActions,
    FormCard,
    FormPage,
    Grid,
    Message,
    useInputStyle,
} from './formUI';

type DomesticDirection = 'incoming' | 'outgoing';

type WasteField =
    | 'domestic_residue'
    | 'leaf_waste'
    | 'paper_waste'
    | 'wood_scrap'
    | 'metal'
    | 'cardboard'
    | 'plant_waste'
    | 'plastic_bottle'
    | 'plastic_packaging'
    | 'food_container'
    | 'wood_cutting'
    | 'brick'
    | 'concrete_block'
    | 'cement_packaging'
    | 'ceiling_waste';

type FormState = {
    date: string;
    session: 'MORNING' | 'AFTERNOON';
    processing_method: string;
    notes: string;
} & Record<WasteField, string>;

type WasteItem = {
    key: WasteField;
    label: string;
};

type WasteGroup = {
    title: string;
    items: WasteItem[];
};

type MessageState = {
    type: 'success' | 'error' | 'info';
    text: string;
};

const wasteGroups: WasteGroup[] = [
    {
        title: 'Domestik Nonplastik',
        items: [
            { key: 'domestic_residue', label: 'Sampah residu' },
            { key: 'leaf_waste', label: 'Sampah daun' },
            { key: 'paper_waste', label: 'Sampah kertas' },
        ],
    },
    {
        title: 'Produksi Nonplastik',
        items: [
            { key: 'wood_scrap', label: 'Perca kayu' },
            { key: 'metal', label: 'Besi' },
            { key: 'cardboard', label: 'Kardus' },
        ],
    },
    {
        title: 'Limbah Tanaman',
        items: [
            { key: 'plant_waste', label: 'Sampah tanaman' },
        ],
    },
    {
        title: 'Plastik',
        items: [
            { key: 'plastic_bottle', label: 'Botol plastik' },
            { key: 'plastic_packaging', label: 'Kemasan plastik' },
            { key: 'food_container', label: 'Wadah makanan' },
        ],
    },
    {
        title: 'Limbah Kontribusi',
        items: [
            { key: 'wood_cutting', label: 'Potongan kayu' },
            { key: 'brick', label: 'Batu bata' },
            { key: 'concrete_block', label: 'Batako' },
            { key: 'cement_packaging', label: 'Kemasan semen' },
            { key: 'ceiling_waste', label: 'Plafon' },
        ],
    },
];

function createInitialState(): FormState {
    return {
        date: new Date().toISOString().slice(0, 10),
        session: 'MORNING',
        processing_method: '',
        notes: '',

        domestic_residue: '0',
        leaf_waste: '0',
        paper_waste: '0',

        wood_scrap: '0',
        metal: '0',
        cardboard: '0',

        plant_waste: '0',

        plastic_bottle: '0',
        plastic_packaging: '0',
        food_container: '0',

        wood_cutting: '0',
        brick: '0',
        concrete_block: '0',
        cement_packaging: '0',
        ceiling_waste: '0',
    };
}

function toNumber(value: string): number {
    const result = Number(value);

    return Number.isFinite(result) && result >= 0 ? result : 0;
}

export default function DomesticWasteForm({
    direction,
}: {
    direction: DomesticDirection;
}) {
    const inputStyle = useInputStyle();
    const { user } = useApp();

    const [form, setForm] = useState<FormState>(createInitialState);
    const [message, setMessage] = useState<MessageState | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const incoming = direction === 'incoming';

    function update<K extends keyof FormState>(
        key: K,
        value: FormState[K],
    ): void {
        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    }

    function calculateGroupSubtotal(group: WasteGroup): number {
        return group.items.reduce(
            (total, item) => total + toNumber(form[item.key]),
            0,
        );
    }

    const total = useMemo(() => {
        return wasteGroups.reduce(
            (grandTotal, group) =>
                grandTotal + calculateGroupSubtotal(group),
            0,
        );
    }, [form]);

    function reset(): void {
        setForm(createInitialState());
        setMessage(null);
    }

    async function submit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        setMessage(null);

        if (!form.date) {
            setMessage({
                type: 'error',
                text: 'Tanggal wajib diisi.',
            });

            return;
        }

        if (!incoming && !form.processing_method) {
            setMessage({
                type: 'error',
                text: 'Metode pengolahan wajib dipilih.',
            });

            return;
        }

        if (total <= 0) {
            setMessage({
                type: 'error',
                text: 'Masukkan minimal satu jumlah sampah yang lebih dari 0.',
            });

            return;
        }

        const payload: CreateDomesticTransactionPayload = {
            date: form.date,
            movement_type: incoming ? 'IN' : 'OUT',
            session: incoming ? form.session : null,
            processing_method: !incoming ? form.processing_method : null,
            status: 'SUBMITTED',
            pic_name: user?.name || 'Petugas',
            notes: form.notes.trim() || null,
            domestic_residue_kg: toNumber(form.domestic_residue),
            leaf_waste_kg: toNumber(form.leaf_waste),
            paper_waste_kg: toNumber(form.paper_waste),
            wood_scrap_kg: toNumber(form.wood_scrap),
            metal_kg: toNumber(form.metal),
            cardboard_kg: toNumber(form.cardboard),
            plant_waste_kg: toNumber(form.plant_waste),
            plastic_bottle_kg: toNumber(form.plastic_bottle),
            plastic_packaging_kg: toNumber(form.plastic_packaging),
            food_container_kg: toNumber(form.food_container),
            wood_cutting_kg: toNumber(form.wood_cutting),
            brick_kg: toNumber(form.brick),
            concrete_block_kg: toNumber(form.concrete_block),
            cement_packaging_kg: toNumber(form.cement_packaging),
            ceiling_waste_kg: toNumber(form.ceiling_waste),
        };

        try {
            setSubmitting(true);
            await createDomesticTransaction(payload);

            setMessage({
                type: 'success',
                text: `Data Sampah ${incoming ? 'Masuk' : 'Keluar'} berhasil disimpan.`,
            });

            setForm(createInitialState());
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err?.message || 'Data gagal disimpan ke database.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <FormPage
            title={`Input Sampah ${incoming ? 'Masuk' : 'Keluar'}`}
            subtitle={
                incoming
                    ? 'Catat data sampah yang masuk.'
                    : 'Catat data sampah yang keluar atau telah diolah.'
            }
        >
            {message && (
                <Message type={message.type}>
                    {message.text}
                </Message>
            )}

            <form onSubmit={submit}>
                <FormCard title="Informasi umum">
                    <Grid>
                        <Field label="Tanggal" required>
                            <input
                                style={inputStyle}
                                type="date"
                                value={form.date}
                                onChange={(event) =>
                                    update('date', event.target.value)
                                }
                                required
                            />
                        </Field>

                        {incoming ? (
                            <Field label="Sesi" required>
                                <select
                                    style={inputStyle}
                                    value={form.session}
                                    onChange={(event) =>
                                        update(
                                            'session',
                                            event.target.value as
                                            | 'MORNING'
                                            | 'AFTERNOON',
                                        )
                                    }
                                >
                                    <option value="MORNING">
                                        Pagi
                                    </option>

                                    <option value="AFTERNOON">
                                        Sore
                                    </option>
                                </select>
                            </Field>
                        ) : (
                            <Field
                                label="Metode pengolahan"
                                required
                            >
                                <select
                                    style={inputStyle}
                                    value={form.processing_method}
                                    onChange={(event) =>
                                        update(
                                            'processing_method',
                                            event.target.value,
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Pilih metode
                                    </option>

                                    <option value="PROCESSED">
                                        Diolah
                                    </option>

                                    <option value="LANDFILL">
                                        Dibuang ke TPA
                                    </option>
                                </select>
                            </Field>
                        )}
                    </Grid>
                </FormCard>

                {wasteGroups.map((group) => (
                    <FormCard
                        key={group.title}
                        title={group.title}
                    >
                        <Grid>
                            {group.items.map((item) => (
                                <Field
                                    key={item.key}
                                    label={`${item.label} (kg)`}
                                >
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form[item.key]}
                                        onChange={(event) =>
                                            update(
                                                item.key,
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            ))}
                        </Grid>

                        <div
                            style={{
                                marginTop: 14,
                                textAlign: 'right',
                                fontWeight: 600,
                            }}
                        >
                            Subtotal: {calculateGroupSubtotal(group).toFixed(2)} kg
                        </div>
                    </FormCard>
                ))}

                <FormCard title="Total dan keterangan">
                    <div
                        style={{
                            marginBottom: 18,
                            fontSize: 18,
                            fontWeight: 700,
                        }}
                    >
                        Total keseluruhan: {total.toFixed(2)} kg
                    </div>

                    <Field
                        label={
                            incoming
                                ? 'Keterangan'
                                : 'Keterangan pengolahan'
                        }
                    >
                        <textarea
                            style={{
                                ...inputStyle,
                                minHeight: 100,
                                resize: 'vertical',
                            }}
                            value={form.notes}
                            maxLength={1000}
                            onChange={(event) =>
                                update('notes', event.target.value)
                            }
                        />
                    </Field>
                </FormCard>

                <FormActions
                    submitting={submitting}
                    onReset={reset}
                />
            </form>
        </FormPage>
    );
}