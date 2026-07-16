import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@mui/material';
import { PageShell } from './PageShell';
import { ClientRecord, fetchClients } from '../api/pledge';
import { redeemPledge } from '../api/pledge';

export function RedeemForm() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | ''>('');
  const [selectedPledgeId, setSelectedPledgeId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeClient = useMemo(() => clients.find((client) => client.id === selectedClient), [clients, selectedClient]);

  useEffect(() => {
    async function load() {
      try {
        const clientsResponse = await fetchClients(true);
        setClients(clientsResponse);
      } catch (e) {
        setError((e as Error).message || 'Не удалось загрузить данные.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedPledge = activeClient?.pledges?.find((pledge) => pledge.id === Number(selectedPledgeId));

  useEffect(() => {
      setSelectedPledgeId('');
  }, [selectedClient]);

  async function handleRedeem() {
    if (!selectedPledge) {
      setError('Выберите залог для выкупа.');
      return;
    }

    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const updatedPledge = await redeemPledge(selectedPledge.id);
      const clientsResponse = await fetchClients();
      setClients(clientsResponse);
      
      setMessage(
        `Залог №${updatedPledge.id} выкуплен. Итоговая сумма: ${updatedPledge.redeemedAmount}.` 
      );
      setSelectedPledgeId('');
    } catch (e) {
      setError((e as Error).message || 'Не удалось выполнить выкуп.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="Выкуп залога" description="Выберите клиента и активный залог для выкупа.">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell title="Выкуп залога" description="Выберите клиента и активный залог для выкупа.">
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

      <Box sx={{ display: 'grid', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="redeem-client-label">Клиент</InputLabel>
          <Select
            labelId="redeem-client-label"
            value={selectedClient}
            label="Клиент"
            onChange={(event) => setSelectedClient(Number(event.target.value))}
          >
            <MenuItem value="">Выберите клиента</MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.fullName} ({client.phone})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedClient === '' ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>Выберите клиента, чтобы увидеть активные залоги.</Typography>
          </Paper>
        ) : activeClient?.pledges?.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>У выбранного клиента нет активных залогов для выкупа.</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="pledge-label">Активный залог</InputLabel>
              <Select
                labelId="pledge-label"
                value={selectedPledgeId}
                label="Активный залог"
                onChange={(event) => setSelectedPledgeId(Number(event.target.value))}
              >
                <MenuItem value="">Выберите залог</MenuItem>
                {activeClient?.pledges?.map((pledge) => (
                  <MenuItem key={pledge.id} value={pledge.id}>
                    №{pledge.id} — {new Date(pledge.dueDate).toLocaleDateString()} — {pledge.amount}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedPledge ? (
              <Box sx={{ mt: 3, display: 'grid', gap: 1 }}>
                <Typography variant="subtitle1">Детали выкупа</Typography>
                <Typography>Сумма залога: {selectedPledge.amount}</Typography>
                <Typography>Тариф: {selectedPledge.tariff.id}</Typography>
                <Typography>Дата до: {new Date(selectedPledge.dueDate).toLocaleDateString()}</Typography>
                <Typography>Процент за основной период: {selectedPledge.tariff.basePeriodRate}%</Typography>
                <Typography>Процент за просрочку в день: {selectedPledge.tariff.overdueRate}%</Typography>
                <Button
                  variant="contained"
                  onClick={handleRedeem}
                  disabled={submitting}
                >
                  {submitting ? 'Вычисление и выкуп…' : 'Выкупить'}
                </Button>
              </Box>
            ) : null}
          </Paper>
        )}
      </Box>
    </PageShell>
  );
}
