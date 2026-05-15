import React, { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const SUPERADMIN_EMAIL = (process.env.REACT_APP_SUPERADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || 'mrosani22@premium.edu.my').trim().toLowerCase();
const COMPANY_NAME = 'Premium Language Centre';
const LOGO_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co/storage/v1/object/public/pictures/plc-logo.png';

const styles = `
  :root {
    --bg-app: #f3f5f9;
    --bg-card: #ffffff;
    --text-primary: #1f2937;
    --text-muted: #6b7280;
    --border-soft: #e5e7eb;
    --shadow-soft: 0 8px 30px rgba(15, 23, 42, 0.08);
    --brand-500: #CC0000;
    --brand-700: #990000;
    --radius-md: 10px;
    --radius-sm: 6px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
  }
  [data-theme='dark'] {
    --bg-app: #0f172a;
    --bg-card: #111827;
    --text-primary: #e5e7eb;
    --text-muted: #9ca3af;
    --border-soft: #374151;
    --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.5);
  }
  [data-theme='dark'] .login-brand-panel {
    background: #111827;
    border-right-color: #374151;
  }
  [data-theme='dark'] .brand-title { color: #f3f4f6; }
  [data-theme='dark'] .brand-pill { background: #0b1220; color: #e5e7eb; border-color: #374151; }
  [data-theme='dark'] .login-box input,
  [data-theme='dark'] .login-box select {
    background: #111827;
    color: #e5e7eb;
    border-color: #374151;
  }
  [data-theme='dark'] .auth-chip.active { background: #1f2937; color: #f3f4f6; }
  [data-theme='dark'] .auth-mode-switch { background: #0b1220; border-color: #374151; }
  [data-theme='dark'] .results-table th { background: #1f2937; color: #e5e7eb; border-bottom-color: #374151; }
  [data-theme='dark'] .results-table td { color: #e5e7eb; border-bottom-color: #374151; }
  [data-theme='dark'] .results-table tbody tr:nth-child(even) { background: #0b1220; }
  [data-theme='dark'] .results-table tr:hover { background: #1e293b; }
  [data-theme='dark'] .question-box h3,
  [data-theme='dark'] .progress-text,
  [data-theme='dark'] .progress-title { color: #e5e7eb; }
  [data-theme='dark'] .passage { background: #1f2937; color: #e5e7eb; }
  [data-theme='dark'] .option-button { background: #111827; color: #f3f4f6; border-color: #374151; }
  [data-theme='dark'] .option-button:hover { background: #1f2937; border-color: #ef4444; }
  [data-theme='dark'] .timer-box { background: #1f2937; border-color: #f59e0b; }
  [data-theme='dark'] .timer-display { color: #fbbf24; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: var(--bg-app); color: var(--text-primary); }
  .app { min-height: 100vh; background-color: var(--bg-app); }
  .card-surface { background: var(--bg-card); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); }
  .header { background: linear-gradient(135deg, #CC0000 0%, #990000 100%); color: white; padding: 10px 20px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 70px; }
  .header-logo { height: 40px; width: auto; object-fit: contain; flex-shrink: 0; margin-top: 0; }
  .header-content { flex: 1; text-align: center; padding: 0; }
  .header h1 { font-size: 26px; margin: 0; margin-bottom: 2px; }
  .subtitle { font-size: 12px; opacity: 0.95; margin: 0; }
  .login-container { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 120px); padding: 20px; }
  .login-shell { width: 100%; max-width: 980px; display: grid; grid-template-columns: 0.95fr 1.05fr; background: var(--bg-card); border-radius: 18px; box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); overflow: hidden; }
  .login-brand-panel { background: linear-gradient(160deg, #fff5f5 0%, #fff 100%); border-right: 1px solid var(--border-soft); padding: 34px; display: flex; flex-direction: column; justify-content: center; gap: 18px; }
  .brand-kicker { font-size: 12px; letter-spacing: 0.08em; color: #b91c1c; font-weight: 700; text-transform: uppercase; }
  .brand-title { font-size: 34px; line-height: 1.15; color: #b91c1c; font-weight: 800; }
  .brand-copy { font-size: 14px; line-height: 1.6; color: var(--text-muted); }
  .brand-list { display: grid; gap: 10px; margin-top: 6px; }
  .brand-pill { border: 1px solid #fecaca; color: #991b1b; background: #fff; border-radius: 999px; padding: 8px 12px; font-size: 12px; width: fit-content; }
  .login-box { background: var(--bg-card); padding: 36px; width: 100%; max-height: 80vh; overflow-y: auto; }
  .login-box h1 { color: var(--brand-500); font-size: 24px; margin-bottom: 10px; }
  .auth-subtitle { font-size: 14px; color: var(--text-muted); margin: 0 0 20px 0; }
  .field-help { margin-top: -8px; margin-bottom: 10px; color: var(--text-muted); font-size: 12px; }
  .login-box input, .login-box select { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid var(--border-soft); border-radius: var(--radius-sm); font-size: 14px; }
  .login-box input:focus, .login-box select:focus { outline: none; border-color: #CC0000; box-shadow: 0 0 5px rgba(204, 0, 0, 0.2); }
  .primary-button { width: 100%; padding: 12px; background-color: var(--brand-500); color: white; border: none; border-radius: var(--radius-sm); font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.3s; }
  .primary-button:hover { background-color: var(--brand-700); }
  .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }
  .error-message { background-color: #fee; color: #c00; padding: 12px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; }
  .code-label { font-size: 12px; color: #ff9800; margin-bottom: 5px; display: block; }
  .code-input { background-color: #fff9e6 !important; border-color: #ffc107 !important; }
  .form-section { margin-bottom: 20px; }
  .form-section-title { font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
  .toggle-auth { text-align: center; margin-top: 20px; font-size: 14px; }
  .auth-mode-switch { display: inline-flex; border: 1px solid var(--border-soft); background: #f9fafb; border-radius: 999px; padding: 3px; margin-bottom: 20px; }
  .auth-chip { border: none; background: transparent; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #6b7280; cursor: pointer; }
  .auth-chip.active { background: #fff; color: #b91c1c; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  .link-button { background: none; border: none; color: #CC0000; cursor: pointer; text-decoration: underline; margin-left: 5px; }
  .test-screen { max-width: 900px; margin: 0 auto; padding: 20px; }
  .test-header { background: var(--bg-card); padding: 15px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); }
  .progress-tracker { flex: 1; }
  .progress-title { font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; }
  .progress-bar { background-color: #e0e0e0; border-radius: 10px; height: 30px; overflow: hidden; margin-bottom: 5px; }
  .progress-fill { background: linear-gradient(90deg, #4caf50 0%, #45a049 100%); height: 100%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
  .progress-text { font-size: 13px; color: #333; font-weight: bold; }
  .timer-box { background-color: #fff9e6; border: 2px solid #ffc107; padding: 12px 20px; border-radius: 6px; text-align: center; }
  .timer-label { font-size: 11px; color: #ff9800; font-weight: bold; margin-bottom: 3px; }
  .timer-display { font-size: 24px; font-weight: bold; color: #cc6600; font-family: 'Courier New', monospace; }
  .test-intro { background: var(--bg-card); padding: 40px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); text-align: center; }
  .test-intro h1 { color: var(--brand-500); margin-bottom: 20px; }
  .description { color: var(--text-muted); margin-bottom: 30px; line-height: 1.6; }
  .test-info { background-color: var(--bg-app); border: 2px dashed #CC0000; padding: 20px; margin-bottom: 30px; border-radius: 4px; }
  .test-info h3 { color: #CC0000; margin-bottom: 15px; text-align: left; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; }
  .info-grid div { padding: 8px; font-size: 14px; }
  .disclaimer { color: #999; font-size: 12px; margin-top: 20px; }
  .question-box { background: var(--bg-card); padding: 30px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); }
  .question-box h3 { margin-bottom: 20px; color: #333; line-height: 1.6; }
  .passage { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #CC0000; margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .option-button { padding: 12px; border: 2px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
  .option-button:hover { border-color: #CC0000; background-color: #fff5f5; }
  .results { background: var(--bg-card); padding: 40px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); text-align: center; }
  .results h2 { margin-bottom: 30px; color: var(--text-primary); }
  .pending-box { background-color: #fff9e6; border: 2px solid #ffc107; padding: 30px; border-radius: 4px; margin-bottom: 30px; }
  .pending-box h3 { color: #ff9800; margin-bottom: 15px; font-size: 20px; }
  .pending-box p { color: #666; margin-bottom: 10px; line-height: 1.6; }
  .dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .dashboard-header { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 20px; border-radius: var(--radius-md); margin-bottom: 20px; box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); }
  .dashboard-header h1 { color: var(--brand-500); margin: 0; }
  .header-actions { display: flex; gap: 20px; align-items: center; }
  .logout-button { padding: 10px 20px; background-color: var(--brand-500); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: bold; }
  .logout-button:hover { background-color: var(--brand-700); }
  .theme-toggle { padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.12); color: white; cursor: pointer; }
  .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
  .tab { padding: 10px 20px; background: var(--bg-card); border: 2px solid var(--border-soft); border-radius: var(--radius-sm); cursor: pointer; font-weight: bold; transition: all 0.3s; }
  .tab.active { background-color: var(--brand-500); color: white; border-color: var(--brand-500); }
  .tab-content { background: var(--bg-card); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); }
  .results-table { width: 100%; border-collapse: collapse; }
  .results-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
  .results-table td { padding: 12px; border-bottom: 1px solid #ddd; }
  .results-table tbody tr:nth-child(even) { background-color: #fcfcfc; }
  .results-table tr:hover { background-color: #f9f9f9; }
  .dashboard-toolbar { display: flex; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; }
  .dashboard-search { min-width: 260px; max-width: 380px; width: 100%; padding: 10px 12px; border: 1px solid var(--border-soft); border-radius: var(--radius-sm); }
  .status-chip { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .status-chip.pending { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
  .status-chip.approved { background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; }
  .status-chip.rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .banner { border: 1px solid; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; text-align: left; font-size: 14px; line-height: 1.5; }
  .banner.info { background: #eff6ff; border-color: #bfdbfe; color: #1e3a8a; }
  .banner.pending { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
  .banner.approved { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
  .banner.rejected { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
  [data-theme='dark'] .banner.info { background: #172554; border-color: #1e3a8a; color: #dbeafe; }
  [data-theme='dark'] .banner.pending { background: #431407; border-color: #7c2d12; color: #fed7aa; }
  [data-theme='dark'] .banner.approved { background: #052e16; border-color: #14532d; color: #bbf7d0; }
  [data-theme='dark'] .banner.rejected { background: #450a0a; border-color: #7f1d1d; color: #fecaca; }
  [data-theme='dark'] .pending-box { background-color: #1a1a2e; border-color: #ff9800; }
  [data-theme='dark'] .pending-box h3 { color: #fbbf24; }
  [data-theme='dark'] .pending-box p { color: #d1d5db; }
  [data-theme='dark'] .question-item { background-color: #1f2937; color: #e5e7eb; }
  [data-theme='dark'] .question-item p { color: #e5e7eb; }
  [data-theme='dark'] .modal-section h3 { color: #f3f4f6; }
  [data-theme='dark'] .disclaimer { color: #94a3b8; }
  [data-theme='dark'] .test-info { background-color: #0b1220; border-color: #ef4444; }
  [data-theme='dark'] .test-info h3 { color: #fca5a5; }
  [data-theme='dark'] .student-stat { background: #0b1220; border-color: #374151; }
  [data-theme='dark'] .code-input { background-color: #1f2937 !important; border-color: #f59e0b !important; color: #fde68a !important; }
  [data-theme='dark'] .error-message { background-color: #450a0a; color: #fecaca; }
  .note-warning { background: #fff9e6; border-left: 4px solid #ffc107; color: #5a4604; padding: 10px; border-radius: 4px; }
  [data-theme='dark'] .note-warning { background: #2b2614; border-left-color: #f59e0b; color: #fde68a; }
  .note-info { background: #eff6ff; border: 1px solid #ffc107; color: #5a4604; padding: 12px 15px; border-radius: 4px; }
  [data-theme='dark'] .note-info { background: #1a1a2e; border-color: #f59e0b; color: #fed7aa; }
  .row-action-group { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .row-action { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; line-height: 1; border: 1px solid var(--border-soft); background: var(--bg-card); color: var(--text-primary); cursor: pointer; transition: background-color 0.15s, border-color 0.15s, color 0.15s; }
  .row-action:hover { background: var(--bg-app); border-color: #9ca3af; }
  .row-action:disabled { opacity: 0.5; cursor: not-allowed; }
  .row-action.success { background: #15803d; border-color: #15803d; color: #fff; }
  .row-action.success:hover { background: #166534; border-color: #166534; }
  .row-action.warning { background: #b45309; border-color: #b45309; color: #fff; }
  .row-action.warning:hover { background: #92400e; border-color: #92400e; }
  .row-state { display: inline-flex; align-items: center; gap: 4px; padding: 6px 8px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
  .row-state.success { color: #15803d; }
  .results-table tr.row-official td { background: linear-gradient(to right, rgba(250, 204, 21, 0.08), transparent 30%); }
  [data-theme='dark'] .results-table tr.row-official td { background: linear-gradient(to right, rgba(250, 204, 21, 0.18), transparent 30%); }
  .table-wrap { overflow-x: auto; border: 1px solid var(--border-soft); border-radius: var(--radius-sm); }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal { background: var(--bg-card); padding: 30px; border-radius: var(--radius-md); max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; border: 1px solid var(--border-soft); box-shadow: var(--shadow-soft); }
  .modal h2 { color: var(--brand-500); margin-bottom: 20px; }
  .modal-section { margin-bottom: 20px; }
  .student-dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }
  .student-stat { background: var(--bg-app); border: 1px solid var(--border-soft); border-radius: 8px; padding: 12px; text-align: left; }
  .student-stat .label { font-size: 12px; color: var(--text-muted); }
  .student-stat .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
  .modal-section h3 { color: #333; margin-bottom: 10px; font-size: 16px; }
  .modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); }
  .modal-close:hover { color: var(--text-primary); }
  .question-item { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; }
  .question-correct { border-left: 4px solid #4caf50; }
  .question-wrong { border-left: 4px solid #f44336; }
  .correct-badge { color: #4caf50; font-weight: bold; }
  .wrong-badge { color: #f44336; font-weight: bold; }
  .notranslate { translate: no; }
  .approve-button { padding: 10px 20px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
  .approve-button:hover { background-color: #45a049; }
  .textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; min-height: 80px; }
  @media (max-width: 600px) { 
    .options { grid-template-columns: 1fr; }
    .info-grid { grid-template-columns: 1fr; }
    .test-header { flex-direction: column; gap: 15px; }
    .dashboard-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  }
  @media (max-width: 900px) {
    .login-shell { grid-template-columns: 1fr; }
    .login-brand-panel { border-right: none; border-bottom: 1px solid var(--border-soft); }
    .login-brand-panel img { margin: 0 auto; }
    .brand-title, .brand-copy { text-align: center; }
    .brand-list { justify-items: center; }
  }
`;

// API Helper
const api = {
  _runtimeConfigPromise: null,
  _resolvedConfig: null,
  _runtimeConfigError: null,
  async resolveSupabaseConfig() {
    if (this._resolvedConfig) return this._resolvedConfig;

    const localConfig = {
      url: SUPABASE_URL,
      key: SUPABASE_KEY
    };

    if (localConfig.url && localConfig.key) {
      this._resolvedConfig = localConfig;
      return this._resolvedConfig;
    }

    if (!this._runtimeConfigPromise) {
      const runtimeConfigUrl = `${window.location.origin}/api/runtime-config`;
      this._runtimeConfigPromise = fetch(runtimeConfigUrl, { cache: 'no-store' })
        .then(async (response) => {
          const payload = await this.parseResponse(response);
          if (!response.ok) {
            throw new Error(payload?.error || `Unable to load runtime config (${response.status})`);
          }
          return {
            url: payload.supabaseUrl || localConfig.url,
            key: payload.supabaseAnonKey || localConfig.key
          };
        })
        .catch((error) => {
          console.error('Runtime config error:', error);
          this._runtimeConfigError = error;
          return localConfig;
        });
    }

    this._resolvedConfig = await this._runtimeConfigPromise;
    return this._resolvedConfig;
  },
  async parseResponse(response) {
    const raw = await response.text();
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return { error: raw || `HTTP ${response.status}` };
    }
  },
  async request(method, path, body = null, authToken = null) {
    const config = await this.resolveSupabaseConfig();
    if (!config?.url) throw new Error('Missing Supabase URL env (REACT_APP_SUPABASE_URL or SUPABASE_URL).');
    if (!config?.key) {
      const runtimeError = this._runtimeConfigError?.message
        ? ` Runtime config endpoint error: ${this._runtimeConfigError.message}.`
        : '';
      throw new Error(`Missing Supabase anon key env (REACT_APP_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY).${runtimeError}`);
    }
    const token = authToken || localStorage.getItem('sb-token');
    const headers = { 'Content-Type': 'application/json', 'apikey': config.key };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    try {
      const response = await fetch(`${config.url}${path}`, options);
      if (!response.ok) {
        const error = await response.text();
        console.error('API Error:', response.status, error);
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  async signup(email, password, role, fullName, passportId, country, registrationCode = null) {
    // Normalize email to lowercase BEFORE the auth call so the auth.users row
    // and the public.users / public.students rows agree on casing. Supabase
    // Auth normalizes internally too, but doing it up-front prevents any
    // mismatch from downstream exact-match queries.
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Pass registration_code in user metadata so the auth.users INSERT trigger
    // (migration 005) can atomically consume the code in the same transaction
    // as the signup. This replaces the old client-side /api/consume-registration-code
    // round-trip, which was vulnerable to stale browser caches skipping the
    // call entirely.
    const signupBody = { email: normalizedEmail, password };
    const metadata = {};
    if (registrationCode) metadata.registration_code = String(registrationCode).trim();
    if (fullName)         metadata.full_name        = fullName;
    if (Object.keys(metadata).length > 0) signupBody.data = metadata;
    const result = await this.request('POST', '/auth/v1/signup', signupBody);

    if (!result?.user?.id) {
      throw new Error('Authentication failed: signup returned no user.');
    }
    if (!result?.access_token) {
      // Most likely cause: Supabase Auth "Confirm email" is enabled. The user
      // exists but cannot be authenticated until they click the confirmation
      // link. Surface this clearly rather than silently leaving them with no
      // public.users / public.students rows.
      throw new Error('Account created, but email confirmation is required. Please check your inbox, click the confirmation link, then return here to sign in. If you do not see the email, contact your teacher.');
    }

    // Helper: run a request with one retry on transient failure so a brief
    // network blip during signup doesn't leave us with an orphaned auth user.
    const withRetry = async (fn) => {
      try { return await fn(); }
      catch (err) {
        await new Promise((r) => setTimeout(r, 500));
        return await fn();
      }
    };

    try {
      await withRetry(() => this.request('POST', '/rest/v1/users', {
        id: result.user.id,
        email: normalizedEmail,
        role,
        full_name: fullName
      }, result.access_token));
    } catch (err) {
      console.error('signup: failed to create users row after retry', err);
      throw new Error('Account created but profile setup failed. Please contact your teacher with this message: users-row-insert-failed.');
    }

    if (role === 'student') {
      try {
        await withRetry(() => this.request('POST', '/rest/v1/students', {
          user_id: result.user.id,
          email: normalizedEmail,
          full_name: fullName,
          passport_id: passportId,
          country: country
        }, result.access_token));
      } catch (err) {
        console.error('signup: failed to create students row after retry', err);
        throw new Error('Account created but student record setup failed. Please contact your teacher with this message: students-row-insert-failed.');
      }
    }

    return result;
  },
  async validateRegistration(role, registrationCode) {
    const response = await fetch('/api/validate-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, registrationCode })
    });
    const data = await response.json();
    if (!response.ok || !data?.valid) {
      throw new Error(data?.error || 'Registration is not allowed.');
    }
    return data;
  },
  async consumeRegistrationCode(registrationCode, email) {
    const response = await fetch('/api/consume-registration-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationCode, email })
    });
    const data = await response.json();
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || 'Unable to record registration code usage.');
    }
    return data;
  },
  login(email, password) { return this.request('POST', '/auth/v1/token?grant_type=password', { email, password }); },
  async getUserRole(userId) {
    try {
      const data = await this.request('GET', `/rest/v1/users?id=eq.${userId}&select=role`);
      return data?.[0]?.role || 'student';
    } catch { return 'student'; }
  },
  getAllQuestions() {
    return this.request('GET', '/rest/v1/questions?select=*&limit=800').then((rows) => {
      const list = Array.isArray(rows) ? rows : [];
      return list.map((q) => ({
        ...q,
        difficulty_score: Number(q.difficulty_score ?? q.difficulty ?? 5),
        options: Array.isArray(q.options)
          ? q.options
          : typeof q.options === 'string'
            ? q.options.split(',').map((v) => v.trim()).filter(Boolean)
            : []
      }));
    });
  },
  // Resolves the user's students.id; falls back to userId for legacy rows
  // not yet migrated to the new FK pattern.
  async resolveStudentId(userId) {
    try {
      const rows = await this.request('GET', `/rest/v1/students?user_id=eq.${userId}&select=id`);
      return rows?.[0]?.id || userId;
    } catch {
      return userId;
    }
  },
  ATTEMPT_FIELDS: 'id,student_id,attempt_no,status,overall_score,determined_cefr_level,ability_estimate,submitted_at,reviewed_at,reviewed_by,teacher_comment,official_for_placement,retake_granted,retake_granted_at,student_responses',
  async getStudentAttempts(userId) {
    const studentId = await this.resolveStudentId(userId);
    const select = this.ATTEMPT_FIELDS;
    const [byStudentId, byUserId] = await Promise.all([
      this.request('GET', `/rest/v1/test_results?student_id=eq.${studentId}&select=${select}&order=attempt_no.desc`).catch(() => []),
      studentId !== userId
        ? this.request('GET', `/rest/v1/test_results?student_id=eq.${userId}&select=${select}&order=attempt_no.desc`).catch(() => [])
        : Promise.resolve([])
    ]);
    const merged = [...(byStudentId || []), ...(byUserId || [])];
    const unique = Array.from(new Map(merged.map(r => [r.id, r])).values());
    return unique.sort((a, b) => (b.attempt_no || 0) - (a.attempt_no || 0));
  },
  async submitAttempt({ studentId, overall_score, determined_cefr_level, ability_estimate, student_responses }) {
    const existing = await this.request('GET', `/rest/v1/test_results?student_id=eq.${studentId}&select=attempt_no&order=attempt_no.desc&limit=1`).catch(() => []);
    const nextAttemptNo = ((existing?.[0]?.attempt_no) || 0) + 1;
    const payload = {
      student_id: studentId,
      attempt_no: nextAttemptNo,
      status: 'pending',
      overall_score,
      determined_cefr_level,
      ability_estimate,
      student_responses,
      submitted_at: new Date().toISOString()
    };
    return this.request('POST', '/rest/v1/test_results', payload);
  },
  approveAttempt(id, { comment, reviewerId, makeOfficial }) {
    return this.request('PATCH', `/rest/v1/test_results?id=eq.${id}`, {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      teacher_comment: comment || null,
      ...(makeOfficial ? { official_for_placement: true } : {})
    });
  },
  rejectAttempt(id, { comment, reviewerId }) {
    return this.request('PATCH', `/rest/v1/test_results?id=eq.${id}`, {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      teacher_comment: comment,
      retake_granted: true,
      retake_granted_by: reviewerId,
      retake_granted_at: new Date().toISOString()
    });
  },
  grantRetake(id, reviewerId) {
    return this.request('PATCH', `/rest/v1/test_results?id=eq.${id}`, {
      retake_granted: true,
      retake_granted_by: reviewerId,
      retake_granted_at: new Date().toISOString()
    });
  },
  // The partial unique index uniq_test_results_one_official_per_student rejects
  // two trues for the same student, so clear all siblings before setting the new one.
  async setOfficial(id, studentId) {
    await this.request('PATCH', `/rest/v1/test_results?student_id=eq.${studentId}&official_for_placement=eq.true`, {
      official_for_placement: false
    });
    return this.request('PATCH', `/rest/v1/test_results?id=eq.${id}`, {
      official_for_placement: true
    });
  },
  getAllResults() {
    return this.request('GET', `/rest/v1/test_results?select=*,students(id,email,full_name,passport_id,country)&order=attempt_no.desc`);
  },
  getQuestionBank() {
    return this.request('GET', '/rest/v1/questions?select=*');
  },
  createQuestion(payload) {
    return this.request('POST', '/rest/v1/questions', payload);
  },
  updateQuestion(id, payload) {
    return this.request('PATCH', `/rest/v1/questions?id=eq.${id}`, payload);
  },
  async getManagedUsers() {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to load users');
    return data.users || [];
  },
  async updateManagedUserRole(userId, role, fullName, passportId, country) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, role, fullName, passportId, country })
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to update role');
    return data;
  },
  async createManagedUser(payload) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to create user');
    return data;
  },
  async sendUserResetLink(email) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'send_reset', email })
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to generate reset link');
    return data;
  },
  async deleteManagedUser(userId) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to delete user');
    return data;
  }
  ,
  async adminCreateStudents(registrationCode, students) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-create-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ registrationCode, students })
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to create students.');
    return data.results || [];
  },
  async adminDeleteAttempt(attemptId) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-delete-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ attemptId })
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to delete attempt.');
    return data;
  },
  async getRegistrationCodes() {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/registration-codes', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to load registration codes');
    return data.codes || [];
  },
  async createRegistrationCode(payload) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/registration-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to create registration code');
    return data;
  },
  async toggleRegistrationCode(id, isActive) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/registration-codes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, isActive })
    });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to update code');
    return data;
  },
  async getRegistrationCodeUsage(codeId) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch(`/api/registration-codes?codeId=${codeId}`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
    const data = await this.parseResponse(response);
    if (!response.ok) throw new Error(data?.error || 'Unable to load usage history');
    return data.usage || [];
  }
};

// Helper Functions
function selectNextQuestion(questionsBank, currentDifficulty, userResponses) {
  const answeredIds = new Set(userResponses.map(r => r.question_id));
  const askedQuestionTexts = new Set(
    userResponses
      .map((r) => questionsBank.find(qb => qb.id === r.question_id)?.question_text?.trim())
      .filter(Boolean)
  );
  const skillTargets = { grammar: 8, vocabulary: 7, reading: 8, listening: 7 };
  const skillCounts = { grammar: 0, vocabulary: 0, reading: 0, listening: 0 };
  userResponses.forEach((r) => {
    const q = questionsBank.find(qb => qb.id === r.question_id);
    const skill = q?.skill;
    if (skill && skillCounts[skill] !== undefined) skillCounts[skill] += 1;
  });
  const underTargetSkills = Object.keys(skillTargets).filter(skill => skillCounts[skill] < skillTargets[skill]);

  // Late-test ceiling probe: in items 21+, strong test-takers get items pinned
  // ABOVE their running ability instead of within the symmetric ±1.5 band.
  // Without this, the 30-item budget can run out before a true C1 candidate
  // ever sees difficulty 8+ content, leaving them mis-placed at B2.
  const correctSoFar = userResponses.filter(r => r.is_correct).length;
  const accuracy = userResponses.length > 0 ? correctSoFar / userResponses.length : 0;
  const forceCeilingProbe = userResponses.length >= 20 && currentDifficulty >= 6.5 && accuracy >= 0.6;

  const minDiff = forceCeilingProbe
    ? Math.max(1, currentDifficulty + 0.3)
    : Math.max(1, currentDifficulty - 1.5);
  const maxDiff = Math.min(10, currentDifficulty + 1.5);
  const suitable = questionsBank.filter(q => {
    if (!q.id || answeredIds.has(q.id)) return false;
    if (q.question_text && askedQuestionTexts.has(q.question_text.trim())) return false;
    const qDiff = q.difficulty_score || 5;
    return qDiff >= minDiff && qDiff <= maxDiff;
  });

  // Priority 1: in-band and under-target skills
  const inBandUnderTarget = suitable.filter(q => underTargetSkills.includes(q.skill));
  if (inBandUnderTarget.length > 0) {
    return inBandUnderTarget[Math.floor(Math.random() * inBandUnderTarget.length)];
  }

  // Priority 2: under-target skills regardless of difficulty band
  const underTargetAnyBand = questionsBank.filter(q =>
    q.id &&
    !answeredIds.has(q.id) &&
    underTargetSkills.includes(q.skill) &&
    (!q.question_text || !askedQuestionTexts.has(q.question_text.trim()))
  );
  if (underTargetAnyBand.length > 0) {
    return underTargetAnyBand[Math.floor(Math.random() * underTargetAnyBand.length)];
  }

  // Priority 3: any remaining in-band
  if (suitable.length > 0) {
    return suitable[Math.floor(Math.random() * suitable.length)];
  }

  // Priority 4: any remaining question
  const remaining = questionsBank.filter(q =>
    q.id &&
    !answeredIds.has(q.id) &&
    (!q.question_text || !askedQuestionTexts.has(q.question_text.trim()))
  );
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function calculateDifficulty(responses) {
  if (responses.length === 0) return 5;
  let difficulty = 5;
  for (const r of responses) difficulty += r.is_correct ? 0.8 : -0.6;
  return Math.max(1, Math.min(10, difficulty));
}

function determineCEFRLevel(responses) {
  const totalCorrect = responses.filter(r => r.is_correct).length;
  const fallback = { cefrLevel: 'A1', abilityEstimate: 1, needsTeacherReview: true };
  if (!responses?.length) return fallback;

  const avgDifficulty = (items) => {
    if (!items.length) return 1;
    const total = items.reduce((sum, r) => sum + (Number(r.difficulty_at_time) || 1), 0);
    return total / items.length;
  };

  const lastTen = responses.slice(-10);
  const lastTenCorrect = lastTen.filter(r => r.is_correct);
  const allCorrect = responses.filter(r => r.is_correct);
  const abilityEstimate = lastTenCorrect.length >= 4 ? avgDifficulty(lastTenCorrect) : avgDifficulty(allCorrect);

  if (totalCorrect < 8) {
    return { cefrLevel: 'A1', abilityEstimate, needsTeacherReview: true };
  }

  if (abilityEstimate < 2.5) return { cefrLevel: 'A1', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 4.0) return { cefrLevel: 'A2', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 5.5) return { cefrLevel: 'B1', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 7.5) return { cefrLevel: 'B2', abilityEstimate, needsTeacherReview: false };
  // Soft ceiling at C1+ per spec §6.5: PLC-CPT does not distinguish C1 from C2.
  // Any result at or above C1 is referred for oral interview confirmation.
  return { cefrLevel: 'C1+', abilityEstimate, needsTeacherReview: true };
}

// True for any result requiring oral-interview confirmation per spec §6.5.
// Accepts legacy 'C1' / 'C2' labels persisted before the soft-ceiling change.
function isC1Plus(level) {
  return level === 'C1+' || level === 'C1' || level === 'C2';
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// student_responses is jsonb on the new schema and PostgREST returns it as an
// array directly. Legacy rows persisted it as a JSON-encoded string. Accept either.
function parseResponses(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

// Single source of truth for "can this student start a new attempt?"
// Latest attempt (highest attempt_no) determines the gate:
//   pending                          → locked, waiting on teacher
//   approved + retake_granted=false  → locked, must request retake
//   approved + retake_granted=true   → unlocked
//   rejected                         → unlocked (auto-granted retake)
//   no attempts                      → unlocked (first attempt)
function computeStudentLockState(attempts) {
  const list = Array.isArray(attempts) ? attempts : [];
  const sorted = [...list].sort((a, b) => (b.attempt_no || 0) - (a.attempt_no || 0));
  const latest = sorted[0] || null;
  const official = list.find(a => a.official_for_placement) || null;

  if (!latest) {
    return { locked: false, reason: 'first_attempt', latest: null, official: null };
  }
  const status = (latest.status || '').toLowerCase();
  if (status === 'pending') {
    return { locked: true, reason: 'pending_review', latest, official };
  }
  if (status === 'approved') {
    if (latest.retake_granted) {
      return { locked: false, reason: 'retake_granted', latest, official };
    }
    return { locked: true, reason: 'approved_awaiting_retake', latest, official };
  }
  if (status === 'rejected') {
    return { locked: false, reason: 'rejected_retake_auto', latest, official };
  }
  return { locked: false, reason: 'unknown', latest, official };
}

// ============ LOGIN SCREEN WITH FULL REGISTRATION ============
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [country, setCountry] = useState('');
  const [countryOther, setCountryOther] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!registrationCode || registrationCode.trim() === '') {
          setError('Registration code is required.');
          setLoading(false);
          return;
        }
        if (!fullName.trim()) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        if (!passportId.trim()) {
          setError('Passport/ID number is required.');
          setLoading(false);
          return;
        }
        if (!country) {
          setError('Country is required.');
          setLoading(false);
          return;
        }
        if (country === 'Other' && !countryOther.trim()) {
          setError('Please specify your country.');
          setLoading(false);
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const normalizedLoginEmail = email.trim().toLowerCase();
      const trimmedCode = registrationCode.trim();

      if (isSignup) {
        // CHECK only — does not increment used_count. The code is consumed
        // after Supabase Auth signup succeeds, so failed signups don't burn
        // slots.
        await api.validateRegistration('student', trimmedCode);
      }

      // If "Other" was selected, store the student's actual country in
      // students.country instead of the literal string "Other" — keeps data
      // analysable later.
      const resolvedCountry = country === 'Other' ? countryOther.trim() : country;

      const result = isSignup
        ? await api.signup(normalizedLoginEmail, password, 'student', fullName, passportId, resolvedCountry, trimmedCode)
        : await api.login(normalizedLoginEmail, password);

      if (!result?.access_token) {
        setError('Authentication failed.');
        setLoading(false);
        return;
      }

      // Registration-code consumption now happens server-side via the
      // auth.users INSERT trigger (migration 005). We pass the code in
      // signup metadata above; no separate client round-trip is needed.

      localStorage.setItem('sb-token', result.access_token);
      const role = normalizedLoginEmail === SUPERADMIN_EMAIL
        ? 'superadmin'
        : await api.getUserRole(result.user.id);
      onLogin({ ...result.user, role });
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
    'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
    'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Brazzaville)', 'Congo (Kinshasa)',
    'Costa Rica', "Cote d'Ivoire", 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
    'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hong Kong', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
    'Lithuania', 'Luxembourg',
    'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
    'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
    'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
    'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
    'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
    'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
    'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'UK', 'USA', 'Uganda', 'Ukraine', 'United Arab Emirates', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe',
    'Other'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <div className="login-container" style={{ flex: 1 }}>
        <div className="login-shell">
          <div className="login-brand-panel">
            <img
              src={LOGO_URL}
              alt="Premium Language Centre"
              style={{ width: '220px', maxWidth: '100%', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
            <div className="brand-title">CEFR Placement Test</div>
            <div className="brand-copy">
              Modern English placement with teacher-reviewed outcomes and a secure testing workflow.
            </div>
            <div className="brand-list">
              <div className="brand-pill">Adaptive multi-skill assessment</div>
              <div className="brand-pill">Approved history & retake controls</div>
              <div className="brand-pill">Admin-managed enrollment</div>
            </div>
          </div>

          <div className="login-box">
            <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
              <button type="button" className={`auth-chip ${!isSignup ? 'active' : ''}`} onClick={() => { setIsSignup(false); setError(''); }}>Login</button>
              <button type="button" className={`auth-chip ${isSignup ? 'active' : ''}`} onClick={() => { setIsSignup(true); setError(''); }}>Sign Up</button>
            </div>
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div className="form-section">
                    <div className="form-section-title">Account Setup</div>
                    <input type="text" placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required={isSignup} />
                    <input type="text" placeholder="Passport/ID Number *" value={passportId} onChange={(e) => setPassportId(e.target.value)} required={isSignup} />
                    <select value={country} onChange={(e) => setCountry(e.target.value)} required={isSignup}>
                      <option value="">Select Country *</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {country === 'Other' && (
                      <input
                        type="text"
                        placeholder="Please specify your country *"
                        value={countryOther}
                        onChange={(e) => setCountryOther(e.target.value)}
                        required={isSignup}
                      />
                    )}
                  </div>
                </>
              )}

              <div className="form-section">
                <div className="form-section-title">{isSignup ? 'Create Account' : 'Login'}</div>
                {!isSignup && <p className="auth-subtitle">Sign in with your registered account to continue your placement journey.</p>}
                <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password (minimum 6 characters) *" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {isSignup && (
                <div className="form-section">
                  <div className="form-section-title">Registration Code</div>
                  <div className="field-help">Enter the registration code provided by your school administrator.</div>
                  <input type="text" placeholder="Registration Code *" value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} className="code-input" required={isSignup} />
                </div>
              )}

                  {error && <div className="error-message">{error}</div>}

              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Login'}
              </button>
            </form>

            <p className="toggle-auth">Use the switch above to change between Login and Sign Up.</p>
          </div>
        </div>
      </div>

      {/* Footer - Copyright & Disclaimer */}
      <footer style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-soft)', padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '10px 0' }}>
            <strong>© 2024 Premium Language Centre. All rights reserved.</strong>
          </p>
          <p style={{ margin: '10px 0', lineHeight: '1.6' }}>
            This CEFR Placement Test is designed to assess English language proficiency and determine appropriate course levels. Results are confidential and used solely for educational placement purposes. By using this platform, you agree to maintain the integrity of the assessment and not share test content with others.
          </p>
          <p style={{ margin: '10px 0', fontSize: '11px', color: '#999' }}>
            For questions or technical support, please contact: <strong>support@premium.edu.my</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============ STUDENT TEST ============
function StudentTest({ user, onComplete }) {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionsBank, setQuestionsBank] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [testState, setTestState] = useState('intro');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [selectedAttemptReview, setSelectedAttemptReview] = useState(null);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const data = await api.getStudentAttempts(user.id);
        setAttempts(data || []);
      } catch {
        setAttempts([]);
      }
      setAttemptsLoading(false);
    };
    loadAttempts();
  }, [user.id]);

  useEffect(() => {
    if (testState !== 'testing') return;
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [testState]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const questions = await api.getAllQuestions();
      if (!questions || questions.length === 0) {
        setError('No questions available.');
        setTestStarted(false);
        setLoading(false);
        return;
      }
      setQuestionsBank(questions);
      const randomStart = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomStart);
      setQuestionStartTime(Date.now()); // Start timing this question
      setCurrentDifficulty(randomStart.difficulty_score || 5);
      setTestState('testing');
    } catch (err) {
      setError(`Error loading questions: ${err?.message || 'unknown error'}`);
      setTestStarted(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (testStarted && questionsBank.length === 0) loadQuestions();
  }, [testStarted, questionsBank.length, loadQuestions]);

  const handleAnswer = async (selectedAnswer) => {
    if (!currentQuestion || !questionStartTime) return;
    
    const isCorrect = currentQuestion.correct_answers?.includes(selectedAnswer);
    const now = Date.now();
    const timeSpentMs = now - questionStartTime;
    const timeSpentSeconds = Math.round(timeSpentMs / 1000);
    
    const newResponses = [...userResponses, {
      question_id: currentQuestion.id,
      student_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      difficulty_at_time: currentDifficulty
    }];
    
    setUserResponses(newResponses);
    
    if (newResponses.length >= 30) {
      completeTest(newResponses);
    } else {
      const newDifficulty = calculateDifficulty(newResponses);
      setCurrentDifficulty(newDifficulty);
      const nextQ = selectNextQuestion(questionsBank, newDifficulty, newResponses);
      setCurrentQuestion(nextQ);
      setQuestionStartTime(Date.now()); // Reset timer for next question
      setTimeout(() => document.activeElement?.blur?.(), 50);
    }
  };

  // Persist a completed-test payload to localStorage BEFORE we touch the
  // network. If the submit fails (network drop, Vercel timeout, server
  // error) we still have the responses on the student's machine and can
  // retry from a "Submit failed" UI or auto-offer recovery next visit.
  const PENDING_KEY = `pending_attempt_${user.id}`;

  const savePendingLocal = (payload) => {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(payload)); } catch (err) { console.error('savePendingLocal failed', err); }
  };
  const clearPendingLocal = () => {
    try { localStorage.removeItem(PENDING_KEY); } catch {}
  };
  const readPendingLocal = () => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const persistPayload = async (payload, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const studentId = await api.resolveStudentId(user.id);
        await api.submitAttempt({
          studentId,
          overall_score: payload.overall_score,
          determined_cefr_level: payload.determined_cefr_level,
          ability_estimate: payload.ability_estimate,
          student_responses: payload.student_responses
        });
        return { ok: true };
      } catch (err) {
        console.error(`submitAttempt try ${attempt}/${retries} failed:`, err);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          return { ok: false, error: err };
        }
      }
    }
    return { ok: false, error: new Error('Submit failed after retries') };
  };

  const completeTest = async (responses) => {
    const correctCount = responses.filter(r => r.is_correct).length;
    const score = (correctCount / responses.length) * 100;
    const { cefrLevel, abilityEstimate } = determineCEFRLevel(responses);

    const payload = {
      saved_at: new Date().toISOString(),
      user_id: user.id,
      overall_score: score,
      determined_cefr_level: cefrLevel,
      ability_estimate: abilityEstimate,
      student_responses: responses
    };

    // Backup BEFORE the network call. If anything goes wrong from this point
    // on the student's responses are not lost.
    savePendingLocal(payload);

    setTestState('submitting');
    const result = await persistPayload(payload);
    if (result.ok) {
      clearPendingLocal();
      setTestState('pending');
    } else {
      setSubmitErrorMessage(result.error?.message || 'Submission failed.');
      setTestState('submit_failed');
    }
  };

  const retryPendingSubmit = async () => {
    const payload = readPendingLocal();
    if (!payload) {
      setTestState('pending');
      return;
    }
    setTestState('submitting');
    const result = await persistPayload(payload);
    if (result.ok) {
      clearPendingLocal();
      setTestState('pending');
    } else {
      setSubmitErrorMessage(result.error?.message || 'Submission failed.');
      setTestState('submit_failed');
    }
  };

  const progressPercentage = (userResponses.length / 30) * 100;

  if (!testStarted) {
    const lockState = computeStudentLockState(attempts);
    const approvedCount = attempts.filter(a => (a.status || '').toLowerCase() === 'approved').length;
    const canStart = !lockState.locked;
    const officialCefr = lockState.official?.determined_cefr_level;
    const bannerCopy = (() => {
      switch (lockState.reason) {
        case 'first_attempt':
          return { tone: 'info', text: 'Welcome — start your first placement attempt below.' };
        case 'pending_review':
          return { tone: 'pending', text: 'Your most recent attempt is under teacher review. New attempts are locked until it has been reviewed.' };
        case 'approved_awaiting_retake':
          return { tone: 'approved', text: `Your placement: ${officialCefr || lockState.latest?.determined_cefr_level || '—'}. To take another attempt, ask your teacher to grant a retake.` };
        case 'retake_granted':
          return { tone: 'approved', text: `Your placement: ${officialCefr || lockState.latest?.determined_cefr_level || '—'}. Retake unlocked — you can take a new attempt now.` };
        case 'rejected_retake_auto':
          return { tone: 'rejected', text: 'Your last attempt was not approved. You can take a new attempt now.' };
        default:
          return { tone: 'info', text: '' };
      }
    })();

    const pendingPayload = readPendingLocal();
    const pendingAgeMin = pendingPayload?.saved_at
      ? Math.floor((Date.now() - new Date(pendingPayload.saved_at).getTime()) / 60000)
      : null;

    return (
      <div className="test-screen">
        <div className="dashboard-header" style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px' }}>Student Portal</h1>
          <div className="header-actions">
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</span>
            <button className="logout-button" onClick={onComplete}>Sign Out</button>
          </div>
        </div>
        {pendingPayload && (
          <div className="error-message" style={{ marginBottom: 16 }}>
            <strong>You have a previous test that did not save.</strong>{' '}
            We found a completed test from this device ({pendingAgeMin !== null ? `${pendingAgeMin} min ago` : 'recently'}) that never reached the server.
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="primary-button" onClick={retryPendingSubmit} style={{ padding: '8px 14px', fontSize: 13 }}>
                Submit it now
              </button>
              <button
                onClick={() => { clearPendingLocal(); window.location.reload(); }}
                style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
              >
                Discard (start a fresh test)
              </button>
            </div>
          </div>
        )}
        <div className="test-intro">
          <h1>English Level Assessment</h1>
          {attemptsLoading ? (
            <p className="description">Loading your attempt history...</p>
          ) : (
            <>
            <div className={`banner ${bannerCopy.tone}`}>
              {bannerCopy.text}
              {lockState.latest?.teacher_comment && (lockState.reason === 'rejected_retake_auto' || lockState.reason === 'approved_awaiting_retake' || lockState.reason === 'retake_granted') && (
                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                  <strong>Teacher note:</strong> {lockState.latest.teacher_comment}
                </div>
              )}
            </div>
            <div className="student-dashboard-grid">
              <div className="student-stat"><div className="label">Total Attempts</div><div className="value">{attempts.length}</div></div>
              <div className="student-stat"><div className="label">Approved Attempts</div><div className="value">{approvedCount}</div></div>
              <div className="student-stat"><div className="label">Latest Status</div><div className="value" style={{ textTransform: 'capitalize' }}>{lockState.latest?.status || '—'}</div></div>
              <div className="student-stat"><div className="label">Official CEFR ⭐</div><div className="value">{officialCefr || '—'}</div></div>
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'left', backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-soft)' }}>
              <h3 style={{ marginBottom: '10px', color: '#CC0000' }}>Attempt History</h3>
              {attempts.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No attempts yet. Start your first below.</p>
              ) : (
                <div className="table-wrap"><table className="results-table">
                  <thead>
                    <tr><th>#</th><th>Date</th><th>Score</th><th>CEFR</th><th>Status</th><th>Official</th><th></th></tr>
                  </thead>
                  <tbody>
                    {attempts.map(a => {
                      const status = (a.status || '').toLowerCase();
                      const chipClass = status === 'approved' ? 'status-chip approved'
                        : status === 'rejected' ? 'status-chip rejected'
                        : 'status-chip pending';
                      const date = a.reviewed_at || a.submitted_at;
                      return (
                        <tr key={a.id}>
                          <td>{a.attempt_no}</td>
                          <td>{date ? new Date(date).toLocaleDateString() : '—'}</td>
                          <td>{a.overall_score?.toFixed?.(1) || a.overall_score}%</td>
                          <td>
                            {a.determined_cefr_level}
                            {isC1Plus(a.determined_cefr_level) && (
                              <span style={{ display: 'inline-block', marginLeft: 6, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fff9e6', color: '#5a4604', border: '1px solid #ffc107' }} title="Oral interview required per placement policy">
                                INTERVIEW
                              </span>
                            )}
                          </td>
                          <td><span className={chipClass} style={{ textTransform: 'capitalize' }}>{a.status}</span></td>
                          <td style={{ textAlign: 'center' }}>{a.official_for_placement ? '⭐' : ''}</td>
                          <td><button className="link-button" onClick={() => setSelectedAttemptReview(a)}>View</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              )}
            </div>
            </>
          )}
          <p className="description">Discover your CEFR level with our adaptive placement test. The test adjusts to your ability level and typically takes 15-20 minutes.</p>
          <div className="test-info">
            <h3>What you'll be tested on:</h3>
            <div className="info-grid">
              <div>✓ Grammar & Vocabulary</div>
              <div>✓ Listening Comprehension</div>
              <div>✓ Reading Comprehension</div>
              <div>✓ Adaptive Difficulty</div>
            </div>
          </div>
          <button className="primary-button" onClick={() => setTestStarted(true)} disabled={loading || attemptsLoading || !canStart}>
            {loading ? 'Loading...' : 'BEGIN ASSESSMENT →'}
          </button>
          {error && <div className="error-message">{error}</div>}
          <p className="disclaimer">After each attempt your teacher reviews the result. Retakes require teacher permission once an attempt has been approved.</p>
        </div>

        {selectedAttemptReview && (
          <div className="modal-overlay" onClick={() => setSelectedAttemptReview(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedAttemptReview(null)}>×</button>
              <h2>Attempt #{selectedAttemptReview.attempt_no} Details</h2>
              <p>
                <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedAttemptReview.status}</span>
                {selectedAttemptReview.official_for_placement ? ' ⭐ Official' : ''}
              </p>
              <p><strong>Score:</strong> {selectedAttemptReview.overall_score}% | <strong>CEFR:</strong> {selectedAttemptReview.determined_cefr_level}</p>
              {selectedAttemptReview.teacher_comment && (
                <p className="note-warning" style={{ marginTop: '12px' }}>
                  <strong>Teacher comment:</strong> {selectedAttemptReview.teacher_comment}
                </p>
              )}
              <div className="table-wrap" style={{ marginTop: '12px' }}><table className="results-table">
                <thead><tr><th>#</th><th>Your Answer</th><th>Correct</th><th>Status</th></tr></thead>
                <tbody>
                  {parseResponses(selectedAttemptReview.student_responses).map((r, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td><td>{r.student_answer || r.selected_answer || '-'}</td><td>{r.correct_answer || '-'}</td><td>{r.is_correct ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (testState === 'submitting') {
    return (
      <div className="test-screen">
        <div className="results">
          <h2>Submitting your answers…</h2>
          <div className="pending-box">
            <h3>⏳ Saving your test</h3>
            <p>Please keep this tab open. Your answers are being sent to the server.</p>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
              If this takes more than 30 seconds, do not refresh — we will fall back to a retry screen automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'submit_failed') {
    return (
      <div className="test-screen">
        <div className="results">
          <h2>We could not save your test</h2>
          <div className="error-message" style={{ marginBottom: 16 }}>
            <strong>Your answers were NOT saved to the server.</strong> Your responses are still stored locally on this device. Please do not close this tab.
            {submitErrorMessage && (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Technical detail: {submitErrorMessage}</div>
            )}
          </div>
          <p style={{ marginBottom: 16 }}>
            Click <strong>Try again</strong> to retry the submission. If it fails repeatedly, please take a screenshot of this page and tell your teacher — they can recover your test from this device.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="primary-button" onClick={retryPendingSubmit}>
              Try again
            </button>
            <button
              onClick={() => onComplete()}
              style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 4, background: 'transparent', cursor: 'pointer' }}
            >
              Sign out (keep responses on this device)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'pending') {
    return (
      <div className="test-screen">
        <div className="results">
          <h2>Assessment Complete</h2>
          <div className="pending-box">
            <h3>⏳ Pending Teacher Approval</h3>
            <p>Your test has been submitted and is awaiting review from your instructor.</p>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
              Your instructor will review your answers and send you detailed results via email once approved.
            </p>
          </div>
          <button className="primary-button" onClick={() => onComplete()}>Sign Out</button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="test-screen"><p>Loading question...</p></div>;
  }

  return (
    <div className="test-screen" onContextMenu={(e) => { e.preventDefault(); return false; }}>
      <div className="test-header">
        <div className="progress-tracker">
          <div className="progress-title">PROGRESS</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
              {progressPercentage > 5 && `${Math.round(progressPercentage)}%`}
            </div>
          </div>
          <div className="progress-text">{userResponses.length} of 30 Questions</div>
        </div>
        <div className="timer-box">
          <div className="timer-label">⏱ TIME ELAPSED</div>
          <div className="timer-display">{formatTime(elapsedTime)}</div>
        </div>
      </div>

      <div className="question-box notranslate" translate="no" onCopy={(e) => { e.preventDefault(); return false; }} onCut={(e) => { e.preventDefault(); return false; }} style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
        <h3 style={{ pointerEvents: 'none' }} className="notranslate" translate="no">{currentQuestion.question_text}</h3>
        {currentQuestion.audio_url && (
          <audio controls style={{ width: '100%', marginBottom: '20px' }}>
            <source src={currentQuestion.audio_url} type="audio/wav" />
          </audio>
        )}
        {currentQuestion.passage && currentQuestion.skill !== 'listening' && !currentQuestion.audio_url && <div className="passage notranslate" translate="no" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', pointerEvents: 'none' }}><p>{currentQuestion.passage}</p></div>}
        <div className="options">
          {currentQuestion.options?.map((option, idx) => (
            <button key={idx} className="option-button notranslate" translate="no" onClick={() => handleAnswer(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ TEACHER DASHBOARD ============
function TeacherDashboard({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  // Add Students tab state
  const [addStudentCode, setAddStudentCode] = useState('');
  const [addStudentEmail, setAddStudentEmail] = useState('');
  const [addStudentPassword, setAddStudentPassword] = useState('');
  const [addStudentFullName, setAddStudentFullName] = useState('');
  const [addStudentPassportId, setAddStudentPassportId] = useState('');
  const [addStudentCountry, setAddStudentCountry] = useState('');
  const [addStudentBusy, setAddStudentBusy] = useState(false);
  const [addStudentLog, setAddStudentLog] = useState([]);
  // Delete-attempt confirmation modal state
  const [pendingDeleteAttempt, setPendingDeleteAttempt] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [comment, setComment] = useState('');
  const [approving, setApproving] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSkillFilter, setQuestionSkillFilter] = useState('');
  const [questionCefrFilter, setQuestionCefrFilter] = useState('');
  const [questionSort, setQuestionSort] = useState('recent');
  const [pendingSearch, setPendingSearch] = useState('');
  const [reviewedSearch, setReviewedSearch] = useState('');
  const [reviewedFilter, setReviewedFilter] = useState('all'); // 'all' | 'approved' | 'rejected'
  const [makeOfficialOnApprove, setMakeOfficialOnApprove] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [registrationCodes, setRegistrationCodes] = useState([]);
  const [newRegCode, setNewRegCode] = useState('');
  const [newRegMaxUses, setNewRegMaxUses] = useState('0');
  const [newRegExpiry, setNewRegExpiry] = useState('');
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [registrationCodeError, setRegistrationCodeError] = useState('');
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageRows, setUsageRows] = useState([]);
  const [usageCodeLabel, setUsageCodeLabel] = useState('');
  const [managedUsers, setManagedUsers] = useState([]);
  const [userMgmtLoading, setUserMgmtLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserRole, setEditingUserRole] = useState('student');
  const [editingUserName, setEditingUserName] = useState('');
  const [editingPassportId, setEditingPassportId] = useState('');
  const [editingCountry, setEditingCountry] = useState('');
  const [newUser, setNewUser] = useState({ email: '', fullName: '', role: 'student', passportId: '', country: '' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const normalizedDashboardEmail = (user.email || '').trim().toLowerCase();
  const isSuperAdmin = normalizedDashboardEmail === SUPERADMIN_EMAIL || user.role === 'superadmin';
  const passwordStrength = newUserPassword.length >= 12 && /[A-Z]/.test(newUserPassword) && /[a-z]/.test(newUserPassword) && /\d/.test(newUserPassword) && /[^A-Za-z0-9]/.test(newUserPassword)
    ? 'Strong'
    : newUserPassword.length >= 8
      ? 'Medium'
      : newUserPassword.length > 0
        ? 'Weak'
        : 'Not set';

  const loadData = useCallback(async () => {
    try {
      const [res, q] = await Promise.all([api.getAllResults(), api.getQuestionBank()]);
      setResults(res || []);
      setQuestions(q || []);
      if (isSuperAdmin) {
        try {
          const users = await api.getManagedUsers();
          setManagedUsers(users);
          setAdminError('');
        } catch (err) {
          setManagedUsers([]);
          setAdminError(err.message || 'Unable to load users from Supabase.');
        }
      }
      if (['teacher', 'admin', 'superadmin'].includes((user.role || '').toLowerCase()) || isSuperAdmin) {
        try {
          const codes = await api.getRegistrationCodes();
          setRegistrationCodes(codes);
          setRegistrationCodeError('');
        } catch (err) {
          console.error('Unable to load registration codes:', err);
          setRegistrationCodeError(err.message || 'Unable to load registration codes.');
        }
      }
    } catch (err) {
      console.error('Error loading:', err);
    }
    setLoading(false);
  }, [isSuperAdmin, user.role]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Open the review modal: pre-set Make Official to true when the student has no other official attempt yet.
  const openReview = (r) => {
    setSelectedResult(r);
    setComment('');
    setActionError('');
    const studentHasOfficial = results.some(x => x.student_id === r.student_id && x.official_for_placement && x.id !== r.id);
    setMakeOfficialOnApprove(!studentHasOfficial);
  };

  const sendResultEmail = async ({ recipient, studentName, kind, cefrLevel, score, teacherComment, responses }) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: recipient,
          studentName,
          kind,
          cefrLevel,
          score,
          comment: teacherComment || '',
          responses,
          questions
        })
      });
      const result = await response.json();
      if (!response.ok) console.error('Email send failed:', result);
      else console.log('Email sent:', result);
    } catch (err) {
      console.error('Email error:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedResult) return;
    setApproving(true);
    setActionError('');
    try {
      await api.approveAttempt(selectedResult.id, {
        comment,
        reviewerId: user.id,
        makeOfficial: makeOfficialOnApprove
      });
      // If marking official, clear other approved siblings' official flag to honor the unique index.
      if (makeOfficialOnApprove) {
        try { await api.setOfficial(selectedResult.id, selectedResult.student_id); }
        catch (err) { console.warn('Could not enforce single-official:', err); }
      }
      const studentEmail = selectedResult.students?.email;
      if (!studentEmail) {
        console.warn('Approval succeeded but no student email on record — skipping send.');
      } else {
        await sendResultEmail({
          recipient: studentEmail,
          studentName: selectedResult.students?.full_name,
          kind: 'approved',
          cefrLevel: selectedResult.determined_cefr_level,
          score: selectedResult.overall_score,
          teacherComment: comment,
          responses: parseResponses(selectedResult.student_responses)
        });
      }
      setSelectedResult(null);
      setComment('');
      loadData();
    } catch (err) {
      console.error('Error approving:', err);
      setActionError(err?.message || 'Failed to approve attempt.');
    }
    setApproving(false);
  };

  const handleReject = async () => {
    if (!selectedResult) return;
    if (!comment.trim()) {
      setActionError('A reason is required when rejecting an attempt.');
      return;
    }
    setRejecting(true);
    setActionError('');
    try {
      await api.rejectAttempt(selectedResult.id, { comment, reviewerId: user.id });
      const studentEmail = selectedResult.students?.email;
      if (studentEmail) {
        await sendResultEmail({
          recipient: studentEmail,
          studentName: selectedResult.students?.full_name,
          kind: 'rejected',
          cefrLevel: selectedResult.determined_cefr_level,
          score: selectedResult.overall_score,
          teacherComment: comment,
          responses: parseResponses(selectedResult.student_responses)
        });
      }
      setSelectedResult(null);
      setComment('');
      loadData();
    } catch (err) {
      console.error('Error rejecting:', err);
      setActionError(err?.message || 'Failed to reject attempt.');
    }
    setRejecting(false);
  };

  const handleMakeOfficial = async (row) => {
    const name = row.students?.full_name || 'this student';
    const hasOther = results.some(x => x.student_id === row.student_id && x.official_for_placement && x.id !== row.id);
    const confirmMsg = hasOther
      ? `Mark attempt #${row.attempt_no} as the official placement for ${name}? This will replace their current official attempt.`
      : `Mark attempt #${row.attempt_no} as the official placement for ${name}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.setOfficial(row.id, row.student_id);
      loadData();
    } catch (err) {
      console.error('Error setting official:', err);
      alert(err?.message || 'Failed to mark as official.');
    }
  };

  const handleGrantRetake = async (row) => {
    const name = row.students?.full_name || 'this student';
    if (!window.confirm(`Allow ${name} to take a new attempt? They will be able to start a fresh test immediately.`)) return;
    try {
      await api.grantRetake(row.id, user.id);
      loadData();
    } catch (err) {
      console.error('Error granting retake:', err);
      alert(err?.message || 'Failed to grant retake.');
    }
  };

  const handleResendEmail = async (row) => {
    if (!row.students?.email) return;
    try {
      await sendResultEmail({
        recipient: row.students.email,
        studentName: row.students.full_name,
        kind: 'approved',
        cefrLevel: row.determined_cefr_level,
        score: row.overall_score,
        teacherComment: row.teacher_comment,
        responses: parseResponses(row.student_responses)
      });
      alert(`Email resent to ${row.students.email}`);
    } catch (err) {
      console.error('Resend failed:', err);
      alert('Failed to resend email. See console.');
    }
  };

  if (loading) return <div className="dashboard"><p>Loading...</p></div>;

  const statusOf = (r) => (r?.status || '').toLowerCase();
  const pendingResults = results.filter(r => statusOf(r) === 'pending');
  const reviewedResults = results.filter(r => statusOf(r) === 'approved' || statusOf(r) === 'rejected');
  const filteredPendingResults = pendingResults.filter((r) => {
    const haystack = `${r.students?.full_name || ''} ${r.students?.country || ''} ${r.determined_cefr_level || ''}`.toLowerCase();
    return haystack.includes(pendingSearch.toLowerCase());
  });
  const filteredReviewedResults = reviewedResults
    .filter(r => reviewedFilter === 'all' ? true : statusOf(r) === reviewedFilter)
    .filter((r) => {
      const haystack = `${r.students?.full_name || ''} ${r.students?.passport_id || ''} ${r.determined_cefr_level || ''}`.toLowerCase();
      return haystack.includes(reviewedSearch.toLowerCase());
    });
  
  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = q.question_text?.toLowerCase().includes(questionSearch.toLowerCase());
      const matchesSkill = !questionSkillFilter || q.skill === questionSkillFilter;
      const matchesCefr = !questionCefrFilter || q.cefr_level === questionCefrFilter;
      return matchesSearch && matchesSkill && matchesCefr;
    })
    .sort((a, b) => {
      if (questionSort === 'recent') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (questionSort === 'difficulty') {
        return (a.difficulty_score || 0) - (b.difficulty_score || 0);
      } else if (questionSort === 'difficulty-desc') {
        return (b.difficulty_score || 0) - (a.difficulty_score || 0);
      } else if (questionSort === 'level') {
        const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        return (levelOrder[a.cefr_level] || 0) - (levelOrder[b.cefr_level] || 0);
      }
      return 0;
    });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            title="Reload pending attempts, reviewed attempts, questions, and codes"
            style={{ padding: '6px 14px', border: '1px solid var(--border-soft)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
          <span>{user.email} ({isSuperAdmin ? 'superadmin' : (user.role || 'student')})</span>
          <button className="logout-button" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending ({pendingResults.length})
        </button>
        <button className={`tab ${activeTab === 'reviewed' ? 'active' : ''}`} onClick={() => setActiveTab('reviewed')}>
          Reviewed ({reviewedResults.length})
        </button>
        <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
          Questions
        </button>
        {['teacher', 'admin', 'superadmin'].includes((user.role || '').toLowerCase()) || isSuperAdmin ? (
          <button className={`tab ${activeTab === 'codes' ? 'active' : ''}`} onClick={() => setActiveTab('codes')}>
            Registration Codes
          </button>
        ) : null}
        {['teacher', 'admin', 'superadmin'].includes((user.role || '').toLowerCase()) || isSuperAdmin ? (
          <button className={`tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            Add Students
          </button>
        ) : null}
        {isSuperAdmin && (
          <button className={`tab ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
            Admin Management
          </button>
        )}
      </div>

      {!isSuperAdmin && ['teacher', 'admin'].includes(user.role) && (
        <div className="note-info" style={{ marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '13px' }}>
            Admin Management is only visible for superadmin ({SUPERADMIN_EMAIL}).
          </p>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="tab-content">
          <div className="dashboard-toolbar">
            <span className="status-chip pending">Pending review: {filteredPendingResults.length}</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input className="dashboard-search" placeholder="Search by student, country, or CEFR..." value={pendingSearch} onChange={(e) => setPendingSearch(e.target.value)} />
              <button className="approve-button" onClick={loadData} style={{ padding: '8px 14px', fontSize: '13px' }}>Refresh</button>
            </div>
          </div>
          {filteredPendingResults.length === 0 ? (
            <p>No pending approvals.</p>
          ) : (
            <div className="table-wrap"><table className="results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Attempt</th>
                  <th>Score</th>
                  <th>CEFR Level</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPendingResults.map(r => (
                  <tr key={r.id}>
                    <td>{r.students?.full_name || 'N/A'} {r.students?.country ? `(${r.students.country})` : ''}</td>
                    <td>#{r.attempt_no}</td>
                    <td>{r.overall_score?.toFixed(1)}%</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000' }}>
                      {r.determined_cefr_level}
                      {isC1Plus(r.determined_cefr_level) && (
                        <span style={{ display: 'inline-block', marginLeft: 6, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fff9e6', color: '#5a4604', border: '1px solid #ffc107' }} title="Oral interview required per placement policy">
                          INTERVIEW
                        </span>
                      )}
                    </td>
                    <td>{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="row-action-group">
                        <button className="approve-button" onClick={() => openReview(r)}>
                          Review
                        </button>
                        <button
                          className="row-action"
                          onClick={() => { setPendingDeleteAttempt(r); setDeleteConfirmInput(''); }}
                          title="Delete this attempt"
                          style={{ color: '#b91c1c' }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {activeTab === 'reviewed' && (
        <div className="tab-content">
          <div className="dashboard-toolbar">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="status-chip approved">Reviewed: {filteredReviewedResults.length}</span>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                {['all', 'approved', 'rejected'].map(f => (
                  <button
                    key={f}
                    className={`status-chip ${reviewedFilter === f ? (f === 'rejected' ? 'rejected' : 'approved') : 'pending'}`}
                    onClick={() => setReviewedFilter(f)}
                    style={{ cursor: 'pointer', textTransform: 'capitalize', border: 'none' }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input className="dashboard-search" placeholder="Search by student, passport, or CEFR..." value={reviewedSearch} onChange={(e) => setReviewedSearch(e.target.value)} />
              <button className="approve-button" onClick={loadData} style={{ padding: '8px 14px', fontSize: '13px' }}>Refresh</button>
            </div>
          </div>
          {filteredReviewedResults.length === 0 ? (
            <p>No reviewed attempts match this filter.</p>
          ) : (
            <div className="table-wrap"><table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attempt</th>
                  <th>Score</th>
                  <th>CEFR</th>
                  <th>Status</th>
                  <th>Reviewed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviewedResults.map(r => {
                  const status = statusOf(r);
                  const isApproved = status === 'approved';
                  return (
                    <tr key={r.id} className={r.official_for_placement ? 'row-official' : ''}>
                      <td>
                        {r.students?.full_name || 'N/A'}
                        {r.students?.passport_id ? <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{r.students.passport_id}</span> : null}
                      </td>
                      <td>#{r.attempt_no}</td>
                      <td>{r.overall_score?.toFixed(1)}%</td>
                      <td style={{ fontWeight: 'bold', color: '#CC0000' }}>
                        {r.determined_cefr_level}
                        {isC1Plus(r.determined_cefr_level) && (
                          <span style={{ display: 'inline-block', marginLeft: 6, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fff9e6', color: '#5a4604', border: '1px solid #ffc107' }} title="Oral interview required per placement policy">
                            INTERVIEW
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-chip ${isApproved ? 'approved' : 'rejected'}`} style={{ textTransform: 'capitalize' }}>{r.status}</span>
                        {r.official_for_placement ? <span style={{ marginLeft: '6px' }} title="Official placement">⭐</span> : null}
                      </td>
                      <td>{r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="row-action-group">
                          <button className="row-action" onClick={() => setSelectedResult(r)} title="View attempt details">
                            <span aria-hidden="true">👁</span> View
                          </button>
                          {isApproved && !r.official_for_placement && (
                            <button className="row-action success" onClick={() => handleMakeOfficial(r)} title="Mark this attempt as the student's official placement (replaces any previous official)">
                              <span aria-hidden="true">⭐</span> Make Official
                            </button>
                          )}
                          {isApproved && r.official_for_placement && (
                            <span className="row-state success" title="This is the student's official placement attempt">
                              <span aria-hidden="true">⭐</span> Official
                            </span>
                          )}
                          {isApproved && !r.retake_granted && (
                            <button className="row-action warning" onClick={() => handleGrantRetake(r)} title="Allow this student to take a new attempt">
                              <span aria-hidden="true">🔁</span> Grant Retake
                            </button>
                          )}
                          {isApproved && r.retake_granted && (
                            <span className="row-state success" title="Student can take a new attempt">
                              <span aria-hidden="true">✓</span> Retake granted
                            </span>
                          )}
                          {isApproved && r.students?.email && (
                            <button className="row-action" onClick={() => handleResendEmail(r)} title={`Resend approval email to ${r.students.email}`}>
                              <span aria-hidden="true">✉</span> Resend
                            </button>
                          )}
                          <button
                            className="row-action"
                            onClick={() => { setPendingDeleteAttempt(r); setDeleteConfirmInput(''); }}
                            title="Delete this attempt (requires typed confirmation)"
                            style={{ color: '#b91c1c' }}
                          >
                            <span aria-hidden="true">🗑</span> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {showCreateCodeModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCodeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateCodeModal(false)}>×</button>
            <h2>Create Registration Code</h2>
            <div className="modal-section">
              <label style={{ fontSize: 12, fontWeight: 'bold' }}>Code</label>
              <input className="dashboard-search" style={{ maxWidth: '100%' }} placeholder="e.g. MAY2026A" value={newRegCode} onChange={(e) => setNewRegCode(e.target.value.toUpperCase())} />
              <label style={{ fontSize: 12, fontWeight: 'bold' }}>Max Uses (0 = unlimited)</label>
              <input className="dashboard-search" style={{ maxWidth: '100%' }} placeholder="0" value={newRegMaxUses} onChange={(e) => setNewRegMaxUses(e.target.value)} />
              <label style={{ fontSize: 12, fontWeight: 'bold' }}>Expiry (optional)</label>
              <input className="dashboard-search" style={{ maxWidth: '100%' }} type="datetime-local" value={newRegExpiry} onChange={(e) => setNewRegExpiry(e.target.value)} />
            </div>
            <button className="primary-button" onClick={async () => {
              try {
                if (!newRegCode.trim()) throw new Error('Code is required');
                await api.createRegistrationCode({ code: newRegCode.trim(), maxUses: Number(newRegMaxUses || 0), expiresAt: newRegExpiry || null });
                setNewRegCode('');
                setNewRegMaxUses('0');
                setNewRegExpiry('');
                setShowCreateCodeModal(false);
                const codes = await api.getRegistrationCodes();
                setRegistrationCodes(codes);
                setRegistrationCodeError('');
              } catch (err) {
                setRegistrationCodeError(err.message || 'Unable to create code');
              }
            }}>Create Code</button>
          </div>
        </div>
      )}

      {showUsageModal && (
        <div className="modal-overlay" onClick={() => setShowUsageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUsageModal(false)}>×</button>
            <h2>Usage History: {usageCodeLabel}</h2>
            {usageRows.length === 0 ? <p>No usage records yet.</p> : (
              <div className="table-wrap"><table className="results-table">
                <thead><tr><th>Email</th><th>Used At</th></tr></thead>
                <tbody>
                  {usageRows.map((u) => (
                    <tr key={u.id}><td>{u.used_email || '-'}</td><td>{new Date(u.used_at).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'codes' && (
        <div className="tab-content">
          <h3 style={{ marginBottom: 12 }}>Teacher/Admin Registration Codes</h3>
          {registrationCodeError && (
            <div className="error-message" style={{ marginBottom: 12 }}>
              {registrationCodeError}
              <div style={{ marginTop: 8, fontSize: 12 }}>
                Setup required: run migration <code>db/migrations/002_registration_codes.sql</code> in Supabase SQL editor.
              </div>
            </div>
          )}
          <div className="dashboard-toolbar">
            <span className="status-chip approved">Active codes: {registrationCodes.filter(c => c.is_active).length}</span>
            <button className="approve-button" onClick={() => setShowCreateCodeModal(true)}>+ Create Code</button>
          </div>

          <div className="table-wrap"><table className="results-table">
            <thead>
              <tr>
                <th>Code</th><th>Created By</th><th>Used</th><th>Max</th><th>Expires</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {registrationCodes.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.creator?.full_name || c.creator?.email || '-'}</td>
                  <td>
                    <button className="link-button" onClick={async () => {
                      try {
                        const usage = await api.getRegistrationCodeUsage(c.id);
                        setUsageRows(usage);
                        setUsageCodeLabel(c.code);
                        setShowUsageModal(true);
                      } catch (err) {
                        setRegistrationCodeError(err.message || 'Unable to load usage history');
                      }
                    }}>{c.used_count || 0}</button>
                  </td>
                  <td>{c.max_uses || 0}</td>
                  <td>{c.expires_at ? new Date(c.expires_at).toLocaleString() : 'No expiry'}</td>
                  <td><span className={`status-chip ${c.is_active ? 'approved' : 'pending'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="approve-button" onClick={async () => {
                    await api.toggleRegistrationCode(c.id, !c.is_active);
                    const codes = await api.getRegistrationCodes();
                    setRegistrationCodes(codes);
                  }}>{c.is_active ? 'Disable' : 'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showCreateCodeModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCodeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateCodeModal(false)}>×</button>
            <h2>Create Registration Code</h2>
            <div className="modal-section">
              <label style={{ fontSize: 12, fontWeight: 'bold' }}>Code</label>
              <input className="dashboard-search" style={{ maxWidth: '100%' }} placeholder="e.g. MAY2026A" value={newRegCode} onChange={(e) => setNewRegCode(e.target.value.toUpperCase())} />
              <label style={{ fontSize: 12, fontWeight: 'bold' }}>Max Uses (0 = unlimited)</label>
              <input className="dashboard-search" style={{ maxWidth: '100%' }} placeholder="0" value={newRegMaxUses} onChange={(e) => setNewRegMaxUses(e.target.value)} />
              <label style={{ fontSize: 12, fontWeight: 'bold' }}>Expiry (optional)</label>
              <input className="dashboard-search" style={{ maxWidth: '100%' }} type="datetime-local" value={newRegExpiry} onChange={(e) => setNewRegExpiry(e.target.value)} />
            </div>
            <button className="primary-button" onClick={async () => {
              try {
                if (!newRegCode.trim()) throw new Error('Code is required');
                await api.createRegistrationCode({ code: newRegCode.trim(), maxUses: Number(newRegMaxUses || 0), expiresAt: newRegExpiry || null });
                setNewRegCode('');
                setNewRegMaxUses('0');
                setNewRegExpiry('');
                setShowCreateCodeModal(false);
                const codes = await api.getRegistrationCodes();
                setRegistrationCodes(codes);
                setRegistrationCodeError('');
              } catch (err) {
                setRegistrationCodeError(err.message || 'Unable to create code');
              }
            }}>Create Code</button>
          </div>
        </div>
      )}

      {showUsageModal && (
        <div className="modal-overlay" onClick={() => setShowUsageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUsageModal(false)}>×</button>
            <h2>Usage History: {usageCodeLabel}</h2>
            {usageRows.length === 0 ? <p>No usage records yet.</p> : (
              <div className="table-wrap"><table className="results-table">
                <thead><tr><th>Email</th><th>Used At</th></tr></thead>
                <tbody>
                  {usageRows.map((u) => (
                    <tr key={u.id}><td>{u.used_email || '-'}</td><td>{new Date(u.used_at).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="tab-content">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Add Students</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Use this form to create student accounts directly. Each created student counts against the registration code's usage exactly once — the consumption is server-enforced, so this is the safe way to bulk-add students without relying on the self-signup form.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Registration code *</label>
              <select value={addStudentCode} onChange={(e) => setAddStudentCode(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="">Select an active code…</option>
                {registrationCodes.filter(c => c.is_active).map(c => {
                  const remaining = c.max_uses && c.max_uses > 0 ? `${c.max_uses - (c.used_count || 0)} left` : 'unlimited';
                  return <option key={c.id} value={c.code}>{c.code} ({remaining})</option>;
                })}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Email *</label>
              <input type="email" value={addStudentEmail} onChange={(e) => setAddStudentEmail(e.target.value)} placeholder="student@example.com" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Temporary password (min 6 chars) *</label>
              <input type="text" value={addStudentPassword} onChange={(e) => setAddStudentPassword(e.target.value)} placeholder="e.g. Premium2026!" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Full name *</label>
              <input type="text" value={addStudentFullName} onChange={(e) => setAddStudentFullName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Passport / ID *</label>
              <input type="text" value={addStudentPassportId} onChange={(e) => setAddStudentPassportId(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Country *</label>
              <input type="text" value={addStudentCountry} onChange={(e) => setAddStudentCountry(e.target.value)} placeholder="e.g. Malaysia" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="approve-button"
              disabled={addStudentBusy || !addStudentCode || !addStudentEmail || !addStudentPassword || !addStudentFullName || !addStudentPassportId || !addStudentCountry}
              onClick={async () => {
                setAddStudentBusy(true);
                try {
                  const res = await api.adminCreateStudents(addStudentCode, [{
                    email: addStudentEmail,
                    password: addStudentPassword,
                    fullName: addStudentFullName,
                    passportId: addStudentPassportId,
                    country: addStudentCountry
                  }]);
                  const r = res[0];
                  const entry = r?.ok
                    ? { ok: true, email: r.email, message: 'Created successfully.', at: new Date().toISOString() }
                    : { ok: false, email: r?.email || addStudentEmail, message: `${r?.error || 'error'}: ${r?.message || 'unknown'}`, at: new Date().toISOString() };
                  setAddStudentLog((log) => [entry, ...log].slice(0, 20));
                  if (r?.ok) {
                    // Clear PII fields only; keep code/password so admin can churn through a class quickly.
                    setAddStudentEmail('');
                    setAddStudentFullName('');
                    setAddStudentPassportId('');
                    setAddStudentCountry('');
                    await loadData();
                  }
                } catch (err) {
                  setAddStudentLog((log) => [{ ok: false, email: addStudentEmail, message: err.message || 'Request failed.', at: new Date().toISOString() }, ...log].slice(0, 20));
                } finally {
                  setAddStudentBusy(false);
                }
              }}
            >
              {addStudentBusy ? 'Creating…' : 'Create Student'}
            </button>
            <button
              onClick={() => { setAddStudentEmail(''); setAddStudentPassword(''); setAddStudentFullName(''); setAddStudentPassportId(''); setAddStudentCountry(''); }}
              style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
            >
              Clear form
            </button>
          </div>
          {addStudentLog.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Recent activity</h4>
              <div className="table-wrap"><table className="results-table">
                <thead><tr><th>Email</th><th>Result</th><th>Time</th></tr></thead>
                <tbody>
                  {addStudentLog.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.email || '—'}</td>
                      <td><span className={`status-chip ${e.ok ? 'approved' : 'rejected'}`}>{e.ok ? 'Created' : e.message}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(e.at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="tab-content">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Question Bank Management</h3>
            <button 
              onClick={() => setSelectedQuestion({ new: true })}
              style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Add New Question
            </button>
          </div>

          <div style={{ marginTop: '15px', marginBottom: '20px' }}>
            <p><strong>Total Questions: {questions.length}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                <div key={level} style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                  <div style={{ fontSize: '20px', color: '#CC0000', marginBottom: '5px' }}>
                    {questions.filter(q => q.cefr_level === level).length}
                  </div>
                  <div>{level} Level</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Search Questions:</label>
              <input 
                type="text"
                placeholder="Search by question text..."
                onChange={(e) => setQuestionSearch(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Filter by Skill:</label>
              <select 
                onChange={(e) => setQuestionSkillFilter(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">All Skills</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Filter by CEFR Level:</label>
              <select 
                onChange={(e) => setQuestionCefrFilter(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Sort By:</label>
              <select 
                onChange={(e) => setQuestionSort(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="recent">Most Recent</option>
                <option value="difficulty">Difficulty (Low to High)</option>
                <option value="difficulty-desc">Difficulty (High to Low)</option>
                <option value="level">CEFR Level</option>
              </select>
            </div>
          </div>

          <h3>Questions ({filteredQuestions.length})</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table className="results-table">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th>Question Text</th>
                  <th>Type</th>
                  <th>Skill</th>
                  <th>CEFR</th>
                  <th>Difficulty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q, idx) => (
                  <tr key={idx}>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question_text?.substring(0, 60) || 'N/A'}...</td>
                    <td style={{ fontSize: '12px' }}>{q.question_type || 'N/A'}</td>
                    <td style={{ fontSize: '12px' }}>{q.skill || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000', fontSize: '12px' }}>{q.cefr_level}</td>
                    <td style={{ textAlign: 'center' }}>{q.difficulty_score || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedQuestion(q)}
                        style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'admins' && isSuperAdmin && (
        <div className="tab-content">
          <h3>Super Admin User Role Management</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Promote users to admin or revert to student. Admin self-signup remains disabled.
          </p>
          {adminError && (
            <div className="error-message" style={{ marginBottom: '12px' }}>
              {adminError} Please verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel and redeploy.
            </div>
          )}
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="approve-button" onClick={() => setShowAddUserModal(true)}>+ Add User</button>
          </div>
          <table className="results-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Passport/ID</th>
                <th>Country</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {managedUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                    No users loaded. Check Admin API configuration or Supabase permissions.
                  </td>
                </tr>
              )}
              {managedUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    {editingUserId === u.id ? (
                      <input
                        value={editingUserName}
                        onChange={(e) => setEditingUserName(e.target.value)}
                        style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                      />
                    ) : (u.full_name || 'N/A')}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {editingUserId === u.id ? (
                      <select value={editingUserRole} onChange={(e) => setEditingUserRole(e.target.value)} style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (u.role || 'student')}
                  </td>
                  <td>{editingUserId === u.id ? <input value={editingPassportId} onChange={(e) => setEditingPassportId(e.target.value)} /> : (u.passport_id || '-')}</td>
                  <td>{editingUserId === u.id ? <input value={editingCountry} onChange={(e) => setEditingCountry(e.target.value)} /> : (u.country || '-')}</td>
                  <td>
                    {editingUserId === u.id ? (
                      <>
                        <button className="approve-button" disabled={userMgmtLoading} onClick={async () => {
                          try {
                            setUserMgmtLoading(true);
                            await api.updateManagedUserRole(u.id, editingUserRole, editingUserName, editingPassportId, editingCountry);
                            setEditingUserId(null);
                            await loadData();
                          } catch (err) {
                            alert(err.message || 'Failed to update user');
                          } finally {
                            setUserMgmtLoading(false);
                          }
                        }} style={{ fontSize: '12px', padding: '6px 12px', marginRight: '8px' }}>Save</button>
                        <button className="logout-button" onClick={() => setEditingUserId(null)} style={{ fontSize: '12px', padding: '6px 12px' }}>Cancel</button>
                      </>
                    ) : (
                      <button
                        className="approve-button"
                        disabled={userMgmtLoading || String(u.email || '').toLowerCase() === SUPERADMIN_EMAIL}
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditingUserRole(u.role || 'student');
                          setEditingUserName(u.full_name || '');
                          setEditingPassportId(u.passport_id || '');
                          setEditingCountry(u.country || '');
                        }}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Edit
                      </button>
                      
                    )}
                    <button
                      className="logout-button"
                      disabled={userMgmtLoading || String(u.email || '').toLowerCase() === SUPERADMIN_EMAIL}
                      onClick={async () => {
                        if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
                        try {
                          setUserMgmtLoading(true);
                          await api.deleteManagedUser(u.id);
                          await loadData();
                        } catch (err) {
                          alert(err.message || 'Failed to delete user');
                        } finally {
                          setUserMgmtLoading(false);
                        }
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px', marginLeft: '8px', backgroundColor: '#b00020' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <button className="modal-close" onClick={() => setShowAddUserModal(false)}>×</button>
            <h2>Add User</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input style={{ padding: '12px', fontSize: '15px' }} placeholder="Email *" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <input style={{ padding: '12px', fontSize: '15px' }} placeholder="Full Name *" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
              <select style={{ padding: '12px', fontSize: '15px' }} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option></select>
              {newUser.role === 'student' ? (
                <input style={{ padding: '12px', fontSize: '15px' }} placeholder="Passport/ID *" value={newUser.passportId} onChange={(e) => setNewUser({ ...newUser, passportId: e.target.value })} />
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>Passport/ID not required for {newUser.role}.</div>
              )}
              {newUser.role === 'student' ? (
                <input style={{ padding: '12px', fontSize: '15px' }} placeholder="Country *" value={newUser.country} onChange={(e) => setNewUser({ ...newUser, country: e.target.value })} />
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>Country not required for {newUser.role}.</div>
              )}
              <div />
              <input style={{ padding: '12px', fontSize: '15px' }} type={showPassword ? 'text' : 'password'} placeholder="Password (leave blank = auto)" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
              <input style={{ padding: '12px', fontSize: '15px' }} type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={newUserPasswordConfirm} onChange={(e) => setNewUserPasswordConfirm(e.target.value)} />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                Show passwords
              </label>
              <span>Password strength: <strong>{passwordStrength}</strong></span>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="logout-button" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              <button className="approve-button" onClick={async () => {
                try {
                  if (newUserPassword && newUserPassword !== newUserPasswordConfirm) {
                    alert('Password and confirmation do not match.');
                    return;
                  }
                  if (newUser.role === 'student' && (!newUser.passportId.trim() || !newUser.country.trim())) {
                    alert('Passport/ID and Country are required for student.');
                    return;
                  }
                  const result = await api.createManagedUser({ ...newUser, password: newUserPassword || undefined });
                  alert(newUserPassword ? 'User created successfully.' : `User created. Temporary password: ${result.tempPassword}`);
                  if (!newUserPassword) {
                    const shouldGenerateReset = window.confirm('Generate reset link now for this user?');
                    if (shouldGenerateReset) {
                      const resetData = await api.sendUserResetLink(newUser.email);
                      if (resetData?.resetLink) window.prompt('Copy and send this reset link:', resetData.resetLink);
                    }
                  }
                  setNewUser({ email: '', fullName: '', role: 'student', passportId: '', country: '' });
                  setNewUserPassword('');
                  setNewUserPasswordConfirm('');
                  setShowAddUserModal(false);
                  await loadData();
                } catch (err) {
                  alert(err.message || 'Failed to create user');
                }
              }}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {selectedQuestion && (
        <div className="modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setSelectedQuestion(null)}>×</button>
            <h2>{selectedQuestion.new ? 'Add New Question' : 'Edit Question'}</h2>
            
            <div className="modal-section">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Text:</label>
                <textarea 
                  id="question-text"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.question_text || ''}}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', fontFamily: 'inherit' }}
                  placeholder="Enter question text..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Type:</label>
                  <select 
                    id="question-type"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.question_type || 'multiple_choice'}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option>multiple_choice</option>
                    <option>fill_blank</option>
                    <option>matching</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Skill:</label>
                  <select 
                    id="skill-select"
                    value={selectedQuestion.skill || 'reading'}
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, skill: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="grammar">grammar</option>
                    <option value="vocabulary">vocabulary</option>
                    <option value="reading">reading</option>
                    <option value="listening">listening</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CEFR Level:</label>
                  <select 
                    id="question-cefr"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.cefr_level || 'A1'}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option>A1</option>
                    <option>A2</option>
                    <option>B1</option>
                    <option>B2</option>
                    <option>C1</option>
                    <option>C2</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Difficulty Score (1-10):</label>
                  <input 
                    id="question-difficulty"
                    type="number" 
                    min="1" 
                    max="10" 
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.difficulty_score || 5}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Conditional: Show Audio URL for Listening */}
              {selectedQuestion.skill === 'listening' && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #90caf9' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>🎵 Audio URL (Listening):</label>
                  <input 
                    id="question-audio"
                    type="text"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.audio_url || ''}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #90caf9', borderRadius: '4px' }}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Link to the audio file for this listening question</p>
                </div>
              )}

              {/* Conditional: Show Passage for Reading ONLY */}
              {selectedQuestion.skill === 'reading' && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '4px', border: '1px solid #ce93d8' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>📖 Reading Passage:</label>
                  <textarea 
                    id="question-passage"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.passage || ''}}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ce93d8', borderRadius: '4px', minHeight: '120px', fontFamily: 'inherit' }}
                    placeholder="Paste the article or passage here for reading comprehension questions..."
                  />
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Answer Options (comma-separated):</label>
                <input 
                  id="question-options"
                  type="text"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.options?.join(', ') || ''}}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Option 1, Option 2, Option 3, Option 4"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correct Answer:</label>
                <input 
                  id="question-correct"
                  type="text"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.correct_answers?.[0] || ''}}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Enter correct answer"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Explanation:</label>
                <textarea 
                  id="question-explanation"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.explanation || ''}}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
                  placeholder="Explain why this is the correct answer..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f5f5f5' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const payload = {
                        question_text: document.getElementById('question-text')?.value?.trim(),
                        question_type: document.getElementById('question-type')?.value || 'multiple_choice',
                        skill: selectedQuestion.skill || 'reading',
                        cefr_level: document.getElementById('question-cefr')?.value || 'A1',
                        difficulty_score: Number(document.getElementById('question-difficulty')?.value || 5),
                        audio_url: document.getElementById('question-audio')?.value?.trim() || null,
                        passage: document.getElementById('question-passage')?.value?.trim() || null,
                        options: (document.getElementById('question-options')?.value || '').split(',').map(v => v.trim()).filter(Boolean),
                        correct_answers: [(document.getElementById('question-correct')?.value || '').trim()].filter(Boolean),
                        explanation: document.getElementById('question-explanation')?.value?.trim() || ''
                      };

                      if (!payload.question_text || payload.options.length === 0 || payload.correct_answers.length === 0) {
                        alert('Please fill Question Text, Options, and Correct Answer.');
                        return;
                      }

                      if (selectedQuestion.new) {
                        await api.createQuestion(payload);
                      } else {
                        await api.updateQuestion(selectedQuestion.id, payload);
                      }
                      await loadData();
                      setSelectedQuestion(null);
                      alert('Question saved to database successfully.');
                    } catch (err) {
                      alert(err.message || 'Failed to save question.');
                    }
                  }}
                  style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedResult && (() => {
        const isPending = statusOf(selectedResult) === 'pending';
        const submittedDate = selectedResult.submitted_at || selectedResult.reviewed_at;
        return (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedResult(null)}>×</button>
            <h2>{isPending ? 'Review Student Result' : 'Attempt Details'}</h2>

            <div className="modal-section">
              <h3>Student Information</h3>
              <p><strong>Name:</strong> {selectedResult.students?.full_name || 'N/A'}</p>
              <p><strong>Passport/ID:</strong> {selectedResult.students?.passport_id || 'N/A'}</p>
              <p><strong>Country:</strong> {selectedResult.students?.country || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedResult.students?.email || '—'}</p>
              <p><strong>Attempt:</strong> #{selectedResult.attempt_no}</p>
              <p><strong>Score:</strong> {selectedResult.overall_score?.toFixed(1)}%</p>
              <p><strong>CEFR Level:</strong> <span style={{ color: '#CC0000', fontWeight: 'bold', fontSize: '18px' }}>{selectedResult.determined_cefr_level}</span></p>
              {isC1Plus(selectedResult.determined_cefr_level) && (
                <div className="note-warning" style={{ marginTop: '10px' }}>
                  <strong>Oral interview required.</strong> Per PLC placement policy, any C1+ result must be confirmed by an oral interview with the Academic Office before final placement. The test reports a soft ceiling at C1+ and does not distinguish C1 from C2.
                </div>
              )}
              <p><strong>Submitted:</strong> {submittedDate ? new Date(submittedDate).toLocaleString() : '—'}</p>
              {!isPending && (
                <p><strong>Status:</strong> <span className={`status-chip ${statusOf(selectedResult) === 'approved' ? 'approved' : 'rejected'}`} style={{ textTransform: 'capitalize' }}>{selectedResult.status}</span>{selectedResult.official_for_placement ? ' ⭐ Official' : ''}</p>
              )}
              {!isPending && selectedResult.teacher_comment && (
                <p className="note-warning" style={{ marginTop: '10px' }}>
                  <strong>Existing teacher comment:</strong> {selectedResult.teacher_comment}
                </p>
              )}
            </div>

            {selectedResult.student_responses && (
              <div className="modal-section">
                <h3>Question Breakdown</h3>
                {parseResponses(selectedResult.student_responses).map((response, idx) => {
                  const question = questions.find(q => q.id === response.question_id);
                  return (
                    <div key={idx} className={`question-item ${response.is_correct ? 'question-correct' : 'question-wrong'}`}>
                      <p><strong>Q{idx + 1}:</strong> {question?.question_text?.substring(0, 100)}...</p>
                      <p><span className={response.is_correct ? 'correct-badge' : 'wrong-badge'}>
                        {response.is_correct ? '✓ Correct' : '✗ Wrong'}
                      </span></p>
                      <p><strong>Student:</strong> {response.student_answer}</p>
                      <p><strong>Correct:</strong> {question?.correct_answers?.[0]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {isPending && (
              <>
                <div className="modal-section">
                  <h3>Teacher Comment</h3>
                  <textarea
                    className="textarea"
                    placeholder="Required when rejecting. Optional when approving."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="modal-section">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={makeOfficialOnApprove}
                      onChange={(e) => setMakeOfficialOnApprove(e.target.checked)}
                    />
                    Mark as official placement attempt (replaces any previous official for this student)
                  </label>
                </div>

                {actionError && <div className="error-message" style={{ marginBottom: '10px' }}>{actionError}</div>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button className="approve-button" onClick={handleApprove} disabled={approving || rejecting}>
                    {approving ? 'Approving...' : 'Approve & Email Student'}
                  </button>
                  <button
                    className="approve-button"
                    style={{ backgroundColor: '#b91c1c' }}
                    onClick={handleReject}
                    disabled={approving || rejecting || !comment.trim()}
                    title={!comment.trim() ? 'Enter a reason before rejecting' : 'Reject this attempt'}
                  >
                    {rejecting ? 'Rejecting...' : 'Reject & Email Student'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        );
      })()}

      {pendingDeleteAttempt && (() => {
        const studentName = pendingDeleteAttempt.students?.full_name || 'Unknown student';
        const expectedToken = 'DELETE';
        const canDelete = !deleting && deleteConfirmInput.trim().toUpperCase() === expectedToken;
        return (
          <div className="modal-overlay" onClick={() => { if (!deleting) { setPendingDeleteAttempt(null); setDeleteConfirmInput(''); } }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <button className="modal-close" onClick={() => { if (!deleting) { setPendingDeleteAttempt(null); setDeleteConfirmInput(''); } }}>×</button>
              <h2 style={{ color: '#b91c1c', marginTop: 0 }}>Delete this attempt?</h2>
              <p style={{ marginTop: '8px' }}>
                This will permanently remove the following attempt and the student's saved responses.
                <strong> This cannot be undone.</strong>
              </p>
              <div className="note-warning" style={{ marginTop: '12px' }}>
                <div><strong>Student:</strong> {studentName}</div>
                <div><strong>Email:</strong> {pendingDeleteAttempt.students?.email || '—'}</div>
                <div><strong>Attempt:</strong> #{pendingDeleteAttempt.attempt_no}</div>
                <div><strong>Score:</strong> {pendingDeleteAttempt.overall_score?.toFixed?.(1) ?? '—'}%</div>
                <div><strong>CEFR:</strong> {pendingDeleteAttempt.determined_cefr_level || '—'}</div>
                <div><strong>Status:</strong> {pendingDeleteAttempt.status || '—'}</div>
                {pendingDeleteAttempt.official_for_placement && (
                  <div style={{ marginTop: 6, color: '#b91c1c', fontWeight: 600 }}>⚠ This is the student's OFFICIAL placement attempt. Deleting it removes their placement record.</div>
                )}
              </div>
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '13px', fontWeight: 600 }}>
                  Type <code style={{ background: 'var(--bg-app)', padding: '0 4px', borderRadius: 3 }}>DELETE</code> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  autoFocus
                  disabled={deleting}
                  style={{ width: '100%', padding: '10px', border: '1px solid #b91c1c', borderRadius: '4px', fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setPendingDeleteAttempt(null); setDeleteConfirmInput(''); }}
                  disabled={deleting}
                  style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await api.adminDeleteAttempt(pendingDeleteAttempt.id);
                      setPendingDeleteAttempt(null);
                      setDeleteConfirmInput('');
                      await loadData();
                    } catch (err) {
                      alert(`Delete failed: ${err.message || 'unknown error'}`);
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={!canDelete}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    borderRadius: '4px',
                    background: canDelete ? '#b91c1c' : '#9ca3af',
                    color: 'white',
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                    fontWeight: 600
                  }}
                >
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('ui-theme') || 'light');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    // Disable Chrome translation
    const meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    document.head.appendChild(meta);

    document.documentElement.setAttribute('translate', 'no');
    document.body.setAttribute('translate', 'no');
    document.body.classList.add('notranslate');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ui-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <div className="header">
        <img 
          src={LOGO_URL} 
          alt="PLC Logo" 
          className="header-logo" 
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Logo failed to load from:', LOGO_URL);
          }} 
        />
        <div className="header-content">
          <h1>CEFR Placement</h1>
          <p className="subtitle">{COMPANY_NAME}</p>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 Night' : '☀️ Day'}
        </button>
      </div>

      {!user ? (
        <LoginScreen onLogin={setUser} />
      ) : ['teacher', 'admin', 'superadmin'].includes(user.role) ? (
        <TeacherDashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <StudentTest user={user} onComplete={() => setUser(null)} />
      )}
    </div>
  );
}
