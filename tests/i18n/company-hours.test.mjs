import assert from "node:assert/strict";
import { test } from "node:test";
import { companyTimeZone, isCompanyOpen, parseServiceHours } from "../../lib/company-hours.ts";

function clock(timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

test("reconhece formatos de horário antigos e recusa horários ambíguos", () => {
  assert.deepEqual(parseServiceHours("18h às 22h30"), { opens: 1080, closes: 1350 });
  assert.deepEqual(parseServiceHours("08:00 - 18:00"), { opens: 480, closes: 1080 });
  assert.deepEqual(parseServiceHours("8 a.m. - 6 p.m."), { opens: 480, closes: 1080 });
  assert.deepEqual(parseServiceHours("24h"), { opens: 0, closes: 1440 });
  for (const value of ["Por agendamento", "08:00 - 24:01", "08h às 08h", "8 - 6 p.m."]) {
    assert.equal(parseServiceHours(value), null, value);
  }
});

test("respeita os dias, o fuso da empresa e o minuto de fechamento", () => {
  const hours = parseServiceHours("18h às 22h30");
  const saturdayEvening = new Date("2026-11-28T21:00:00Z");
  const curitiba = clock(companyTimeZone("PR"));
  assert.equal(isCompanyOpen(hours, ["Sáb"], curitiba, saturdayEvening), true);
  assert.equal(isCompanyOpen(hours, ["Sex"], curitiba, saturdayEvening), false);
  assert.equal(isCompanyOpen(hours, ["Sáb"], clock(companyTimeZone("AC")), saturdayEvening), false);
  assert.equal(isCompanyOpen(hours, ["Sáb"], curitiba, new Date("2026-11-29T01:30:00Z")), false);
});

test("mantém aberto após a meia-noite de um dia de atendimento até o fechamento", () => {
  const hours = parseServiceHours("18h às 02h");
  const curitiba = clock(companyTimeZone("PR"));
  assert.equal(isCompanyOpen(hours, ["Sáb"], curitiba, new Date("2026-11-29T04:59:00Z")), true);
  assert.equal(isCompanyOpen(hours, ["Sáb"], curitiba, new Date("2026-11-29T05:00:00Z")), false);
});
