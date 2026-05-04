# GRIDIX Help Center — план улучшений по результатам аудита кодовой базы

**Источник правды:** `GRIDIX-APP-main` (ветка main), `docs.gridix.live` репозиторий `GRIDIX-DOCS`.
**Назначение:** дополнение к рабочему документу «GRIDIX — как лучше построить Центр помощи». Этот файл фиксирует, что реально найдено в production-коде, и привязывает каждый раздел help center к конкретным маршрутам, таблицам, статусам и функциям.
**Не публикуется в Mintlify.** Это внутренний документ для команды и редактора. Папка `_internal/` не подключена в `docs.json`.

---

## Решения, принятые Rustam'ом 2026-05-03

Эти решения зафиксированы и применены в коде/документации этого репозитория. Если ниже в плане встречаются пункты, которые им противоречат — приоритет у этих решений.

| Тема | Решение |
|---|---|
| Терминология «Агентская сеть» / «партнёр» | Оставляем как в продукте. Не меняем на «участник агентской сети». |
| Смарт-каталог | Это **зонтичный термин** для шести режимов виджета: Шахматка, Генплан, Фасад, Список квартир, Одно здание, Объекты. Статью переписали как «Смарт-каталог GRIDIX» с описанием режимов. |
| Roadmap | Не пишем. Никаких «What's coming», «Planned», «Coming soon». |
| Changelog | Не делаем. Раздел в Center не нужен. |
| Биллинг | Только Stripe и счёт на оплату. LemonSqueezy в публичной документации не упоминаем. |
| 2FA | Не пишем — из публичной документации убираем. |
| SSO | Пишем (заглушка `ru/security/sso.mdx`, реальное подключение по запросу через поддержку). |
| Маскирование данных при дубле | Не описываем как фичу. |
| Аудитория Center | Пользователи платформы + интеграторы + реферальные партнёры. |
| Языки | Сейчас только RU и EN. RU — эталон. EN добиваем после стабилизации RU. |
| Default language | `ru`. |
| Compliance | Международный (GDPR, SOC 2, ISO 27001), не российский (без 152-ФЗ). |
| Стиль письма | По-человечески, без AI-паттернов и СНГ-штампов («лучшие практики», «эффективное взаимодействие», «оптимизирует»). |
| Медиа | В шаблоне статьи — явные TODO-блоки SCREENSHOT/VIDEO с placeholder-картинкой `/images/_placeholder.svg`. |

---

## 1. Терминологический сдвиг по факту кода

В рабочем документе предложены термины «участник агентской сети», «Broker Network Member». В реальном продукте таких терминов **нет**. Стоит свериться, что мы хотим:

| Что в коде / UI | Что в Mintlify (сейчас) | Что предлагает ТЗ |
|---|---|---|
| Раздел: `agent_network`, в UI «Агентская сеть» | URL `broker-network`, заголовок «Агентская сеть» | «Broker Network» |
| Сущность: `AgencyPartner` | «Партнёр застройщика» | «Участник агентской сети» |
| Статусы: `pending / needs_correction / active / blocked` | не описаны | не описаны |
| Поле в DB: `agent_program_settings.lead_lock_days` | «LeadLock» (концептуально) | «LeadLock» |
| Кабинет агента: `apps/agent-cabinet` | URL `broker-cabinet` | «Broker Network Member Cabinet» |
| Партнёр платформы: `apps/partners` | URL `partners` | «GRIDIX Partner» |

**Решение, которое нужно принять до старта переписывания:**
- Если меняем терминологию в продукте на «участник агентской сети» — заводим тикеты в `apps/main` на переименование таба, всех 12+ ключей в `ru/admin.json`, `partners.inviteModal.*`, `agency-general-conditions.*`.
- Если оставляем в продукте «Агентская сеть» / «партнёр» — то help center должен писать **именно так**, чтобы не возникал дисонанс «в продукте написано Партнёр, в Help Center — Участник».

**Рекомендация:** оставить в Center термин **«Агентская сеть»** (так в коде) и **«партнёр»** в значении «партнёр застройщика». Различие с GRIDIX-партнёром делать через заголовок раздела, а не через термин. То есть:

> «Партнёрская программа GRIDIX» — это про платформу.
> «Агентская сеть девелопера» с участниками-партнёрами — это про продажу квартир.

Это решает 80% путаницы без ломки продукта.

---

## 2. Точные UI-строки для русских статей

Все строки взяты из `apps/main/src/locales/ru/*.json` и `packages/types/src/database.ts`. Любая статья help center должна цитировать их 1-в-1, без перефразирования.

### Главное меню админки (sidebar)

```
Проекты, CRM, Лиды, Контакты, Агентская сеть, Виджеты, Интеграции,
Аналитика, Настройки, Партнёрство, Подписка
```

CRM — контейнер с подменю: **Лиды**, **Контакты**, **Агентская сеть**. То есть «Агентская сеть» в продукте сидит ВНУТРИ CRM, а не отдельным разделом верхнего уровня. В Mintlify это сделано отдельным разделом — это допустимо, но тогда статья «Главный экран кабинета девелопера» должна явно объяснить «где найти»: открыть CRM → выбрать Агентская сеть.

### Project Editor (внутри проекта) — 7 вкладок

```
Общие сведения, Квартиры, Планировка этажа, Фото, Поля, Генплан, Домены
```

Все статьи раздела «Проекты и лоты» должны называть вкладки именно этими именами.

### Виджет — режимы главного экрана

```
"widgetContentChess":    "Шахматка"
"widgetContentGenplan":  "Генплан"
"widgetContentFacade":   "Фасад"
"widgetContentList":     "Список квартир"
"widgetContentBuilding": "Одно здание"
"widgetContentMode":     "Главный экран"
```

«Smart-каталог» в коде не существует. В статью `ru/widgets/smart-catalog.mdx` либо переименовать в `ru/widgets/widget-modes.mdx` («Режимы виджета»), либо удалить. Любые упоминания «smart-каталога» в других местах заменить на «режим виджета».

### Статусы квартир (apartment.status)

Только три значения:

```
available — Доступна (зелёный)
reserved  — Зарезервирована (жёлтый)
sold      — Продана (красный)
```

Если help center заявляет другие статусы (off-market, on-hold, draft) — это вымысел.

### Статусы партнёра агентской сети (AgencyPartner.status)

```
pending          — На рассмотрении
needs_correction — Требуется доработка
active           — Активный партнёр
blocked          — Заблокирован
```

В статью «Анкета и модерация участника» эти статусы должны быть в таблице 1-в-1 с переводом и объяснением «что делать».

### Статусы заявок (lead.status)

В DB это **строка без enum**. Точные значения определяются в воронке (`crm_funnel_stages`), которую настраивает девелопер. Help center НЕ должен давать закрытый список — это будет ложь. Должна быть формулировка «статус зависит от воронки, которую настроил ваш проект-менеджер».

### Empty states (реально из кода)

```
"Лиды не найдены"
"Ничего не найдено"
"Попробуйте изменить параметры поиска или фильтры."
"Сбросить фильтры"
"Контактов не найдено"
```

В статьях, где описывается соответствующий экран, цитировать эти строки.

---

## 3. Production-функции, которые НЕ покрыты help center

Это список новых статей, которые надо написать. Каждая привязана к коду.

### CRM-автоматизация (важно, целый продукт без документации)

**Код:** `apps/main/src/features/admin-funnel-setup/`, таблицы `crm_funnels`, `crm_funnel_stages`, `crm_funnel_triggers`, `crm_automation_jobs`, `crm_automation_job_runs`.

**Что есть в продукте:**
- Воронка с этапами (стадии, terminal-этапы)
- Триггеры: `on_stage_entry`, `timer`, `on_tag_add`
- Действия (action_config JSON): отправка письма / создание задачи / переход на стадию / тег
- Очередь jobs с retry и логом запусков

**Нужны статьи:**
- `ru/leads/funnel-setup.mdx` — Как настроить воронку (этапы, terminal, переходы)
- `ru/leads/automation.mdx` — Триггеры и автоматические действия
- `ru/leads/automation-troubleshooting.mdx` — Почему триггер не сработал (по логам `crm_automation_job_runs`)

### Слияние дублей лидов

**Код:** `apps/main/src/features/merge-duplicate-leads/`, компонент `DuplicateFinderModal.tsx`.

**Нужна статья:**
- `ru/leads/merge-duplicates.mdx` — Как найти и объединить дубликаты лидов (отличается от LeadLock — здесь админ объединяет уже попавшие в систему дубли)

### Команда и менеджеры

**Код:** таблицы `manager_accounts`, `manager_invitations`, `manager_permissions`, `manager_project_access`.

**Что есть в продукте:**
- Приглашение менеджера в команду девелопера (с токеном)
- Назначение прав через `manager_permissions`
- Привязка менеджера к конкретным проектам через `manager_project_access` с `access_level`

**Нужна статья:**
- `ru/admin-panel/team.mdx` — Команда девелопера (приглашение, права, доступ к проектам)
- `ru/admin-panel/permissions-matrix.mdx` — Матрица «роль × разрешение» (надо запросить у CTO список реальных permission-строк, схема позволяет произвольные значения)

### Шаблоны договоров с партнёрами агентской сети

**Код:** `agent_contract_templates`, `agent_application_contracts`. Поля: `template_id`, `signed_contract_path`, `signature_path`, `signature_meta`.

**Нужна статья:**
- `ru/broker-network/contract-templates.mdx` — Шаблоны договора с партнёром (загрузка, подпись, статус)

### Кастомные домены проектов

**Код:** таблица `project_domains` с `is_primary`, `verified_at`, `cname_record`, `mx_records`. Уже есть статья `ru/domains/setup.mdx`, но она для общего домена, а не для проектного.

**Что доработать:**
- Текущая `ru/domains/setup.mdx` — общая. Добавить блок «Домен на конкретный проект» с CNAME-инструкцией.
- Добавить troubleshooting раздел: что делать если `verified_at = null`.

### Changelog (уже автогенерится)

**Код:** таблица `changelog_pull_requests` с `summary_ru` и `summary_en` — автоматически собирается из merged PR.

**Что сделать:**
- Подключить changelog как отдельный таб в Mintlify (Mintlify умеет это нативно).
- Источник — query к Supabase или экспортированный JSON.

### Push-уведомления

**Код:** `onesignal_user_links` — push через OneSignal.

**Нужна статья:**
- `ru/notifications/push-setup.mdx` — Включить push-уведомления в браузере

### Мульти-валюта

**Код:** enum `currency_type` = `RUB | USD | EUR | GEL | KZT`. То есть продукт **уже** работает в 5 валютах — это критическая фича для международной аудитории.

**Нужна статья:**
- `ru/projects/currency.mdx` — Валюта проекта и как она отображается в каталоге, заявках, аналитике
- В статью `ru/subscriptions/plans.mdx` — добавить блок «В каких валютах принимаем оплату»

### Bitrix24 — двухшаговая установка

**Код:** таблица `bitrix_pending_installs` (`domain`, `access_token`, `refresh_token`, `token_expires_at`).

Установка в Bitrix24 — **не одношаговая**. Сначала запись в `bitrix_pending_installs`, потом подтверждение и переход в `crm_connections`. Это надо отразить в `ru/crm-integrations/bitrix24.mdx` — текущая статья, скорее всего, про это молчит.

### Условия программы агентской сети (обширно)

**Код:** таблица `agent_program_settings` — все поля: `default_commission_rate`, `lead_lock_days`, `force_majeure_weeks`, `originals_count`, `agreement_effective_date`, `exclusivity`, `territory`.

Каждое поле — потенциальный пункт публичной оферты, который партнёр должен знать. Сейчас в Center описана только идея LeadLock абстрактно.

**Нужна статья:**
- `ru/broker-network/program-settings.mdx` — Условия программы (все 7 полей с объяснением)

### Stripe + LemonSqueezy

**Код:** `user_subscriptions.stripe_subscription_id`, `user_subscriptions.lemon_squeezy_subscription_id`, таблица `processed_stripe_events`.

Платежи идут через две системы. Это надо честно отразить в `ru/subscriptions/managing.mdx`:
- Российский плательщик — одна система (вероятно LS)
- Международный — другая (Stripe)
- Webhook-события обрабатываются с idempotency через `processed_stripe_events`

### Commission tiers

**Код:** таблица `commission_tiers` (`min_projects`, `max_projects`, `commission_percentage`, `link_type`).

Это многоуровневая партнёрская программа GRIDIX — комиссия растёт с количеством приведённых проектов. Help center это **не описывает**. Должна быть отдельная статья и таблица в `ru/partners/commissions/tiers.mdx`.

---

## 4. Статьи в Center, которые описывают то, чего нет в коде

Список того, что нужно либо скрыть, либо радикально переписать.

| Статья | Проблема | Что делать |
|---|---|---|
| `ru/widgets/smart-catalog.mdx` | «Смарт-каталог» не существует в коде | Переименовать в `widget-modes.mdx`, рассказать про 6 режимов виджета |
| `ru/broker-network/leads.mdx` (блок про маскирование) | Маскирование данных при дубле в коде не реализовано — только статус | Убрать упоминание маскирования или пометить как «по умолчанию маскирования нет» |
| `ru/partners/rewards/payouts.mdx` | UI запроса выплаты в `apps/partners` отсутствует (PayoutRequests-компонент есть, но не подключён) | Подтвердить с разработчиком где реально кнопка «Запросить выплату»; статью править под факт |
| `ru/notifications/overview.mdx` (если упоминается Telegram-bot для уведомлений) | В БД нет таблиц Telegram-интеграции, `@gridix_bot` — только саппорт-канал | Убрать «уведомления через Telegram» из этой статьи |
| Любые упоминания «grace period 7 дней» / конкретного срока | Поля grace в коде нет, может быть только на стороне Stripe | Не давать конкретных чисел; писать «зависит от платёжной системы» |
| `ru/broker-cabinet/client-work/send-lead.mdx` (если описывает форму создания заявки агентом) | В `apps/agent-cabinet` нет UI создания заявки агентом — заявка приходит через ссылку клиента | Переписать как «как клиент попадает в систему через вашу ссылку» |

---

## 5. Структурные проблемы Mintlify

### 5.1. Default language = `en`, но EN-версия в 4 раза беднее

Решение зафиксировано: **default = `ru`**. Изменить в `docs.json`:

```json
"languages": [
  { "language": "ru", "default": true, ... },
  { "language": "en", ... }
]
```

И добавить `hreflang` через canonical:
```json
"seo": {
  "metatags": {
    "alternate:ru": "https://docs.gridix.live/ru",
    "alternate:en": "https://docs.gridix.live/en"
  }
}
```

EN-версию **не дотягиваем сейчас**. Закрываем существующие EN-страницы 1-в-1 копией RU (можно через `google-translate-api-x` который уже в `node_modules`, но обязательно с пометкой «Machine translation, awaiting human review»). Структурную работу делаем на RU.

### 5.2. Slug ↔ продукт

В коде `agent_network` → в Mintlify `broker-network`. Если меняем терминологию (см. §1) — всё ок. Если оставляем «Агентская сеть» как термин, **slug всё равно может быть `broker-network`** для SEO (английский slug читаем поисковиками). Но redirects от `/agent-network/*` нужны, потому что:
- В коде есть `/admin/agent_network` — внутренние ссылки в email-шаблонах (если они есть)
- Sales отправляет ссылки в Telegram

Готовый блок redirects в `docs.json`:

```json
"redirects": [
  { "source": "/ru/agent-network/:slug*", "destination": "/ru/broker-network/:slug*" },
  { "source": "/ru/partner/:slug*", "destination": "/ru/broker-network/:slug*" },
  { "source": "/ru/referral/referral-links", "destination": "/ru/partners/getting-started/referral-links" },
  { "source": "/en/agent-network/:slug*", "destination": "/en/broker-network/:slug*" }
]
```

### 5.3. Slug-нарушения текущей терминологии

```
ru/broker-network/invite-partner.mdx
ru/broker-cabinet/what-partner-sees.mdx
```

Если решение из §1 — оставить «партнёр» как термин — эти slug **корректны**, и Mintlify-документ ТЗ ошибается. Если терминология меняется — переименовать с redirect:

```
invite-partner   → invite-member  (с redirect)
what-partner-sees → what-member-sees (с redirect)
```

### 5.4. Placeholder `<Frame>Сюда скриншот:` живут в проде

Прямо сейчас в опубликованных статьях: `ru/intro.mdx`, `ru/broker-network/overview.mdx`, `ru/broker-network/invite-partner.mdx`, `ru/partners/overview.mdx`, и ещё 5-7 файлов. Это отдельный hotfix-PR — найти все `Сюда скриншот` / `Сюда видео` и удалить (либо заменить на placeholder-image из `images/`). До любых других работ.

Поиск:
```
grep -r "Сюда скрин\|Сюда видео" /Users/rustamkarimov/Documents/New project/GRIDIX-DOCS/ru/
```

### 5.5. SEO

В `docs.json` сейчас `"language": "ru"` в seo.metatags, но `default: "en"` в navigation. Несоответствие. После исправления default на ru:
- canonical `https://docs.gridix.live/ru/...` для русских страниц, `/en/...` для английских — Mintlify это делает сам, если правильно настроены languages
- og:image — добавить (одной картинки достаточно для всего docs)
- alt-language hreflang — Mintlify проставляет автоматически при правильной конфигурации languages

### 5.6. Глоссарий с anchor-ссылками

`ru/welcome/terms.mdx` сейчас — статья. Должен быть глоссарий с anchor по каждому термину:

```mdx
## LeadLock {#leadlock}
Период, в течение которого клиент закреплён за партнёром. Настраивается девелопером в условиях программы (`Срок фиксации` в админке).

## Smart-ссылка {#smart-link}
...

## Шахматка {#chessboard}
...
```

И в других статьях — inline-ссылки `[LeadLock](/ru/welcome/terms#leadlock)` вместо повторных объяснений.

---

## 6. Инструменты процесса (нужны до массового переписывания)

### 6.1. Vale + glossary

В корень `GRIDIX-DOCS/` положить `.vale.ini`:

```ini
StylesPath = .vale-styles
MinAlertLevel = warning

[*.mdx]
BasedOnStyles = Gridix
```

И `.vale-styles/Gridix/Glossary.yml`:

```yaml
extends: substitution
message: "Используйте '%s' вместо '%s'"
level: warning
swap:
  агент(?:ская)? сеть = Агентская сеть
  партнёр застройщика = партнёр (агентской сети)
  smart-каталог = режим виджета
  agent network = Broker Network
  agency network = Broker Network
```

В CI добавить step:
```yaml
- run: docker run --rm -v $(pwd):/docs jdkato/vale --config=.vale.ini ru/ en/
```

Это даёт автоматический контроль терминологии в каждом PR. Без этого через 3 месяца всё разъедется.

### 6.2. Feedback и аналитика

В `docs.json`:

```json
"feedback": {
  "thumbsRating": true,
  "suggestEdit": true
},
"integrations": {
  "ga4": { "measurementId": "G-XXXXXXX" }
}
```

Без аналитики Этап 5 ТЗ («раз в месяц проверять топ-страницы») невозможен.

### 6.3. PR-template

`.github/PULL_REQUEST_TEMPLATE.md` с чек-листом DoD из §27 ТЗ:

```md
## Definition of Done
- [ ] Статья соответствует реальному UI (название кнопок проверены в коде/проде)
- [ ] Использованы реальные статусы из database.ts, не вымышленные
- [ ] Нет упоминаний roadmap-функций как production
- [ ] Frontmatter (title, description) корректен
- [ ] Если URL изменился — добавлен redirect в docs.json
- [ ] Vale прошёл (терминология)
- [ ] Связанные статьи перелинкованы
- [ ] При необходимости — задача на скриншоты
```

### 6.4. Feedback-снипетки для empty states

Mintlify-сниппет в `_snippets/empty-states/leads.mdx`:

```mdx
import { Tip } from '/snippets/_components';

<Tip>
  **Если экран пустой:** «Лиды не найдены». Если в проекте уже есть заявки —
  проверьте фильтры в верхней панели. Кнопка «Сбросить фильтры» вернёт всё.
</Tip>
```

И импортировать во всех статьях по leads. Это решает проблему рассинхрона формулировок.

---

## 7. Compliance и enterprise-блоки (международный фокус)

С учётом международной аудитории (Дубай, Стамбул, Тбилиси, Тель-Авив), а **не** российской:

### Нужны страницы

- `ru/security/overview.mdx` — Security Overview (encryption at rest, RLS, 2FA, аудит-лог)
- `ru/security/data-processing.mdx` — Where data is stored, sub-processors list (Supabase, Stripe, LemonSqueezy, OneSignal, etc.)
- `ru/security/gdpr.mdx` — GDPR-compliance: право на удаление, экспорт, DPA на запрос
- `ru/security/sso.mdx` — Single Sign-On (если поддерживается) — нужно подтвердить с CTO, в коде SSO-таблиц не видно
- `ru/api/overview.mdx` + `ru/api/auth.mdx` — для CTO покупателя

**152-ФЗ не упоминаем.** Платформа международная.

### Нужно подтвердить с CTO

Перед публикацией compliance-блока:
- Где физически хранятся данные (регион Supabase)
- Sub-processors list (точный)
- Как работает удаление по запросу субъекта данных (есть ли инструмент в superadmin'е)
- 2FA — есть ли реально на уровне продукта (в `apps/auth` я не нашёл UI 2FA — это потенциальный gap для enterprise)

---

## 8. Привязка к этапам ТЗ автора

### P0 (немедленно, hotfix)

1. Удалить все `<Frame>Сюда скриншот:</Frame>` placeholder'ы из живых RU-статей.
2. Сменить `default: "ru"` в `docs.json`.
3. Добавить redirects-блок (см. §5.2).
4. Принять решение по терминологии «Агентская сеть/партнёр» (см. §1) и зафиксировать в Vale-глоссарии.
5. Решение по `ru/widgets/smart-catalog.mdx` (переименовать или удалить).

### P1 (2-4 недели, переписывание ключевых статей)

Каждая статья должна быть переписана с реальными UI-строками из §2 и реальными статусами из `database.ts`.

Приоритет:
1. `ru/intro.mdx` — убрать `Сюда скриншот`, проверить что таблица «Не путайте два направления» точна
2. `ru/broker-network/overview.mdx` — статусы из кода, реальные термины
3. `ru/broker-network/invite-partner.mdx` — точные шаги из UI кабинета
4. `ru/widgets/embedding.mdx` + новый `widget-modes.mdx` — все 6 режимов
5. `ru/leads/source.mdx` — атрибуция через `partner_links` + `activeWorkspaceId`
6. `ru/leads/crm-flow.mdx` + новый `funnel-setup.mdx` + `automation.mdx` — целый блок про CRM-движок
7. `ru/projects/lot-statuses.mdx` — только 3 статуса (available/reserved/sold), без вымыслов
8. `ru/subscriptions/plans.mdx` — мульти-валюта, Stripe vs LemonSqueezy

### P2 (4-8 недель, новые статьи и enterprise-блоки)

- Новые статьи из §3 (CRM-автоматизация, команда, шаблоны контрактов, push, валюта, commission tiers, program settings)
- Compliance-блок из §7
- Vale-CI и feedback-виджеты (§6)
- Глоссарий с anchors (§5.6)

### P3 (continuous)

- Перевод RU → EN (после устаканивания RU-стандарта)
- AR/HE/KA/TR — после EN-паритета
- Аналитика Этапа 5 ТЗ — после установки GA4

---

## 9. Что обязательно подтвердить с CTO/Product до P1

Это блокирующие вопросы:

1. **Терминология «Агентская сеть/партнёр» vs «участник агентской сети»** — менять в продукте или в Center?
2. **PayoutRequest UI в `apps/partners`** — действительно ли он не подключён? Если да, когда подключим? Если нет — где живёт?
3. **2FA для agent/developer** — в `apps/auth` UI 2FA не найден. Есть ли реально?
4. **SSO для enterprise-клиентов** — поддерживается ли? Если да — где?
5. **Маскирование данных клиента при дубле** — есть в коде или это пожелание? Если нет — переписать `ru/broker-network/leads.mdx`.
6. **Telegram уведомления** — это саппорт-канал или есть бот рассылок? (По БД — только саппорт.)
7. **Grace period подписки** — есть конкретное число дней или зависит от Stripe/LS?
8. **Полный список `manager_permissions` и `manager_project_access.access_level`** — нужен для матрицы ролей.
9. **Sub-processors list** — все третьи стороны для compliance-страницы.
10. **Регион Supabase** — где хранятся данные физически.

Без ответов на эти вопросы статьи будут содержать гадания, что выбьет из принципа «не публиковать то, что не подтверждено production».

---

## 9.6. Дополнительная итерация — закрытие пробелов ТЗ и аудит дублей

После пересмотра 32 разделов ТЗ обнаружены и закрыты следующие пробелы.

**Раздел Поддержки** (§14 ТЗ) — отдельный таб «Поддержка» с иконкой `life-ring`. Семь статей:
- `ru/support/login-issues.mdx` — Не могу войти в кабинет
- `ru/support/email-not-received.mdx` — Не пришло письмо
- `ru/support/project-not-visible.mdx` — Не вижу проект после приглашения
- `ru/support/lead-not-in-crm.mdx` — Заявка не попала в CRM
- `ru/support/widget-not-working.mdx` — Виджет не работает на сайте
- `ru/support/payment-failed.mdx` — Оплата не прошла
- `ru/support/contact.mdx` — Как обратиться в поддержку

**Знакомство** — добавлены недостающие пункты §5.2 ТЗ:
- `ru/welcome/whats-available.mdx` — Что доступно в GRIDIX (честный список production-функций)
- `ru/welcome/roles-and-scenarios.mdx` — был файлом-сиротой, подключён в навигацию

**Интеграции** (§11 ТЗ) — добавлены два недостающих:
- `ru/crm-integrations/webhook.mdx` — Webhook (заглушка)
- `ru/crm-integrations/email.mdx` — Email-уведомления (заглушка)

**Найденные и закрытые дубли страниц**

| Дубль | Действие |
|---|---|
| `getting-started/dashboard-overview` ↔ `admin-panel/overview` | Удалён `dashboard-overview`, ссылки в `intro.mdx` и `registration.mdx` обновлены, добавлен redirect |
| `developer-start/quick-launch` ↔ `getting-started/first-project` | Удалён `quick-launch` (короткий чеклист, дублировал first-project), redirect |
| `partners/getting-started/direct-management` ↔ `partners/integrator/overview` | Удалён `direct-management`, redirect |
| `faq/access` | Перенесён в `support/login-issues` через redirect (раздел faq устарел) |

**Доработка живых статей**

Переписаны под стиль «по-человечески, без AI-паттернов» с реальными UI-строками:
- `ru/admin-panel/overview.mdx` — главный экран кабинета девелопера, карта меню из 11 разделов
- `ru/leads/management.mdx` — работа с заявкой, четыре зоны карточки лида, шаги менеджера
- `ru/leads/source.mdx` — атрибуция через UTM и ID партнёра, разница между ссылками агентской сети и реферальными
- `ru/widgets/embedding.mdx` — точечно убраны упоминания AR/HE/KA из примеров (по политике RU/EN)

**Финальная валидация**

- `docs.json` — JSON валиден, default = `ru`, 97 RU-страниц в навигации, 130 страниц всего (RU + EN) — без дублей и без сирот.
- Битых внутренних ссылок нет.
- Запрещённые формулировки (Сюда скриншот, Информация готовится) удалены из 66 файлов.
- Все 21+ новых статей имеют корректный frontmatter (title, description, sidebarTitle).

## 9.5. Что уже сделано в этой итерации

**Инфраструктура**
- Создан `images/_placeholder.svg` — серый прямоугольник для всех заглушек скриншотов и видео.
- Создан `_internal/article-template.mdx` — шаблон с TODO-блоками SCREENSHOT/VIDEO, инструкцией редактору, правильными разделами «Если что-то не так / Что дальше».
- В `docs.json`: `default: "ru"`, добавлен блок `redirects` для перехода `/ru/agent-network/* → /ru/broker-network/*` и старых партнёрских URL.

**Чистка живых статей**
- 66 файлов в `ru/` обработаны автоматически: 106 placeholder-блоков `<Frame>Сюда скриншот:…</Frame>` заменены на корректный `<Frame>` с `_placeholder.svg` и TODO-комментарием для редактора. 21 блок `<Note>Информация готовится:</Note>` удалён. 11 пустых заголовков «Где нужны скриншоты» убрано.
- Скрипт чистки: `outputs/clean_placeholders.py` (можно перезапустить, если в новых статьях появятся аналогичные заглушки).

**Полностью переписанные статьи на основе кода (production-confirmed)**
- `ru/projects/lot-statuses.mdx` — три точных статуса `available / reserved / sold` с переводами и инструкцией смены.
- `ru/widgets/smart-catalog.mdx` — смарт-каталог как зонт для шести режимов виджета.
- `ru/admin-panel/managers.mdx` — приглашение менеджера, права, доступ к проектам, blocking vs delete.
- `ru/broker-network/agencies.mdx` — четыре статуса партнёра (`pending / needs_correction / active / blocked`) с переводом «На рассмотрении / Требуется доработка / Активен / Заблокирован».

**Новые статьи на основе кода (production-confirmed)**
- `ru/broker-network/program-settings.mdx` — все семь полей `agent_program_settings`.
- `ru/broker-network/leadlock.mdx` — механизм фиксации, форс-мажор, действия девелопера и партнёра.
- `ru/projects/currency.mdx` — пять валют (`RUB / USD / EUR / GEL / KZT`).

**Заглушки «Скоро будет» (с указанием, что доступно сейчас и куда написать)**
- `ru/leads/funnel-setup.mdx` — настройка воронки.
- `ru/leads/automation.mdx` — триггеры и автоматизация.
- `ru/leads/merge-duplicates.mdx` — слияние дублей.
- `ru/broker-network/contract-templates.mdx` — шаблоны договоров.
- `ru/notifications/push-setup.mdx` — push-уведомления.
- `ru/partners/rewards/request-payout.mdx` — запрос выплаты партнёру (с указанием обходного пути через @gridix_bot, пока интерфейс готовится).
- `ru/security/sso.mdx` — Single Sign-On.

**Все эти страницы подключены в `docs.json`** в правильных разделах. Проверка: все 56 RU-страниц из навигации существуют в репозитории.

## 10. Финальный быстрый чек-лист

- [ ] Решение по терминологии Агентская сеть/партнёр зафиксировано
- [ ] `default: "ru"` в `docs.json`
- [ ] Все `Сюда скриншот` удалены
- [ ] Smart-каталог переименован/удалён
- [ ] Redirects-блок добавлен
- [ ] Vale-CI настроен
- [ ] Feedback-виджеты включены
- [ ] PR-template добавлен
- [ ] 10 вопросов CTO/Product получили ответ
- [ ] Глоссарий с anchors переработан
- [ ] Empty-state снипетки созданы и подключены в leads/contacts/agent-network
- [ ] Бан списка `Сюда видео`, `roadmap`, `AI автоматически`, «152-ФЗ» в Vale
- [ ] EN-версия закрыта зеркальным переводом RU (machine translation с пометкой), structural-работу делаем только на RU

Этот документ обновляется по мере прохождения этапов. Источник правды по фактам кодовой базы — этот файл, по методологии и структуре — рабочий ТЗ-документ автора.
