<script lang="ts">
  import { CheckCircle2, Send, Mail } from "lucide-svelte";
  import { enhance } from "$app/forms";

  let { data, form } = $props();

  // Status kirim form kontak (untuk disable tombol & ubah labelnya).
  let sending = $state(false);
</script>

<svelte:head>
  <title>Kontak — Chelvyn Kleden | Odoo Technical Consultant</title>
</svelte:head>

<section class="contact-section">
  <div class="container">
    <div class="contact-card-main">
      <div class="contact-glow"></div>
      <span class="section-tag">Kontak</span>
      <h2 class="contact-title">
        <span>Mari Mulai</span>
        <span class="text-orange">Sesuatu yang Besar.</span>
      </h2>
      <p>
        Punya ide project atau ingin diskusi tentang Odoo & Fullstack
        development? Saya selalu terbuka untuk kolaborasi baru.
      </p>

      <div class="contact-status">
        <span class="badge-dot"></span>
        {data.siteStatus}
      </div>

      {#if form?.success}
        <div class="contact-success" role="status">
          <CheckCircle2 size={40} />
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

      <div class="contact-options">
        <a
          href="https://t.me/kledenvin"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-box"
        >
          <div class="contact-icon">
            <Send size={24} />
          </div>
          <div class="contact-info">
            <h3>Telegram</h3>
            <p>@kledenvin</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .contact-section {
    padding: 6rem 0 8rem;
  }

  .text-orange {
    color: var(--primary);
  }

  .section-tag {
    display: inline-block;
    color: var(--primary);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    position: relative;
    flex-shrink: 0;
  }

  .contact-card-main {
    position: relative;
    overflow: hidden;
    background: linear-gradient(160deg, #111827, #0b1120);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 2rem;
    padding: 4rem 3rem;
    text-align: center;
    color: #e2e8f0;
  }

  /* Cahaya oranye dekoratif di kartu kontak */
  .contact-glow {
    position: absolute;
    top: -40%;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(249, 115, 22, 0.18),
      transparent 65%
    );
    pointer-events: none;
  }

  .contact-card-main > :global(*:not(.contact-glow)) {
    position: relative;
    z-index: 1;
  }

  .contact-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 0.5rem 1.15rem;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 2.5rem;
  }

  .contact-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 2.75rem;
    line-height: 1.15;
    margin: 0 0 1.25rem;
    font-weight: 800;
  }

  .contact-card-main p {
    color: #94a3b8;
    max-width: 550px;
    margin: 0 auto 1.75rem;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  /* ===== Form kontak ===== */
  .contact-form {
    max-width: 640px;
    margin: 0 auto 2.5rem;
    text-align: left;
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
    gap: 0.5rem;
  }

  .form-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.02em;
  }

  .contact-form input,
  .contact-form textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.85rem;
    padding: 0.85rem 1rem;
    color: inherit;
    font-family: inherit;
    font-size: 0.95rem;
    transition:
      border-color 0.25s ease,
      background 0.25s ease;
  }

  .contact-form textarea {
    resize: vertical;
    min-height: 130px;
    line-height: 1.6;
  }

  .contact-form input::placeholder,
  .contact-form textarea::placeholder {
    color: #64748b;
  }

  .contact-form input:focus,
  .contact-form textarea:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.06);
  }

  .contact-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 0.85rem;
    padding: 0.9rem 1.75rem;
    font-size: 1rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }

  .contact-submit:hover:not(:disabled) {
    transform: translateY(-3px);
  }

  .contact-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .contact-alert {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
    border-radius: 0.85rem;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }

  .contact-success {
    max-width: 640px;
    margin: 0 auto 2.5rem;
    padding: 2.5rem 2rem;
    background: rgba(34, 197, 94, 0.07);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 1.5rem;
    color: #4ade80;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .contact-success h3 {
    font-size: 1.35rem;
    font-weight: 800;
    margin: 0.25rem 0 0;
  }

  /* Honeypot: harus tetap ada di DOM (bot mengisinya), tapi tak terlihat user. */
  .hp-field {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .contact-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 420px;
    margin: 0 auto;
    align-items: stretch;
  }

  .contact-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.5rem 2rem;
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
    color: inherit;
  }

  .contact-box:hover {
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-8px);
    border-color: var(--primary);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }

  .contact-icon {
    font-size: 1.75rem;
    background: rgba(255, 255, 255, 0.05);
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1.15rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
    line-height: 1;
  }

  .contact-box:hover .contact-icon {
    background: var(--primary);
    color: white;
    transform: rotate(-10deg);
  }

  .contact-info h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.2rem;
    color: #f1f5f9;
  }

  .contact-info p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .contact-section {
      padding: 3rem 0 5rem;
    }

    .contact-card-main {
      padding: 3rem 1rem;
      border-radius: 1.5rem;
      margin: 0 0.5rem;
    }

    .contact-title {
      font-size: 1.75rem;
    }

    .contact-options {
      grid-template-columns: 1fr;
      width: 100%;
    }

    /* Nama & email jadi satu kolom di layar kecil. */
    .form-row {
      grid-template-columns: 1fr;
    }

    .contact-box {
      padding: 1rem;
      gap: 1rem;
    }

    .contact-icon {
      width: 50px;
      height: 50px;
    }

    .contact-info p {
      font-size: 0.8125rem;
      word-break: break-all;
    }
  }
</style>
