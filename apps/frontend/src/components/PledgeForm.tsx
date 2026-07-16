import { useEffect, useState, useTransition } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import { PageShell } from './PageShell';
import {
  fetchCategories,
  fetchClients,
  fetchTariffs,
  createClient,
  createPledge,
  ClientRecord,
  TariffRecord,
  CategoryRecord,
  CreatePledgePayload,
  PledgeItemPayload
} from '../api/pledge';

const blankItem = (categoryId = '', categorySpecification: Record<string, string> = {}) => ({
  categoryId,
  name: '',
  estimatedValue: 0,
  specifications: { ...categorySpecification }
});

function parseRate(value: string) {
  return Number(value.replace(',', '.')) || 0;
}

function calculateReturnInTime(estimatedValue: number, tariff: TariffRecord) {
  return estimatedValue + (estimatedValue * parseRate(tariff.basePeriodRate)) / 100;
}

function calculateOverduePerDay(estimatedValue: number, tariff: TariffRecord) {
  return (estimatedValue * parseRate(tariff.overdueRate)) / 100;
}

export function PledgeForm() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [tariffs, setTariffs] = useState<TariffRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | ''>('');
  const [selectedTariff, setSelectedTariff] = useState<string>('');
  const [items, setItems] = useState<PledgeItemPayload[]>([blankItem()]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientFullName, setNewClientFullName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isPending, startTransition] = useTransition();
  const backendStartHint =
    'Если запросы не проходят, убедитесь, что бэкенд собран и запущен: cd apps/backend && npm run build && npm start.';

  useEffect(() => {
    async function load() {
      try {
        const [clientsResponse, tariffsResponse, categoriesResponse] = await Promise.all([
          fetchClients(),
          fetchTariffs(),
          fetchCategories()
        ]);

        setClients(clientsResponse);
        setTariffs(tariffsResponse);
        setCategories(categoriesResponse);
      } catch (e) {
        const message = (e as Error).message || 'Не удалось загрузить данные.';
        setError(
          message.includes('Failed to fetch') || message.includes('NetworkError')
            ? `Не удалось получить данные с бэкенда. ${backendStartHint}`
            : message
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totals = items.reduce(
    (acc, item) => {
      const estimatedValue = Number(item.estimatedValue || 0);
      const tariff = tariffs.find((t) => t.id === selectedTariff);
      const returnInTime = tariff ? calculateReturnInTime(estimatedValue, tariff) : 0;
      const overduePerDay = tariff ? calculateOverduePerDay(estimatedValue, tariff) : 0;

      return {
        estimated: acc.estimated + estimatedValue,
        returnInTime: acc.returnInTime + returnInTime,
        overduePerDay: acc.overduePerDay + overduePerDay,
        returnWithOneDayOverdue: acc.returnWithOneDayOverdue + (returnInTime + overduePerDay)
      };
    },
    {
      estimated: 0,
      returnInTime: 0,
      overduePerDay: 0,
      returnWithOneDayOverdue: 0
    }
  );

  function updateItem(index: number, changes: Partial<PledgeItemPayload>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item))
    );
  }

  function updateItemSpecification(index: number, key: string, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              specifications: {
                ...item.specifications,
                [key]: value
              }
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [...current, blankItem()]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleCategoryChange(index: number, categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    updateItem(index, {
      categoryId,
      specifications: category ? { ...category.specification } : {}
    });
  }

  async function createClientIfNeeded() {
    if (selectedClient) {
      return Number(selectedClient);
    }

    const name = newClientFullName.trim();
    const phone = newClientPhone.trim();

    if (!name || !phone) {
      throw new Error('Для создания клиента требуется ФИО и телефон.');
    }

    const client = await createClient({ fullName: name, phone });

    startTransition(() => {
      setClients((current) => [...current, client]);
      setSelectedClient(client.id);
      setIsCreatingClient(false);
      setNewClientFullName('');
      setNewClientPhone('');
    });

    return client.id;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedClient && !isCreatingClient) {
      setError('Требуется выбрать клиента или создать нового клиента.');
      return;
    }

    if (isCreatingClient && (!newClientFullName.trim() || !newClientPhone.trim())) {
      setError('Для создания нового клиента заполните ФИО и телефон.');
      return;
    }

    if (!selectedTariff) {
      setError('Требуется выбрать тариф.');
      return;
    }

    if (items.length === 0) {
      setError('Требуется как минимум один предмет залога.');
      return;
    }

    const validItems = items.every(
      (item) => item.categoryId && item.name.trim() && item.estimatedValue > 0
    );

    if (!validItems) {
      setError('Каждый предмет залога должен иметь категорию, наименование и положительную оценочную стоимость.');
      return;
    }

    const clientId = await createClientIfNeeded();

    const payload: CreatePledgePayload = {
      clientId,
      tariffId: selectedTariff,
      items
    };

    setSubmitting(true);

    try {
      const result = await createPledge(payload);
      setMessage(`Залог создан с id ${result.id} и суммой ${result.amount}.`);
      setItems([blankItem()]);
      setSelectedTariff('');
      setSelectedClient('');
    } catch (e) {
      const message = (e as Error).message || 'Не удалось создать залог.';
      setError(
        message.includes('Failed to fetch') || message.includes('NetworkError')
          ? `Не удалось подключиться к бэкенду. ${backendStartHint}`
          : message
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell
        title="Создать залог"
        description="Создайте новый залог, указав клиента, тариф и предметы."
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Создать залог"
      description="Создайте новый залог, указав клиента, тариф и предметы."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="client-label">Клиент</InputLabel>
            <Select
              labelId="client-label"
              value={selectedClient}
              label="Клиент"
              onChange={(event) => setSelectedClient(Number(event.target.value))}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.fullName} ({client.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Новый клиент</Typography>
              <Button size="small" variant="outlined" onClick={() => setIsCreatingClient((current) => !current)}>
                {isCreatingClient ? 'Отмена' : 'Создать клиента'}
              </Button>
            </Box>

            {isCreatingClient ? (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="ФИО"
                  value={newClientFullName}
                  onChange={(event) => setNewClientFullName(event.target.value)}
                  fullWidth
                  disabled={submitting || isPending}
                />
                <TextField
                  label="Телефон"
                  value={newClientPhone}
                  onChange={(event) => setNewClientPhone(event.target.value)}
                  fullWidth
                  disabled={submitting || isPending}
                />
              </Box>
            ) : null}
          </Paper>

          <FormControl fullWidth>
            <InputLabel id="tariff-label">Тариф</InputLabel>
            <Select
              labelId="tariff-label"
              value={selectedTariff}
              label="Тариф"
              onChange={(event) => setSelectedTariff(event.target.value)}
            >
              {tariffs.map((tariff) => (
                <MenuItem key={tariff.id} value={tariff.id}>
                  {tariff.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Предметы залога</Typography>
              <Button variant="outlined" onClick={addItem}>
                Добавить предмет
              </Button>
            </Box>

            {items.map((item, index) => {
              const category = categories.find((category) => category.id === item.categoryId);
              return (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                    <FormControl sx={{ minWidth: 220, flex: 1 }}>
                      <InputLabel id={`category-label-${index}`}>Категория</InputLabel>
                      <Select
                        labelId={`category-label-${index}`}
                        value={item.categoryId}
                        label="Категория"
                        onChange={(event) => handleCategoryChange(index, event.target.value)}
                      >
                        {categories.map((categoryRecord) => (
                          <MenuItem key={categoryRecord.id} value={categoryRecord.id}>
                            {categoryRecord.id}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Наименование"
                      value={item.name}
                      onChange={(event) => updateItem(index, { name: event.target.value })}
                      sx={{ flex: 1, minWidth: 220 }}
                    />

                    <TextField
                      label="Оценочная стоимость"
                      type="number"
                      value={item.estimatedValue}
                      onChange={(event) => updateItem(index, { estimatedValue: Number(event.target.value) })}
                      sx={{ width: 160 }}
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                    />

                    <IconButton color="error" disabled={items.length <= 1} onClick={() => removeItem(index)}>
                      Убрать
                    </IconButton>
                  </Box>

                  {category && (
                    <Box sx={{ display: 'grid', gap: 2, mb: 2 }}>
                      <Typography variant="subtitle2">Характеристики</Typography>
                      {Object.entries(category.specification).map(([key]) => (
                        <TextField
                          key={key}
                          label={key}
                          placeholder={String(item.specifications[key] ?? '')}
                          onChange={(event) => updateItemSpecification(index, key, event.target.value)}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Итоги
            </Typography>
            <Typography>Клиент получает: {totals.estimated.toFixed(2)}</Typography>
            <Typography>Клиент должен вернуть вовремя: {totals.returnInTime.toFixed(2)}</Typography>
            <Typography>Клиент должен вернуть при 1 дне просрочки: {totals.returnWithOneDayOverdue.toFixed(2)}</Typography>
            <Typography>Прирост за каждый день просрочки: {totals.overduePerDay.toFixed(2)}</Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Button type="submit" variant="contained" disabled={submitting || isPending}>
            {submitting || isPending ? 'Отправка…' : 'Создать залог'}
          </Button>
        </Box>
      </Box>
    </PageShell>
  );
}
