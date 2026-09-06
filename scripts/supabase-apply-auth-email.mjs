/**
 * Pushes the branded auth email templates (supabase/templates/*.html) and, when RESEND_API_KEY
 * is set, the Resend SMTP settings to the Supabase project via the Management API.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_… node scripts/supabase-apply-auth-email.mjs [--dry-run]
 *
 * The access token is a personal token from https://supabase.com/dashboard/account/tokens
 * (not the service-role key). Reads NEXT_PUBLIC_SUPABASE_URL, RESEND_API_KEY and EMAIL_FROM
 * from .env.local.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]));
const token = process.env.SUPABASE_ACCESS_TOKEN;
const dry = process.argv.includes("--dry-run");
if (!token && !dry) throw new Error("Set SUPABASE_ACCESS_TOKEN (personal access token) or pass --dry-run");
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const subjects = JSON.parse(readFileSync("supabase/templates/subjects.json", "utf8"));
const tpl = (n) => readFileSync(`supabase/templates/${n}.html`, "utf8");

const body = {
  mailer_subjects_magic_link: subjects["magic-link"],
  mailer_templates_magic_link_content: tpl("magic-link"),
  mailer_subjects_confirmation: subjects["confirm-signup"],
  mailer_templates_confirmation_content: tpl("confirm-signup"),
  mailer_subjects_recovery: subjects["reset-password"],
  mailer_templates_recovery_content: tpl("reset-password"),
  mailer_subjects_email_change: subjects["change-email"],
  mailer_templates_email_change_content: tpl("change-email"),
  mailer_otp_length: 6,
  mailer_otp_exp: 3600,
};

if (env.RESEND_API_KEY) {
  const from = env.EMAIL_FROM || "Ethos <hello@tryethos.io>";
  const m = from.match(/^(.*?)\s*<([^>]+)>$/);
  Object.assign(body, {
    smtp_host: "smtp.resend.com",
    smtp_port: "465",
    smtp_user: "resend",
    smtp_pass: env.RESEND_API_KEY,
    smtp_sender_name: m ? m[1].trim() : "Ethos",
    smtp_admin_email: m ? m[2] : from,
    smtp_max_frequency: 10,
    rate_limit_email_sent: 200,
  });
}

if (dry) {
  console.log("would PATCH auth config for project", ref, "with keys:", Object.keys(body).join(", "));
  process.exit(0);
}
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: "PATCH",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) throw new Error(`Supabase API ${res.status}: ${await res.text()}`);
const cfg = await res.json();
console.log("applied. smtp_host:", cfg.smtp_host ?? "(Supabase default)", "| magic link subject:", cfg.mailer_subjects_magic_link);
