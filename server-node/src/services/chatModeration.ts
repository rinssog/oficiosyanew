/**
 * chatModeration.ts — Antiphishing + anti-desvío OficiosYa
 * NONE→LOW→MEDIUM→HIGH→CRITICAL
 */
export type RiskLevel = "NONE"|"LOW"|"MEDIUM"|"HIGH"|"CRITICAL";
export type PenaltyAction = "WARNING_FORMAL"|"SUSPEND_48H"|"SUSPEND_IMMEDIATE_ADMIN_ALERT";

export interface ModerationResult {
  allowed: boolean; riskLevel: RiskLevel; triggers: string[];
  weight: number; sanitizedBody?: string;
  penaltyApplied?: PenaltyAction|null; warningMessage?: string; adminAlert: boolean;
}

const PHONES = [
  { re: /(\+?54\s?9?\s?\d{2,4}[\s\-]?\d{4}[\s\-]?\d{4})/gi, w:5, label:"teléfono" },
  { re: /\b(11|15|(?:02[0-9]{2}|03[0-9]{2}))[\s\-]?\d{4}[\s\-]?\d{4}\b/g, w:5, label:"teléfono" },
  { re: /\b\d{3,4}[\s\.\-]\d{4}[\s\.\-]\d{4}\b/g, w:4, label:"teléfono" },
  { re: /\b15[\s\.\-]?\d{4}[\s\.\-]?\d{4}\b/g, w:4, label:"teléfono" },
];
const EMAIL_RE  = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;
const HANDLE_RE = /(?<![a-zA-Z0-9])@[a-zA-Z0-9_.]{3,30}/g;
const EXT_LINKS = [
  /https?:\/\/(?!oficiosya\.com)[^\s<>"']+/gi,
  /wa\.me\/\d+/gi, /t\.me\/[^\s]+/gi, /wa\.link\/[^\s]+/gi, /bit\.ly\/[^\s]+/gi,
];
const BYPASS = [
  { re:/\bwhatsapp\b/gi,w:3,l:"WhatsApp"},{re:/\bwasap\b/gi,w:3,l:"WhatsApp"},
  { re:/\bwa\s+[0-9]/gi,w:4,l:"WA+número"},{re:/\btelegram\b/gi,w:3,l:"Telegram"},
  { re:/\bsignal\b/gi,w:3,l:"Signal"},{re:/\binstagram\b/gi,w:2,l:"Instagram"},
  { re:/\bfacebook\b/gi,w:2,l:"Facebook"},{re:/\bviber\b/gi,w:3,l:"Viber"},
  { re:/por\s+fuera\b/gi,w:5,l:"por fuera"},
  { re:/sin\s+la\s+app\b/gi,w:6,l:"sin la app"},
  { re:/sin\s+la\s+plataforma\b/gi,w:6,l:"sin la plataforma"},
  { re:/afuera\s+de\s+(la\s+)?(app|plataforma)\b/gi,w:6,l:"afuera"},
  { re:/directo\s+conmigo\b/gi,w:4,l:"directo conmigo"},
  { re:/nos?\s+arreglamos\b/gi,w:4,l:"arreglo informal"},
  { re:/te\s+mando\s+(mi\s+)?(n[uú]mero|datos|cuenta)/gi,w:5,l:"compartir datos"},
  { re:/mi\s+n[uú]mero\s+(es|sería|te)\b/gi,w:5,l:"compartir número"},
  { re:/me\s+llam[aá]s?\b/gi,w:3,l:"llamada directa"},
  { re:/seguimos\s+por\b/gi,w:4,l:"seguir afuera"},
  { re:/hablamos\s+(por|afuera)\b/gi,w:4,l:"hablar afuera"},
  { re:/\befectivo\b/gi,w:3,l:"efectivo"},
  { re:/\balias\b/gi,w:3,l:"alias bancario"},
  { re:/\bcbu\b/gi,w:4,l:"CBU"},
  { re:/\bcvu\b/gi,w:4,l:"CVU"},
  { re:/\bnaranja\s*x\b/gi,w:3,l:"Naranja X"},
  { re:/\buala\b/gi,w:3,l:"Uala"},
  { re:/\bbrubank\b/gi,w:3,l:"Brubank"},
  { re:/sin\s+comisi[oó]n\b/gi,w:6,l:"evadir comisión"},
  { re:/no\s+me\s+cobres?\s+por\s+ac[aá]\b/gi,w:7,l:"evadir pago"},
  { re:/mercado\s*pago\s+directo\b/gi,w:5,l:"MP directo"},
  { re:/pag[ao]\s+(directo|afuera)\b/gi,w:5,l:"pago externo"},
  { re:/transferenci[ao]\s*(bank|bancaria)?\b/gi,w:3,l:"transferencia"},
  { re:/\bdni\s*[:\-]?\s*\d{7,8}\b/gi,w:4,l:"DNI expuesto"},
  { re:/\bcuil\s*[:\-]?\s*\d{11}\b/gi,w:4,l:"CUIL expuesto"},
];

export function moderateMessage(body: string): ModerationResult {
  const triggers: string[] = []; let weight=0; let sanitized=body;
  for(const p of PHONES){if(new RegExp(p.re.source,p.re.flags).test(body)){triggers.push(p.label);weight+=p.w;sanitized=sanitized.replace(new RegExp(p.re.source,p.re.flags),"[DATO BLOQUEADO]");}}
  if(new RegExp(EMAIL_RE.source,EMAIL_RE.flags).test(body)){triggers.push("email");weight+=5;sanitized=sanitized.replace(new RegExp(EMAIL_RE.source,EMAIL_RE.flags),"[EMAIL BLOQUEADO]");}
  for(const p of EXT_LINKS){if(new RegExp(p.source,p.flags).test(body)){triggers.push("link externo");weight+=4;sanitized=sanitized.replace(new RegExp(p.source,p.flags),"[LINK BLOQUEADO]");}}
  if(new RegExp(HANDLE_RE.source,HANDLE_RE.flags).test(body)){triggers.push("usuario red social");weight+=3;sanitized=sanitized.replace(new RegExp(HANDLE_RE.source,HANDLE_RE.flags),"[USUARIO BLOQUEADO]");}
  for(const bp of BYPASS){if(new RegExp(bp.re.source,bp.re.flags).test(body)){triggers.push(bp.l);weight+=bp.w;}}
  const unique=[...new Set(triggers)]; const tStr=unique.join(", ");
  let riskLevel: RiskLevel="NONE";
  if(weight>=12)riskLevel="CRITICAL";
  else if(weight>=8)riskLevel="HIGH";
  else if(weight>=5)riskLevel="MEDIUM";
  else if(weight>=2)riskLevel="LOW";
  if(riskLevel==="NONE")return{allowed:true,riskLevel:"NONE",triggers:[],weight:0,adminAlert:false};
  if(riskLevel==="LOW")return{allowed:true,riskLevel,triggers:unique,weight,sanitizedBody:sanitized,adminAlert:false,penaltyApplied:null,warningMessage:`⚠️ OficiosYa detectó contenido que puede no estar permitido (${tStr}). Coordiná todo dentro de la plataforma.`};
  if(riskLevel==="MEDIUM")return{allowed:false,riskLevel,triggers:unique,weight,adminAlert:false,penaltyApplied:"WARNING_FORMAL",warningMessage:`🚫 Mensaje bloqueado. Intentaste compartir datos de contacto o derivar el trabajo fuera de OficiosYa (${tStr}). Advertencia formal registrada. Reincidencia = suspensión.`};
  if(riskLevel==="HIGH")return{allowed:false,riskLevel,triggers:unique,weight,adminAlert:true,penaltyApplied:"SUSPEND_48H",warningMessage:`🚫 Cuenta suspendida 48hs. Intento de desvío detectado (${tStr}). Reincidencia = suspensión permanente.`};
  return{allowed:false,riskLevel:"CRITICAL",triggers:unique,weight,adminAlert:true,penaltyApplied:"SUSPEND_IMMEDIATE_ADMIN_ALERT",warningMessage:`🚨 Cuenta suspendida. Intento grave de evasión (${tStr}). Fondos en Escrow bloqueados hasta revisión.`};
}
export function getPenaltyMinutes(p: PenaltyAction): number|null {
  if(p==="SUSPEND_48H")return 48*60; return null;
}
