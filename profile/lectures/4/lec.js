(() => {
const AC = 'var(--ac)', WR = 'var(--wr)', ACT = 'var(--ac-t)', WRT = 'var(--wr-t)';
const MIN = [4, 10, 8, 14, 9, 7, 7, 15, 5, 8, 3];
const NAMES = ['Вступление', 'Структура промпта', 'Zero-shot и few-shot', 'Structured output', 'Chain-of-Thought', 'ReAct', 'Reasoning-модели изнутри', 'Как модель пишет код', 'Мета-промптинг', 'Антипаттерны', 'Итоги'];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FONT = "'Golos Text',system-ui,sans-serif", MONO = "'JetBrains Mono',ui-monospace,monospace";

const ICONS = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
  tri: '<path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4.5"/><path d="M12 17.5v.01"/>',
  q: '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.3a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.7"/><path d="M12 17v.01"/>',
  arrowl: '<path d="M20 12H4.5M10.5 6l-6 6 6 6"/>',
  counter: '<rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M7 9.5v5M10.5 9.5v5M14 9.5v5M17.5 9.5v5"/>',
  ucurve: '<path d="M3 5c1 9 4.5 13 9 13s8-4 9-13"/><circle cx="12" cy="18" r="1.6" fill="currentColor"/>'
};
class Icon extends HTMLElement {
  static get observedAttributes() { return ['n', 's', 'c']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const s = this.getAttribute('s') || 36, c = this.getAttribute('c') || 'currentColor';
    this.style.display = 'inline-flex'; this.style.flex = 'none';
    (this.shadowRoot || this.attachShadow({ mode: 'open' })).innerHTML = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" style="stroke:${c};color:${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[this.getAttribute('n')] || ''}</svg>`;
  }
}

class Chrome extends HTMLElement {
  static get observedAttributes() { return ['b', 'n', 'r', 'd', 'sep']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    const b = this.getAttribute('b'), bi = b === null || b === '' ? -1 : +b;
    const n = this.getAttribute('n') || '', sep = this.hasAttribute('sep');
    const seg = h => MIN.map((m, i) => `<div style="flex:${m};height:${h}px;border-radius:${Math.min(h / 2, 10)}px;background:${i === bi ? AC : i < bi ? '#8C8C8C' : '#D4D4D4'}"></div>`).join('');
    const label = bi < 0 ? '' : (bi >= 1 && bi <= 9 ? `${bi} · ${NAMES[bi]}` : NAMES[bi]);
    let h = `<style>:host{position:absolute;inset:0;pointer-events:none;font-family:${FONT};color:#1A1A1A;display:block}</style>`;
    const res = this.hasAttribute('r') ? `<span style="font-size:24px;font-weight:600;color:#333;background:#E6E6E6;border-radius:8px;padding:4px 14px">резерв</span>` : '';
    if (!sep) {
      h += `<div style="position:absolute;top:44px;right:100px;display:flex;align-items:center;gap:24px">${res}${bi >= 0 ? `<span style="font-size:24px;font-weight:600;color:#222">${label}</span><div style="display:flex;gap:3px;width:300px">${seg(12)}</div>` : ''}</div>`;
      if (n) h += `<div style="position:absolute;left:100px;bottom:44px;font-size:24px;font-weight:600;color:#222;font-variant-numeric:tabular-nums">${n}</div>`;
    } else {
      h += `<div style="position:absolute;left:100px;right:100px;bottom:120px;display:flex;gap:6px">${seg(20)}</div>`;
    }
    const d = this.hasAttribute('d') ? `<span style="font-size:24px;font-weight:500;color:#222;background:#E6E6E6;border-radius:8px;padding:4px 14px">данные на 15.10.2026</span>` : '';
    h += `<div style="position:absolute;right:100px;bottom:40px;display:flex;align-items:center;gap:28px">${d}<img src="assets/logo-itmo-black.svg" alt="ITMO" style="height:26px"></div>`;
    root.innerHTML = h;
  }
}

const PY = /(?<=\b(?:def|class)\s+)(\w+)|(#.*$)|([rfb]?"(?:\\.|[^"\\])*"|[rfb]?'(?:\\.|[^'\\])*')|\b(from|import|class|def|async|await|return|for|in|if|else|elif|try|except|as|not|is|and|or|while|with|lambda|pass|raise)\b|\b(None|True|False)\b|\b(\d+(?:\.\d+)?)\b|\b(str|int|float|dict|list|bool|len|print)\b/g;
const PYC = [`color:${AC};font-weight:700`, 'color:#555;font-style:italic', 'color:#1A6E2B', 'color:#8A1A9E;font-weight:600', 'color:#B04600;font-weight:600', 'color:#B04600', 'color:#0B6378'];
function py(line) {
  let out = '', last = 0, m; PY.lastIndex = 0;
  while ((m = PY.exec(line))) {
    if (m[0] === '') { PY.lastIndex++; continue; }
    out += esc(line.slice(last, m.index));
    const g = m.slice(1).findIndex(x => x !== undefined);
    out += `<span style="${PYC[g]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}
function pr(raw, star) {
  let h = esc(raw).replace(/&lt;\/?[a-z_]+&gt;/g, t => `<b style="color:${AC}">${t}</b>`);
  if (star) h = h.replace(/^(Situation|Task|Action|Result):/, `<b style="color:${AC}">$1:</b>`);
  return h;
}
function prompt(line, d) {
  for (const m of d.mark || []) {
    const i = line.indexOf(m);
    if (i >= 0) return pr(line.slice(0, i), d.star) + `<span style="background:${ACT};box-shadow:0 0 0 3px ${ACT};border-radius:2px">${pr(m)}</span>` + pr(line.slice(i + m.length));
  }
  return pr(line, d.star);
}
const RCTF = { '<role>': 'R', '<context>': 'C', '<task>': 'T', '<format>': 'F' };

class Code extends HTMLElement {
  static get observedAttributes() { return ['k', 'fs', 'v']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const d = (window.LEC_CODE || {})[this.getAttribute('k')];
    if (!d) return;
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    const fs = +(this.getAttribute('fs') || d.fs || 22), v = this.getAttribute('v') || d.v || '';
    const lines = d.code.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
    const rows = lines.map(l => {
      const hl = (d.hl || []).some(s => l.includes(s)), er = (d.err || []).some(s => l.includes(s));
      let bg = er ? `background:${WRT};box-shadow:inset 8px 0 0 ${WR};` : hl ? `background:${ACT};box-shadow:inset 8px 0 0 ${AC};` : '';
      let body, gut = '', right = '', font = MONO, pad = '0 32px';
      if (d.mode === 'py') body = py(l);
      else if (d.mode === 'trace') {
        pad = '10px 32px';
        if (l.startsWith('Thought:')) { font = FONT; body = `<i><b>Thought:</b>${esc(l.slice(8))}</i>`; }
        else if (l.startsWith('Action:')) body = `<span style="color:${AC};font-weight:600">${esc(l)}</span>`;
        else if (l.startsWith('Observation:')) {
          if (!bg) bg = 'background:#E2E2E2;';
          body = esc(l);
          right = `<span style="flex:none;font-family:${FONT};font-size:24px;color:#333;font-style:normal">пишет ваш код, не модель</span>`;
        } else if (l.startsWith('Answer:')) { font = FONT; body = `<b>${esc(l)}</b>`; }
        else body = esc(l);
      } else {
        body = prompt(l, d);
        if (d.rctf) {
          const k = RCTF[l.trim()];
          gut = `<span style="flex:none;width:44px;display:flex;align-items:center">${k ? `<span style="width:36px;height:36px;box-sizing:border-box;border:2px solid ${AC};color:${AC};border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font:800 24px ${FONT}">${k}</span>` : ''}</span>`;
        }
      }
      return `<div style="${bg}padding:${pad};display:flex;gap:24px;align-items:flex-start">${gut}<div style="flex:1;min-width:0;white-space:pre-wrap;font-family:${font};${d.mode === 'trace' && font === FONT ? 'font-size:26px;' : ''}">${body || ' '}</div>${right}</div>`;
    }).join('');
    const border = v === 'bad' ? `border:2px solid ${WR};` : v === 'good' ? `border:3px solid ${AC};` : '';
    const ic = v === 'bad' ? ['x', WR] : v === 'good' ? ['check', AC] : null;
    root.innerHTML = `<style>:host{display:block}</style><div style="position:relative;background:var(--g);${border}border-radius:16px;padding:${d.mode === 'trace' ? 16 : 24}px 0;font-size:${fs}px;line-height:1.32;color:#111">${rows}${ic ? `<span style="position:absolute;top:12px;right:12px;width:44px;height:44px;border-radius:50%;background:#fff;border:2px solid ${ic[1]};display:flex;align-items:center;justify-content:center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:${ic[1]}">${ICONS[ic[0]]}</svg></span>` : ''}</div>`;
  }
}

window.LEC_CODE = {
s7: { mode: 'prompt', fs: 28, code: `Ты помощник по учёбе. Отвечай хорошо и понятно.` },
s10: { mode: 'prompt', rctf: true, mark: ['Если вопрос неясен — задай один уточняющий вопрос вместо ответа.'], code: `
<role>
Ты — преподаватель-наставник для студентов 2 курса направления «Программная инженерия».
</role>
<context>
Студенты пишут на Python и C#. Вопросы приходят в Telegram, ответ читают с телефона.
</context>
<task>
Объясни тему, о которой спрашивает студент. Если вопрос неясен — задай один уточняющий вопрос вместо ответа.
</task>
<format>
Не больше 5 предложений. Код — только если без него не обойтись, не длиннее 10 строк.
Без таблиц: Telegram их не отображает.
</format>` },
s12: { mode: 'prompt', star: true, fs: 24, code: `
Situation: бот поддержки студентов отвечает на 300 сообщений в день, 40% — про расписание.
Task: сократить число ответов «не знаю» на вопросы о расписании.
Action: предложи три изменения — в системном промпте или в наборе инструментов бота.
Result: для каждого изменения — ожидаемый эффект и как измерить его за неделю.` },
s16: { mode: 'prompt', hl: ['<role>explain', '<role>translate', '<role>career'], fs: 21.5, code: `
Определи, какой роли бота адресовано сообщение: study, career, translate или explain.
Ответь одним словом.

<examples>
<example>
<message>Как работает сборщик мусора в .NET?</message>
<role>explain</role>
</example>
<example>
<message>Переведи на английский: «срок сдачи перенесли»</message>
<role>translate</role>
</example>
<example>
<message>Что написать в резюме, если нет опыта работы?</message>
<role>career</role>
</example>
</examples>

<message>{сообщение пользователя}</message>` },
s25: { mode: 'py', fs: 21.5, hl: ['role: Literal[', '"schema": RouteDecision'], code: `
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class RouteDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["study", "career", "translate", "explain"]
    confidence: float = Field(ge=0, le=1)
    reason: str = Field(max_length=200)


RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "route_decision",
        "strict": True,
        "schema": RouteDecision.model_json_schema(),
    },
}` },
s26: { mode: 'py', fs: 24, hl: ['response_format=RESPONSE_FORMAT,', 'extra_body={'], code: `
from openai import AsyncOpenAI
from pydantic import ValidationError


async def route(client: AsyncOpenAI, text: str, attempts: int = 2) -> RouteDecision | None:
    messages = [
        {"role": "system", "content": "Определи, какой роли бота адресовано сообщение."},
        {"role": "user", "content": text},
    ]
    for _ in range(attempts):
        response = await client.chat.completions.create(
            model="nvidia/nemotron-3-super-120b-a12b:free",
            messages=messages,
            response_format=RESPONSE_FORMAT,
            extra_body={"provider": {"require_parameters": True}},
        )` },
s27: { mode: 'py', fs: 24, hl: ['return RouteDecision.model_validate_json(raw)', 'Ответ не прошёл проверку'], code: `
        raw = response.choices[0].message.content or ""
        try:
            return RouteDecision.model_validate_json(raw)
        except ValidationError as error:
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"Ответ не прошёл проверку: {error}. Исправь."})
    return None` },
s30: { mode: 'py', fs: 22, hl: ['"description": "Создать напоминание'], code: `
ADD_REMINDER_TOOL = {
    "type": "function",
    "function": {
        "name": "add_reminder",
        "description": "Создать напоминание пользователю на указанное время.",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Текст напоминания"},
                "remind_at": {"type": "string", "description": "Когда напомнить, ISO 8601"},
            },
            "required": ["text", "remind_at"],
            "additionalProperties": False,
        },
    },
}` },
s31: { mode: 'py', fs: 22, hl: ['return {"error": str(error)}'], code: `
from datetime import datetime


class ReminderArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1, max_length=500)
    remind_at: datetime


async def add_reminder(raw_arguments: str) -> dict:
    try:
        args = ReminderArgs.model_validate_json(raw_arguments)
    except ValidationError as error:
        return {"error": str(error)}
    # здесь — сохранение напоминания
    return {"status": "created", "remind_at": args.remind_at.isoformat()}` },
s41: { mode: 'trace', fs: 24, code: `
Thought: нужно узнать погоду на завтра и расписание.
Action: get_weather(city="Санкт-Петербург", date="2026-10-16")
Observation: +9°C, дождь
Thought: погода есть, теперь расписание после 13:00.
Action: get_schedule(date="2026-10-16")
Observation: 14:00 — ООП, ауд. 214
Thought: данных достаточно.
Answer: Завтра +9 и дождь. После обеда — ООП в 14:00, ауд. 214. Возьмите зонт.` },
s42: { mode: 'py', fs: 23, hl: ['if not message.tool_calls:'], code: `
import json

MODEL = "nvidia/nemotron-3-super-120b-a12b:free"
HANDLERS = {"add_reminder": add_reminder}


async def run_agent(client: AsyncOpenAI, messages: list[dict], max_steps: int = 5) -> str:
    for _ in range(max_steps):
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=[ADD_REMINDER_TOOL],
        )
        message = response.choices[0].message
        if not message.tool_calls:
            return message.content or ""` },
s43: { mode: 'py', fs: 22, hl: ['"role": "tool",', 'return "Не удалось ответить'], code: `
        messages.append(message.model_dump(exclude_none=True))
        for call in message.tool_calls:
            handler = HANDLERS.get(call.function.name)
            result = await handler(call.function.arguments) if handler else {"error": "unknown tool"}
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })
    return "Не удалось ответить за отведённое число шагов."` },
s68: { mode: 'trace', fs: 24, err: ['error CS0103'], hl: ['Passed: 12, Failed: 0'], code: `
Thought: нужно добавить метод в класс Box.
Action: edit_file(Box.cs, …)
Action: run("dotnet build")
Observation: error CS0103: The name 'items' does not exist in the current context
Thought: поле называется _items, исправляю.
Action: edit_file(Box.cs, …)
Action: run("dotnet test")
Observation: Passed: 12, Failed: 0` },
s74: { mode: 'prompt', fs: 22, hl: ['Не добавляй правил, не связанных с провалами.'], code: `
Ты — эксперт по промпт-инжинирингу.
Ниже системный промпт Telegram-бота и тестовые вопросы с ожидаемым поведением.

<prompt>{текущий системный промпт роли}</prompt>
<tests>{10 тестовых вопросов и что считается правильным ответом}</tests>
<failures>{вопросы, на которых бот ответил неправильно, и его ответы}</failures>

Предложи исправленную версию промпта.
Для каждого изменения — одна строка: какой провал оно исправляет.
Не добавляй правил, не связанных с провалами.` },
s78: { mode: 'prompt', fs: 26, v: 'bad', err: ['Отвечай кратко', 'Всегда приводи'], code: `
Отвечай кратко, не больше трёх предложений.
…
Всегда приводи пример кода и разбирай каждую строку.` }
};

customElements.get('lec-i') || customElements.define('lec-i', Icon);
customElements.get('lec-chrome') || customElements.define('lec-chrome', Chrome);
customElements.get('lec-code') || customElements.define('lec-code', Code);
})();
