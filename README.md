# Pawnshop Pledge

Монорепозиторий приложения для управления залогами.

Структура:
```text
.
├── apps
│   ├── backend
│   ├── frontend
│   ├── docker
│   ├── docker-compose.yml
│   └── README.md
```

---

# Требования

Перед запуском необходимо установить:

- Node.js 20+
- npm 10+
- Docker Desktop

Проверка:

```bash
node -v
npm -v
docker -v
```

---  

# Первый запуск проекта

Скопировать репозиторий:

```bash
git clone https://github.com/knilsyansky/pawnshop-pledge.git
cd pawnshop-pledge
```

Установка зависимостей:

```bash
npm run install:all
```
Команда устанавливает зависимости:

root dependencies
backend dependencies
frontend dependencies

--- 

# Запуск проекта

Полная автоматическая настройка:

```bash
npm run dev:setup
```

# Старт сервера (фронт запускается раньше бека, нужно подождать\перезагрузить вкладку):

```bash
npm run dev
```

Команда выполняет:

1 Запуск PostgreSQL в Docker
2 Проверку подключения к БД
3 Применение Prisma migrations
4 Заполнение базы начальными данными
5 Сборку backend
6 Сборку frontend
7 Запуск backend и frontend в dev режиме

---

# E2E тесты

Создание тестовой базы:

```bash
npm run db:create:test
```

Применение тестовых миграций:

```bash
npm run db:migrate:test
```

Запуск:

```bash
npm run test:e2e
```

# Архитектура

## Backend:

NestJS
Prisma ORM
PostgreSQL
упрощенный DDD подход

Основные слои:
```text
.
├── domain
│   ├── value-objects
│   └── domain-services
│   application
│    └── use-cases
│   presentation
│   └── controllers
```


## Frontend:

React
Material UI


# Детали реализации

Параметр overduePeriodDays в настоящее время сохраняется, но не используется, так как расчет просрочки выполняется ежедневно и не имеет ограничений по сроку. Хочетсяы сделать хотя бы базовую авторизацию, структуру DDD сделать более строгой, сейчас инфраструктура немного подлезает в домен, хочется вынести больше value object и entity. Еще меня смущает слишком примитивный фронт, к тому же не оптимизированный и не отрефакторенный. Так же не сразу правильно понял нужную по задаче динамичность полей формы, поэтому сделал не то.
