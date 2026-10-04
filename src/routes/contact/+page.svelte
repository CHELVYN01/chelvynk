<script lang="ts">
  import { CheckCircle2, Send, ArrowUpRight } from "lucide-svelte";
  import { enhance } from "$app/forms";

  let { data, form } = $props();

  // Status kirim form kontak (untuk disable tombol & ubah labelnya).
  let sending = $state(false);
</script>

<svelte:head>
  <title>Kontak — Chelvyn Kleden | Odoo Technical Consultant</title>
</svelte:head>

<section class="contact-section">
  <div class="container contact-grid">
    <div class="contact-intro">
      <p class="contact-eyebrow">
        <span class="status-dot"></span>
        <span>{data.siteStatus}</span>
      </p>

      <h1>
        Punya project?
        <span class="text-orange">Ceritakan ke saya.</span>
      </h1>

      <p class="contact-lead">
        Diskusi soal Odoo, aplikasi web, atau ide produk — saya selalu
        terbuka untuk kolaborasi baru.
      </p>

      <div class="contact-alt">
        <span class="contact-alt-label">Atau langsung lewat</span>
        <a
          href="https://t.me/kledenvin"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-link"
        >
          <Send size={18} />
          <span class="contact-link-text">
            Telegram <small>@kledenvin</small>
          </span>
          <ArrowUpRight size={18} />
        </a>
      </div>
    </div>

    <div class="contact-panel">
      {#if form?.success}
        <div class="contact-success" role="status">
          <CheckCircle2 size={36} />
          <h3>Pesan Terkirim!</h3>
          <p>
            Terima kasih sudah menghubungi. Saya akan membalas ke email kamu
            secepatnya.
          </p>
        </div>
      {:else}
        <form
          class="contact-form"
          method="POST"
          action="?/contact"
          use:enhance={() => {
            sending = true;
            return async ({ update }) => {
              await update();
              sending = false;
            };
          }}
        >
          {#if form?.error}
            <div class="contact-alert" role="alert">{form.error}</div>
          {/if}

          <!-- Token waktu anti-bot: dibuat server saat halaman dirender. -->
          <input type="hidden" name="_t" value={data.formToken} />

          <!-- Honeypot: disembunyikan dari user, hanya diisi bot. -->
          <div class="hp-field" aria-hidden="true">
            <label for="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="contact-name">Nama</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                placeholder="Nama kamu"
                required
                maxlength="100"
                value={form?.name ?? ""}
              />
            </div>

            <div class="form-field">
              <label for="contact-email">Email</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                placeholder="email@kamu.com"
                required
                maxlength="150"
                value={form?.email ?? ""}
              />
            </div>
          </div>

          <div class="form-field">
            <label for="contact-subject">Subjek</label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              placeholder="Misalnya: Kebutuhan implementasi Odoo"
              minlength="3"
              maxlength="200"
              required
              value={form?.subject ?? ""}
            />
          </div>

          <div class="form-field">
            <label for="contact-message">Pesan</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              placeholder="Ceritakan sedikit tentang project atau ide kamu..."
              required
              maxlength="3000">{form?.message ?? ""}</textarea
            >
          </div>

          <button type="submit" class="contact-submit" disabled={sending}>
            {sending ? "Mengirim..." : "Kirim Pesan"}
            {#if !sending}<Send size={18} />{/if}
          </button>
        </form>
      {/if}
    </div>
  </div>
</section>

<style>
  .contact-section {
    padding: 6rem 0 8rem;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 4.5rem;
    align-items: start;
  }

  .text-orange {
    color: var(--primary);
  }

  /* ===== Kolom kiri: intro ===== */
  .contact-intro {
    position: sticky;
    top: 7rem;
  }

  .contact-eyebrow {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
  }

  .contact-intro h1 {
    display: flex;
    flex-direction: column;
    font-size: clamp(2.25rem, 4vw, 3.25rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
    font-weight: 800;
    margin: 0 0 1.5rem;
    color: var(--text-main);
  }

  .contact-lead {
    max-width: 420px;
    margin: 0 0 3rem;
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--text-muted);
  }

  .contact-alt {
    max-width: 420px;
    border-top: 1px solid color-mix(in srgb, var(--text-muted) 25%, transparent);
    padding-top: 1.25rem;
  }

  .contact-alt-label {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .contact-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-main);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .contact-link-text {
    flex: 1;
  }

  .contact-link small {
    margin-left: 0.4rem;
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--text-muted);
  }

  .contact-link:hover {
    color: var(--primary);
  }

  /* ===== Kolom kanan: form ===== */
  .contact-panel {
    background: var(--bg-card);
    border: 1px solid color-mix(in srgb, var(--text-muted) 22%, transparent);
    border-radius: 1.25rem;
    padding: 2.25rem;
    box-shadow: var(--shadow-sm);
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.15rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .form-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .contact-form input,
  .contact-form textarea {
    width: 100%;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--text-muted) 35%, transparent);
    border-radius: 0.65rem;
    padding: 0.8rem 0.95rem;
    color: var(--text-main);
    font-family: inherit;
    font-size: 0.95rem;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .contact-form textarea {
    resize: vertical;
    min-height: 140px;
    line-height: 1.6;
  }

  .contact-form input::placeholder,
  .contact-form textarea::placeholder {
    color: color-mix(in srgb, var(--text-muted) 70%, transparent);
  }

  .contact-form input:focus,
  .contact-form textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
  }

  .contact-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 0.25rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 0.65rem;
    padding: 0.95rem 1.75rem;
    font-size: 1rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition:
      background 0.2s ease,
      opacity 0.2s ease;
  }

  .contact-submit:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .contact-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .contact-alert {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #dc2626;
    border-radius: 0.65rem;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }

  :global(.dark) .contact-alert {
    color: #fca5a5;
  }

  .contact-success {
    padding: 1.5rem 0.5rem;
    color: #16a34a;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  :global(.dark) .contact-success {
    color: #4ade80;
  }

  .contact-success h3 {
    font-size: 1.35rem;
    font-weight: 800;
    margin: 0.25rem 0 0;
  }

  .contact-success p {
    margin: 0;
    color: var(--text-muted);
  }

  /* Honeypot: harus tetap ada di DOM (bot mengisinya), tapi tak terlihat user. */
  .hp-field {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .contact-section {
      padding: 3rem 0 5rem;
    }

    .contact-grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    .contact-intro {
      position: static;
    }

    .contact-lead {
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 600px) {
    .contact-panel {
      padding: 1.5rem 1.25rem;
    }

    /* Nama & email jadi satu kolom di layar kecil. */
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
