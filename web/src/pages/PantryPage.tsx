// Pantry page for managing ingredient inventory and quick stock updates.
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type PantryItem = {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  inStock: boolean;
};

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('item');
  const [message, setMessage] = useState('');

  async function loadItems() {
    try {
      const data = await api<{ items: PantryItem[] }>(`/api/pantry`);
      setItems(data.items);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  let messageElement = null;
  if (message) {
    messageElement = <div className="message success">{message}</div>;
  }

  return (
    <section className="stack">
      <div className="section-head pantry-head">
        <div>
          <h1>Pantry</h1>
          <p>Keep track of the ingredients you reach for most and use them to guide what to cook next.</p>
        </div>
      </div>
      {messageElement}
      <form
        className="card pantry-form pantry-form-polished"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await api(`/api/pantry`, { method: 'POST', body: JSON.stringify({ name, quantity, unit, inStock: true }) });
            setName('');
            setQuantity(1);
            setUnit('item');
            loadItems();
          } catch (error) {
            setMessage((error as Error).message);
          }
        }}
      >
        <div className="pantry-form-grid">
          <div className="field">
            <label>Ingredient</label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Garlic, jasmine rice, olive oil..." required />
          </div>
          <div className="field">
            <label>Quantity</label>
            <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required />
          </div>
          <div className="field">
            <label>Unit</label>
            <input value={unit} onChange={(event) => setUnit(event.target.value)} required />
          </div>
          <div className="field pantry-submit-field">
            <label>&nbsp;</label>
            <button className="primary-btn" type="submit">Add item</button>
          </div>
        </div>
      </form>

      <div className="card-grid three pantry-grid-polished">
        {items.map((item) => {
          let stockLabel = 'Out';
          if (item.inStock) {
            stockLabel = 'In stock';
          }

          return (
            <article className="card pantry-item-card" key={item._id}>
              <div className="card-row card-row-start">
                <div>
                  <h3>{item.name}</h3>
                  <p className="card-subtitle">{item.quantity} {item.unit}</p>
                </div>
                <span className="badge">{stockLabel}</span>
              </div>
              <div className="card-actions">
                <button className="ghost-btn inline-btn" type="button" onClick={async () => {
                  await api(`/api/pantry/${item._id}`, { method: 'DELETE' });
                  loadItems();
                }}>Remove</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
