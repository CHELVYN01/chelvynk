<script lang="ts">
    import { enhance } from '$app/forms';
    import { Star, ArrowRight } from 'lucide-svelte';

    let { data, form } = $props();

    let rating = $state(0);
    let hovered = $state(0);
    let submitting = $state(false);

    const ratingLabels = ['', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik', 'Luar Biasa'];
    const active = $derived(hovered || rating);
</script>

<div class="review-page">
    <!-- Bar atas: hanya logo, tanpa nama (logo sudah mewakili brand) -->
    <header class="review-top">
        <a href="/" class="review-logo" aria-label="Beranda">ck.</a>
        <span class="mono">Review Klien</span>
    </header>

    <main class="review-main">
        {#if form?.success}
            <!-- Cek sukses DULUAN: setelah submit, token jadi used=1 & load re-run,
                 tapi klien harus lihat "Terima Kasih", bukan "Link Tidak Valid". -->
            <div class="review-state">
                <span class="mono state-label">Terkirim</span>
                <h1>Terima kasih.</h1>
                <p class="lead">
                    Review Anda sudah diterima dan akan ditampilkan setelah ditinjau.
                    Terima kasih sudah meluangkan waktu.
                </p>
                <a href="/" class="btn-line">Kunjungi Website <ArrowRight size={16} /></a>
            </div>
        {:else if !data.valid}
            <!-- Token invalid / expired / sudah dipakai: pesan generik yang sama -->
            <div class="review-state">
                <span class="mono state-label">Link Tidak Valid</span>
                <h1>Link ini sudah tidak berlaku.</h1>
                <p class="lead">
                    Link review ini tidak valid, sudah pernah digunakan, atau masa berlakunya
                    telah habis. Silakan minta link baru.
                </p>
                <a href="/" class="btn-line">Kembali ke Beranda <ArrowRight size={16} /></a>
            </div>
        {:else}
            <div class="review-head">
                <h1>Bagaimana pengalaman Anda?</h1>
                <p class="lead">
                    Halo <strong>{data.clientName}</strong>, terima kasih sudah mempercayakan
                    proyek ini. Umpan balik Anda sangat berarti.
                </p>

                <dl class="review-meta">
                    <div>
                        <dt class="mono">Klien</dt>
                        <dd>{data.clientName}</dd>
                    </div>
                    <div>
                        <dt class="mono">Proyek</dt>
                        <dd>{data.projectName}</dd>
                    </div>
                </dl>
            </div>

            {#if form?.error}
                <div class="review-alert" role="alert">
                    <span class="mono">Error</span>
                    {form.error}
                </div>
            {/if}

            <form
                class="review-form"
                method="POST"
                action="?/submit"
                use:enhance={() => {
                    submitting = true;
                    return async ({ update }) => {
                        await update();
                        submitting = false;
                    };
                }}
            >
                <!-- Rating bintang -->
                <div class="field">
                    <div class="field-head">
                        <label class="mono" for="rating-group">01 — Rating</label>
                        <span class="mono rating-text">
                            {active ? `${active}/5 · ${ratingLabels[active]}` : 'Pilih bintang'}
                        </span>
                    </div>
                    <div class="stars" id="rating-group" role="radiogroup" aria-label="Rating bintang">
                        {#each [1, 2, 3, 4, 5] as n}
                            <button
                                type="button"
                                class="star-btn"
                                class:filled={n <= active}
                                role="radio"
                                aria-checked={rating === n}
                                aria-label={`${n} bintang`}
                                onclick={() => (rating = n)}
                                onmouseenter={() => (hovered = n)}
                                onmouseleave={() => (hovered = 0)}
                            >
                                <Star size={30} strokeWidth={1.25} fill={n <= active ? 'currentColor' : 'none'} />
                            </button>
                        {/each}
                    </div>
                    <input type="hidden" name="rating" value={rating} />
                </div>

                <div class="field-row">
                    <div class="field">
                        <label class="mono" for="reviewer_name">02 — Nama</label>
                        <input id="reviewer_name" name="reviewer_name" type="text" required maxlength="100" placeholder="Nama Anda" />
                    </div>

                    <div class="field">
                        <label class="mono" for="reviewer_role">03 — Jabatan / Perusahaan <span class="opt">(opsional)</span></label>
                        <input id="reviewer_role" name="reviewer_role" type="text" maxlength="120" placeholder="mis. CTO PT Sukses Makmur" />
                    </div>
                </div>

                <div class="field">
                    <label class="mono" for="testimonial">04 — Testimoni</label>
                    <textarea id="testimonial" name="testimonial" required rows="5" maxlength="2000" placeholder="Ceritakan pengalaman Anda bekerja sama..."></textarea>
                </div>

                <button type="submit" class="btn-solid submit-btn" disabled={submitting || rating === 0}>
                    {submitting ? 'Mengirim...' : 'Kirim Review'}
                    {#if !submitting}<ArrowRight size={16} />{/if}
                </button>
                {#if rating === 0}
                    <p class="hint mono">Pilih rating dulu untuk mengirim</p>
                {/if}
            </form>
        {/if}
    </main>
</div>

<style>
    .review-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--bg-soft);
    }

    /* ===== Bar atas ===== */
    .review-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem clamp(1.25rem, 4vw, 2.5rem);
        border-bottom: 1px solid var(--border);
        color: var(--text-muted);
    }

    .review-logo {
        font-family: var(--font-serif);
        font-style: italic;
        font-weight: 400;
        font-size: 2rem;
        font-variation-settings: 'opsz' 72;
        letter-spacing: -0.04em;
        line-height: 1;
        color: var(--text-main);
    }

    /* ===== Konten ===== */
    .review-main {
        flex: 1;
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
        padding: clamp(3rem, 8vw, 5.5rem) 1.25rem 5rem;
    }

    h1 {
        font-family: var(--font-serif);
        font-weight: 400;
        font-size: clamp(2.25rem, 6vw, 3.25rem);
        line-height: 1.05;
        letter-spacing: -0.03em;
        color: var(--text-main);
        margin: 0 0 1.25rem;
    }

    .lead {
        color: var(--text-muted);
        font-size: 1rem;
        line-height: 1.7;
        margin: 0;
        max-width: 520px;
    }

    .lead strong {
        color: var(--text-main);
        font-weight: 600;
    }

    /* Ringkasan klien & proyek: tabel tipis bergaris */
    .review-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: 2.5rem 0 0;
        border-top: 2px solid var(--text-main);
    }

    .review-meta > div {
        padding: 1rem 0;
        border-bottom: 1px solid var(--border);
    }

    .review-meta > div + div {
        padding-left: 1.25rem;
        border-left: 1px solid var(--border);
    }

    .review-meta dt {
        color: var(--text-muted);
        margin-bottom: 0.35rem;
    }

    .review-meta dd {
        margin: 0;
        font-family: var(--font-serif);
        font-size: 1.2rem;
        color: var(--text-main);
        line-height: 1.3;
        overflow-wrap: anywhere;
    }

    /* ===== Form ===== */
    .review-form {
        display: flex;
        flex-direction: column;
        gap: 2.25rem;
        margin-top: 3rem;
    }

    .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2.25rem 1.5rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        min-width: 0;
    }

    .field-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 1rem;
    }

    .field label {
        color: var(--text-main);
    }

    .field .opt {
        color: var(--text-muted);
        text-transform: none;
        letter-spacing: 0;
    }

    .rating-text {
        color: var(--text-muted);
    }

    input[type='text'],
    textarea {
        width: 100%;
        padding: 0.7rem 0;
        border: none;
        border-bottom: 1px solid color-mix(in srgb, var(--text-muted) 45%, transparent);
        border-radius: 0;
        background: transparent;
        color: var(--text-main);
        font-family: var(--font-sans);
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    input[type='text']::placeholder,
    textarea::placeholder {
        color: color-mix(in srgb, var(--text-muted) 65%, transparent);
    }

    input[type='text']:focus,
    textarea:focus {
        outline: none;
        border-bottom-color: var(--text-main);
        box-shadow: 0 1px 0 0 var(--text-main);
    }

    textarea {
        resize: vertical;
        min-height: 130px;
        line-height: 1.6;
    }

    /* Bintang monokrom */
    .stars {
        display: flex;
        gap: 0.25rem;
        margin-left: -0.2rem;
    }

    .star-btn {
        background: none;
        border: none;
        padding: 0.2rem;
        cursor: pointer;
        color: color-mix(in srgb, var(--text-muted) 55%, transparent);
        line-height: 0;
        transition:
            color 0.15s ease,
            transform 0.15s ease;
    }

    .star-btn.filled {
        color: var(--text-main);
    }

    .star-btn:hover {
        transform: translateY(-2px);
    }

    .star-btn:focus-visible {
        outline: 1px solid var(--text-main);
        outline-offset: 2px;
    }

    .submit-btn {
        width: 100%;
        cursor: pointer;
        font-family: var(--font-serif);
    }

    .submit-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .submit-btn:disabled:hover {
        background: var(--primary);
        color: var(--on-primary);
    }

    .hint {
        margin: -1.25rem 0 0;
        text-align: center;
        color: var(--text-muted);
    }

    .review-alert {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        margin-top: 2rem;
        padding: 0.9rem 1rem;
        border-left: 2px solid var(--text-main);
        background: color-mix(in srgb, var(--text-main) 5%, transparent);
        color: var(--text-main);
        font-size: 0.92rem;
    }

    /* ===== Status sukses / link invalid ===== */
    .review-state {
        padding-top: 1.25rem;
        border-top: 2px solid var(--text-main);
    }

    .state-label {
        display: inline-block;
        margin-bottom: 2rem;
        color: var(--text-muted);
    }

    .review-state .btn-line {
        margin-top: 2.5rem;
    }

    @media (max-width: 560px) {
        .field-row {
            grid-template-columns: 1fr;
        }

        .review-meta {
            grid-template-columns: 1fr;
        }

        .review-meta > div + div {
            padding-left: 0;
            border-left: none;
        }
    }
</style>
