import type { CSSProperties, ReactNode } from 'react'
import { useApp } from '../context'

export function FormPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
    const { tokens } = useApp()
    return (
        <div style={{ padding: '24px', width: '100%', maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: 24, color: tokens.text }}>{title}</h1>
                <p style={{ margin: '6px 0 0', color: tokens.textMuted, fontSize: 14 }}>{subtitle}</p>
            </div>
            {children}
        </div>
    )
}

export function FormCard({ title, children }: { title?: string; children: ReactNode }) {
    const { tokens } = useApp()
    return (
        <section style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: tokens.radius, boxShadow: tokens.shadow, padding: 20, marginBottom: 16, backdropFilter: tokens.glassBlur }}>
            {title && <h2 style={{ margin: '0 0 16px', fontSize: 16, color: tokens.text }}>{title}</h2>}
            {children}
        </section>
    )
}

export function Grid({ children }: { children: ReactNode }) {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>{children}</div>
}

export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
    const { tokens } = useApp()
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{label}{required && <span style={{ color: tokens.danger }}> *</span>}</span>
            {children}
            {hint && <small style={{ color: tokens.textMuted, fontSize: 11 }}>{hint}</small>}
        </label>
    )
}

export function useInputStyle(): CSSProperties {
    const { tokens } = useApp()
    return {
        width: '100%', minHeight: 42, padding: '10px 12px', borderRadius: Math.min(parseInt(tokens.radius) || 8, 10),
        border: `1px solid ${tokens.border}`, background: tokens.inputBg, color: tokens.text, outline: 'none', fontSize: 14,
    }
}

export function Message({ type, children }: { type: 'success' | 'error' | 'info'; children: ReactNode }) {
    const { tokens } = useApp()
    const color = type === 'success' ? tokens.success : type === 'error' ? tokens.danger : tokens.accent
    return <div role="status" style={{ padding: '11px 13px', borderRadius: 8, border: `1px solid ${color}`, color, marginBottom: 16, fontSize: 13 }}>{children}</div>
}

export function FormActions({ submitting, onReset, submitLabel = 'Simpan' }: { submitting?: boolean; onReset: () => void; submitLabel?: string }) {
    const { tokens } = useApp()
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onReset} disabled={submitting} style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid ${tokens.border}`, background: tokens.inputBg, color: tokens.text, cursor: 'pointer' }}>Reset</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 8, border: 0, background: tokens.primary, color: tokens.textInverse, cursor: submitting ? 'wait' : 'pointer', fontWeight: 700, opacity: submitting ? .7 : 1 }}>
                {submitting ? 'Menyimpan...' : submitLabel}
            </button>
        </div>
    )
}
