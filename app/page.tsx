"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const MENU_API_URL = "https://9ipjty3nzf.microcms.io/api/v1/menu";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  comment?: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
};

type CartItem = {
  item: MenuItem;
  quantity: number;
};

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(MENU_API_URL, {
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_MICROCMS_API_KEY || "",
      },
    })
      .then((res) => res.json())
      .then((data) => setMenu(data.contents));

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter(
            (entry: any) => entry.item && entry.item.price !== undefined
          );
          setCart(filtered);
        } catch {
          setCart([]);
        }
      }
    }
  }, []);

  const addToCart = (item: MenuItem | undefined) => {
    if (!item) return;

    const existing = cart.find((entry) => entry.item.id === item.id);
    let updatedCart: CartItem[] = [];

    if (existing) {
      updatedCart = cart.map((entry) =>
        entry.item.id === item.id
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry
      );
    } else {
      updatedCart = [...cart, { item, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const incrementCartQty = (id: string) => {
    const updatedCart = cart.map((entry) =>
      entry.item.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const decrementCartQty = (id: string) => {
    const updatedCart = cart
      .map((entry) =>
        entry.item.id === id
          ? { ...entry, quantity: Math.max(1, entry.quantity - 1) }
          : entry
      )
      .filter((entry) => entry.quantity > 0);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (idToRemove: string) => {
    const updatedCart = cart.filter((entry) => entry.item.id !== idToRemove);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, entry) => {
    const price = entry.item?.price || 0;
    const quantity = entry.quantity || 0;
    return sum + price * quantity;
  }, 0);

  return (
    <div className={styles.container}>
      <main className={styles.menuList}>
        <h1 className={styles.title}>メニュー</h1>
        <ul className={styles.list}>
          {menu.map((item) => (
            <li key={item.id} className={styles.item}>
              {item.image && (
                <Image
                  src={item.image.url}
                  alt={item.name}
                  width={item.image.width}
                  height={item.image.height}
                  className={styles.menuImage}
                />
              )}
              <p className={styles.name}>
                {item.name} — {item.price}円
              </p>

              <button
                className={styles.addButton}
                onClick={() => addToCart(item)}
              >
                追加
              </button>

              {item.comment && (
                <p className={styles.comment}>{item.comment}</p>
              )}
              <hr className={styles.separator} />
            </li>
          ))}
        </ul>
      </main>

      {/* ✅ カート (右側) */}
      <aside className={styles.cart}>
        <h2 className={styles.cartTitle}>カート</h2>
        {cart.length === 0 ? (
          <p className={styles.empty}>カートに商品がありません</p>
        ) : (
          <>
            {cart.map((entry) => (
              <div key={entry.item.id} className={styles.cartItem}>
                {entry.item.image && (
                  <Image
                    src={entry.item.image.url}
                    alt={entry.item.name}
                    width={60}
                    height={40}
                    className={styles.cartImage}
                  />
                )}
                <div className={styles.cartInfo}>
                  <p className={styles.cartName}>
                    {entry.item.name} × {entry.quantity} —{" "}
                    {(entry.item.price * entry.quantity).toLocaleString()}円
                  </p>

                  <div className={styles.qtyControl}>
                    <button onClick={() => decrementCartQty(entry.item.id)}>
                      −
                    </button>
                    <span>{entry.quantity}</span>
                    <button onClick={() => incrementCartQty(entry.item.id)}>
                      ＋
                    </button>
                  </div>

                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromCart(entry.item.id)}
                  >
                    取消
                  </button>
                </div>
              </div>
            ))}
            <p className={styles.total}>合計: {total.toLocaleString()}円</p>

            {/* ✅ ボタンをカート内に移動 */}
            <button
              className={styles.checkoutLink}
              onClick={() => router.push("/checkout")}
            >
              お会計へ
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
