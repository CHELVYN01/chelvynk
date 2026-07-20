<script lang="ts">
    import { enhance } from '$app/forms';
    import { Star, CheckCircle2, XCircle } from 'lucide-svelte';

    let { data, form } = $props();

    let rating = $state(0);
    let hovered = $state(0);
    let submitting = $state(false);
</script>

<svelte:head>
    <title>Beri Review — Chelvyn Kleden</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="review-wrap">
    <div class="review-card">
        {#if form?.success}
            <!-- Cek sukses DULUAN: setelah submit, token jadi used=1 & load re-run,
                 tapi klien harus lihat "Terima Kasih", bukan "Link Tidak Valid". -->
            <div class="state-icon success"><CheckCircle2 size={56} /></div>
            <h1>Terima Kasih! 🙏</h1>
            <p class="muted">
                Review Anda sudah kami terima dan akan segera ditampilkan setelah ditinjau.
                Terima kasih sudah meluangkan waktu.
            </p>
        {:else if !data.valid}
            <!-- Token invalid / expired / sudah dipakai: pesan generik yang sama -->
            <div class="state-icon error"><XCircle size={56} /></div>
            <h1>Link Tidak Valid</h1>
            <p class="muted">
                Link review ini tidak valid, sudah pernah digunakan, atau masa berlakunya
                telah habis. Silakan hubungi Chelvyn untuk mendapatkan link baru.
            </p>
        {:else}
            <div class="brand">
                <span class="tag">Review Klien</span>
                <h1>Bagaimana pengalaman Anda?</h1>
                <p class="muted">
                    Halo <strong>{data.clientName}</strong>, terima kasih sudah mempercayakan
                    proyek <strong>{data.projectName}</strong>. Umpan balik Anda sangat berarti.
                </p>
            </div>

            {#if form?.error}
                <div class="alert">{form.error}</div>
            {/if}

            <form
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
                    <label for="rating-group">Rating</label>
                    <div class="stars" id="rating-group" role="radiogroup" aria-label="Rating bintang">
                        {#each [1, 2, 3, 4, 5] as n}
                            <button
                                type="button"
                                class="star-btn"
                                class:filled={n <= (hovered || rating)}
                                aria-label={`${n} bintang`}
                                onclick={() => (rating = n)}
                                onmouseenter={() => (hovered = n)}
                                onmouseleave={() => (hovered = 0)}
                            >
                                <Star size={34} fill={n <= (hovered || rating) ? 'currentColor' : 'none'} />
                            </button>
                        {/each}
                    </div>
                    <input type="hidden" name="rating" value={rating} />
                </div>

                <div class="field">
                    <label for="reviewer_name">Nama</label>
                    <input id="reviewer_name" name="reviewer_name" type="text" required maxlength="100" placeholder="Nama Anda" />
                </div>

                <div class="field">
                    <label for="reviewer_role">Jabatan / Perusahaan <span class="opt">(opsional)</span></label>
                    <input id="reviewer_role" name="reviewer_role" type="text" maxlength="120" placeholder="mis. CTO PT Sukses Makmur" />
                </div>

                <div class="field">
                    <label for="testimonial">Testimoni</label>
                    <textarea id="testimonial" name="testimonial" required rows="5" maxlength="2000" placeholder="Ceritakan pengalaman Anda bekerja sama..."></textarea>
                </div>

                <button type="submit" class="submit-btn" disabled={submitting || rating === 0}>
                    {submitting ? 'Mengirim...' : 'Kirim Review'}
                </button>
            </form>
        {/if}
    </div>
</div>

<style>
    .review-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        background: var(--bg-soft);
    }
    .review-card {
        width: 100%;
        max-width: 520px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    }
    .tag {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--primary);
        background: color-mix(in srgb, var(--primary) 12%, transparent);
        padding: 0.3rem 0.8rem;
        border-radius: 999px;
        margin-bottom: 1rem;
    }
    h1 {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text-main);
        margin: 0 0 0.6rem;
        line-height: 1.25;
    }
    .muted {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin: 0;
    }
    .brand { margin-bottom: 1.75rem; text-align: center; }

    .field { margin-bottom: 1.25rem; }
    .field label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
        margin-bottom: 0.5rem;
    }
    .field .opt { font-weight: 400; color: var(--text-muted); }
    input[type='text'],
    textarea {
        width: 100%;
        padding: 0.75rem 0.9rem;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg-soft);
        color: var(--text-main);
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color 0.15s;
        box-sizing: border-box;
    }
    input[type='text']:focus,
    textarea:focus {
        outline: none;
        border-color: var(--primary);
    }
    textarea { resize: vertical; }

    .stars { display: flex; gap: 0.35rem; }
    .star-btn {
        background: none;
        border: none;
        padding: 0.15rem;
        cursor: pointer;
        color: #cbd5e1;
        transition: color 0.12s, transform 0.12s;
        line-height: 0;
    }
    .star-btn.filled { color: #f59e0b; }
    .star-btn:hover { transform: scale(1.12); }

    .submit-btn {
        width: 100%;
        padding: 0.9rem;
        border: none;
        border-radius: 10px;
        background: var(--primary);
        color: #fff;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
    }
    .submit-btn:hover:not(:disabled) { background: var(--primary-hover); }
    .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .alert {
        background: color-mix(in srgb, #ef4444 12%, transparent);
        border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
        color: #dc2626;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.9rem;
        margin-bottom: 1.25rem;
    }

    .state-icon { display: flex; justify-content: center; margin-bottom: 1rem; }
    .state-icon.success { color: #22c55e; }
    .state-icon.error { color: #ef4444; }
    .review-card:has(.state-icon) { text-align: center; }
</style>
