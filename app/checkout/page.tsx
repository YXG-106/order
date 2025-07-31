"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

type CartItem = {
  item: MenuItem;
  quantity: number;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [people, setPeople] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const total = cart.reduce((sum, entry) => {
    const price = entry.item?.price || 0;
    const quantity = entry.quantity || 0;
    return sum + price * quantity;
  }, 0);

  const perPerson = people > 0 ? Math.ceil(total / people) : total;

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>会計ページ</h1>

      <h2>注文内容</h2>
      <ul>
        {cart.map((entry, index) => (
          <li key={index}>
            {entry.item.name} × {entry.quantity} —{" "}
            {(entry.item.price * entry.quantity).toLocaleString()}円
          </li>
        ))}
      </ul>

      <h2>合計: {total.toLocaleString()}円</h2>

      <label style={{ display: "block", marginTop: "20px" }}>
        人数を入力：
        <input
          type="number"
          min="1"
          value={people}
          onChange={(e) => setPeople(parseInt(e.target.value))}
          style={{ marginLeft: "10px", width: "60px" }}
        />
        人
      </label>

      <p style={{ marginTop: "10px" }}>
        1人あたり: <strong>{perPerson.toLocaleString()}円</strong>
      </p>
    </main>
  );
}
