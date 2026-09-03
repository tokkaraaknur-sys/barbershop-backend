// ВЕРСИЯ 3: добавлен CORS (разрешение сайту обращаться к серверу)
// и поле service (какая услуга выбрана)

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
// Новый импорт — библиотека для разрешения кросс-доменных запросов
const cors = require('cors');

const app = express();
app.use(express.json());

// Разрешаем ЛЮБОМУ сайту обращаться к этому серверу.
// Для учебного проекта это нормально. В реальном продукте
// тут обычно указывают конкретный адрес твоего сайта.
app.use(cors());

const supabaseUrl = 'https://ognvdhifpkybcuresxpq.supabase.co';
const supabaseKey = 'sb_publishable_Q0IauriLK0x-W2I8UntpVw_mk1vFwZ2';
const supabase = createClient(supabaseUrl, supabaseKey);

// === Получить все записи ===
app.get('/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true }); // сортируем по дате

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// === Создать новую запись ===
app.post('/bookings', async (req, res) => {
  // Теперь принимаем ещё и service (название услуги)
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
    .insert([{ name, phone, date, time, service }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// === Отменить запись по id ===
// Новый маршрут — раньше его не было
app.delete('/bookings/:id', async (req, res) => {
  const { id } = req.params; // берём id прямо из адреса, например /bookings/5

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Запись отменена' });
});

app.listen(3000, () => {
  console.log('Сервер запущен: http://localhost:3000');
});