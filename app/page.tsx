

"use client"; // クライアントコンポーネント宣言、このコードはクライアント（ブラウザ）側で動く。  Next.js では何も書かなければサーバーコンポーネントになります。

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

const MENU_API_URL = "https://9ipjty3nzf.microcms.io/api/v1/menu"; // microCMS のエンドポイント URL

// データをセットする配列を用意
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

export default function MenuPage() {
// menu,cart 表示データを入れる配列、
// setMenu,setCart は、menu,cart を更新する関数function
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const router = useRouter(); //画面移動で使用

  // useEffect(() => { fetch(...); }, []); 画面の準備が終わったタイミングでmicroCMSからデータを取得する
  useEffect(() => {
    // CMSからメニューデータ取得
    fetch(MENU_API_URL, {
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_MICROCMS_API_KEY || "",
      },
    })
      // => はアロー関数といいます。functionを短く書いたのもです。
      // 例　これを短く書いたものです
      // .then(function(res) {
      //   return res.json()
      // })
      // res.json();の戻り値が res に入ります。
      .then((res) => res.json()) // 文字列からオブジェクトへ変換
      .then((data) => setMenu(data.contents)); // res オブジェクト が data に入る return が呼ばれる
      // 下記のように書き換えるとdataの中をブラウザ console で確認できます。
      // .then((data) => {
      //   setMenu(data.contents);
      //   console.table(data.contents); // contents 配列をテーブル形式で表示
      // });

 const saved = localStorage.getItem("cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);

  const addToCart = (item: MenuItem) => {
    const updated = [...cart, item];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeFromCart = (indexToRemove: number) => {
    const updated = cart.filter((_, i) => i !== indexToRemove);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.container}>
      <main className={styles.menuList}>
        <h1 className={styles.title}>မီနူး</h1>
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
                onClick={() => router.push(`/confirm/${item.id}`)}
              >
                追加
              </button>
              {item.comment && <p className={styles.comment}>{item.comment}</p>}
              <hr className={styles.separator} />
            </li>
          ))}
        </ul>
        <Link href="/cart" className={styles.checkoutLink}>
          注文確認へ進む
        </Link>
      </main>

      <aside className={styles.cart}>
        <h2 className={styles.cartTitle}>မှာထားသည့်ပစ္စည်းများ</h2>
        {cart.length === 0 ? (
          <p className={styles.empty}>မသတ်မှတ်ရသေးပါ။</p>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={`${item.id}-${i}`} className={styles.cartItem}>
                {item.image && (
                  <Image
                    src={item.image.url}
                    alt={item.name}
                    width={60}
                    height={40}
                    className={styles.cartImage}
                  />
                )}
                <div className={styles.cartInfo}>
                  <p className={styles.cartName}>
                    {item.name} — {item.price}円
                  </p>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromCart(i)}
                  >
                    ဖျက်မည်
                  </button>
                </div>
              </div>
            ))}
            <p className={styles.total}>စုစုပေါင်း: {total.toLocaleString()}円</p>
          </>
        )}
      </aside>
    </div>
  );
}