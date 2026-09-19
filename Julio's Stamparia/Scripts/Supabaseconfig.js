/**
 * supabaseConfig.js — configuração de conexão com o Supabase.
 *
 * Troque os dois valores abaixo pelos do SEU projeto:
 * Painel do Supabase → Project Settings → API
 *   - Project URL         → SUPABASE_URL
 *   - anon public API key → SUPABASE_ANON_KEY
 *
 * A anon key é segura para expor no front-end (é feita pra isso),
 * desde que você configure Row Level Security nas tabelas — o schema.sql
 * que te entreguei já faz isso.
 */

const SUPABASE_URL = 'https://aehqeddpepmklxktlclq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaHFlZGRwZXBta2x4a3RsY2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTEwNjgsImV4cCI6MjA5MzY4NzA2OH0.xg0loxoFziciF6dJgo5xzFRU2gD7Uv-rbuJSLnFyJU4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);