const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const supabaseUrl = 'https://ognvdhifpkybcuresxpq.supabase.co';
const supabaseKey = 'sb_publishable_Q0IauriLK0x-W2I8UntpVw_mk1vFwZ2';
const supabase = createClient(supabaseUrl, supabaseKey);

// === Получить все записи ===
app.get('/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// === Создать новую запись ===
app.post('/bookings', async (req, res) => {
  const { name, phone, date, time, service } = req.body;

  const { data: existing, error: checkError } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', date)
    .eq('time', time);

  if (checkError) return res.status(500).json({ error: checkError.message });

  if (existing.length > 0) {
    return res.status(400).json({ error: 'Это время уже занято' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ name, phone, date, time, service, status: 'pending' }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// === НОВОЕ: изменить статус записи (подтвердить/отменить) ===
// PATCH используется, когда меняем только часть записи, а не всю целиком
app.patch('/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // ожидаем 'confirmed' или 'cancelled'

  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// === Полностью удалить запись ===
app.delete('/bookings/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Запись удалена' });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Сервер запущен');
});
